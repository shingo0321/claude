/* 学習ノートの音声読み上げ(ブラウザ内蔵のWeb Speech APIを使用。音声ファイルは不要)。
   ・topicsフォルダのnotesページ: そのノートを読み上げる再生バーを表示
   ・試験区分のトップページ(#read-aloud-all がある): その試験の全ノートを順に連続で読み上げる */
(function () {
  "use strict";
  if (!("speechSynthesis" in window)) return;
  var allBox = document.getElementById("read-aloud-all");
  var single = /\/topics\//.test(location.pathname);
  if (!allBox && !single) return;

  var synth = window.speechSynthesis;
  var STORE = "claude-study-readaloud";
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORE) || "{}"); } catch (e) {}

  var items = [];      // {el, text, note, tag, head, i}
  var idx = 0;
  var state = "stopped"; // stopped | playing | paused
  var token = 0;
  var rate = saved.rate || 1;
  var pitch = saved.pitch || 1;
  var lastUtter = null;
  var wakeLock = null;

  // 再生中は画面が消えないようにする(消えるとスマホでは読み上げが止まるため)。未対応の端末では何もしない。
  function lockScreen() {
    if (!navigator.wakeLock || wakeLock) return;
    navigator.wakeLock.request("screen").then(function (l) {
      wakeLock = l;
      l.addEventListener("release", function () { wakeLock = null; });
    }).catch(function () {});
  }
  function unlockScreen() {
    if (wakeLock) { wakeLock.release().catch(function () {}); wakeLock = null; }
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && state === "playing") lockScreen();
  });

  function clean(t) {
    return t.replace(/`/g, "").replace(/https?:\/\/\S+/g, "リンク").replace(/\s+/g, " ").trim();
  }

  // 読み辞書(read-aloud-dict.js)を適用して、読み上げ用の文字列にする。画面の表示は変えない。
  var dictMap = null, dictRe = null;
  var LETTERS = { A: "エー", B: "ビー", C: "シー", D: "ディー", E: "イー", F: "エフ", G: "ジー", H: "エイチ", I: "アイ", J: "ジェイ", K: "ケー", L: "エル", M: "エム", N: "エヌ", O: "オー", P: "ピー", Q: "キュー", R: "アール", S: "エス", T: "ティー", U: "ユー", V: "ブイ", W: "ダブリュー", X: "エックス", Y: "ワイ", Z: "ゼット" };
  function buildDict() {
    var d = window.READ_ALOUD_DICT || {};
    dictMap = {};
    var keys = Object.keys(d);
    keys.forEach(function (k) { dictMap[k.toLowerCase()] = d[k]; });
    keys.sort(function (x, y) { return y.length - x.length; });
    if (keys.length) {
      var esc = keys.map(function (k) { return k.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&"); });
      dictRe = new RegExp("(^|[^A-Za-z0-9])(" + esc.join("|") + ")(?![A-Za-z0-9])", "gi");
    }
  }
  function pron(text) {
    if (dictMap === null) buildDict();
    var t = text;
    if (dictRe) t = t.replace(dictRe, function (m, pre, w) { return pre + (dictMap[w.toLowerCase()] || w); });
    // 辞書にない英大文字の略語はアルファベット読み
    t = t.replace(/(^|[^A-Za-z0-9])([A-Z]{2,6})(?![A-Za-z0-9])/g, function (m, pre, w) {
      return pre + w.split("").map(function (c) { return LETTERS[c]; }).join("");
    });
    return t.replace(/_/g, " ");
  }

  function collect(main, note, live) {
    var out = [];
    main.querySelectorAll("h1,h2,h3,h4,p,li,tr").forEach(function (el) {
      if (el.closest("pre,.mermaid,#read-aloud-bar,#read-aloud-all,nav,.highlighter-rouge")) return;
      var text;
      if (el.tagName === "LI" && el.querySelector("li")) {
        var c = el.cloneNode(true);
        c.querySelectorAll("ul,ol").forEach(function (n) { n.remove(); });
        text = clean(c.textContent);
      } else if (el.tagName === "TR") {
        text = [].map.call(el.children, function (c) { return clean(c.textContent); }).filter(Boolean).join("。 ");
      } else {
        if (el.tagName === "P" && el.closest("li,td,th")) return;
        text = clean(el.textContent);
      }
      if (/^(出典|注記)\s*[::]/.test(text)) return; // 出典・注記は読み上げない
      var isH = el.tagName.charAt(0) === "H";
      if (isH) text = text.replace(/^\d+\.\s*/, "") + "。";
      if (text) out.push({ el: live ? el : null, text: text, note: note, tag: el.tagName, head: isH ? text.replace(/。$/, "") : "" });
    });
    return out;
  }

  function pickVoice() {
    var voices = synth.getVoices().filter(function (v) { return /^ja/i.test(v.lang); });
    if (!voices.length) return null;
    var byName = voices.filter(function (v) { return (v.voiceURI || v.name) === saved.voice; })[0];
    // 自動選択: 高品質(Natural/Neural/Siri/拡張)→ 代表的な声 → 先頭の順
    var hq = voices.filter(function (v) { return /Natural|Neural|Siri|Enhanced|Premium|拡張|Nanami/i.test(v.name); });
    var pref = voices.filter(function (v) { return /Google|Kyoko|Haruka|Otoya/i.test(v.name); });
    return byName || hq[0] || pref[0] || voices[0];
  }

  var bar, btnPlay, selRate, selPitch, selVoice, selJump, info, curEl;

  function highlight(el) {
    if (curEl) curEl.style.background = "";
    curEl = el;
    if (el) {
      el.style.background = "#fff3bf";
      var r = el.getBoundingClientRect();
      if (r.top < 90 || r.bottom > innerHeight - 40) el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  // プルダウンを「今読んでいる見出し」に合わせる(停止中は先頭の案内文)
  function syncJump() {
    if (!selJump) return;
    var cur = "";
    if (state !== "stopped") {
      for (var k = 0; k < selJump.options.length; k++) {
        var v = selJump.options[k].value;
        if (v !== "" && parseInt(v, 10) <= idx) cur = v;
      }
    }
    selJump.value = cur;
  }

  function setUI() {
    btnPlay.textContent = state === "playing" ? "⏸ 一時停止" : (state === "paused" ? "▶ 再開" : (allBox ? "▶ 全ノートを読み上げ" : "▶ 読み上げ"));
    syncJump();
    if (state === "stopped") { info.textContent = ""; return; }
    var it = items[idx];
    info.textContent = (it && it.note ? it.note + " ｜ " : "") + (idx + 1) + " / " + items.length;
  }

  function speakNext(my) {
    if (my !== token) return;
    if (idx >= items.length) { stop(); return; }
    var it = items[idx];
    highlight(it.el);
    setUI();
    var tried = 0;
    function say(useVoice) {
      var u = new SpeechSynthesisUtterance(pron(it.text));
      lastUtter = u; // GCで終了イベントが失われるのを防ぐ
      u.lang = "ja-JP";
      var v = useVoice ? pickVoice() : null;
      if (v) u.voice = v;
      u.rate = rate;
      u.pitch = pitch;
      var started = false;
      u.onstart = function () { started = true; };
      u.onend = function () { if (my === token && state === "playing") { idx++; speakNext(my); } };
      u.onerror = function (e) {
        if (my !== token || e.error === "canceled" || e.error === "interrupted") return;
        if (useVoice && !tried++) { say(false); return; } // 声指定を外して再試行
        stop();
        info.textContent = "読み上げエラー: " + e.error;
      };
      synth.speak(u);
      // 無音のまま始まらない場合の保険(再開してから既定の声でやり直す)
      setTimeout(function () {
        if (my === token && state === "playing" && !started && !synth.speaking) { synth.cancel(); if (!tried++) say(false); }
      }, 2500);
    }
    say(true);
  }

  function playFrom(i) {
    token++;
    if (synth.speaking || synth.pending) synth.cancel();
    idx = Math.max(0, Math.min(i, items.length - 1));
    state = "playing";
    lockScreen();
    setUI();
    // Safariはユーザー操作の中で直接speak()しないと無音になるため、遅延させず同期で呼ぶ
    speakNext(token);
  }

  function stop() {
    token++;
    synth.cancel();
    state = "stopped";
    unlockScreen();
    idx = 0;
    highlight(null);
    setUI();
  }

  function toggle() {
    if (state === "stopped") {
      var start = 0;
      if (!allBox) {
        for (var i = 0; i < items.length; i++) {
          if (items[i].el.getBoundingClientRect().top >= 0) { start = i; break; }
        }
      }
      playFrom(start);
    } else if (state === "playing") {
      synth.pause(); state = "paused"; unlockScreen(); setUI();
    } else {
      synth.resume(); state = "playing"; lockScreen(); setUI();
    }
  }

  function mk(label, fn, title) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = label; b.onclick = fn;
    if (title) b.title = title;
    b.style.cssText = "padding:.3rem .7rem;border:1px solid #888;border-radius:4px;background:#fff;cursor:pointer;font-size:.85rem;";
    return b;
  }

  function build(host, after) {
    if (!items.length) return;
    items.forEach(function (it, i) { it.i = i; });

    bar = document.createElement("div");
    bar.id = "read-aloud-bar";
    bar.style.cssText = "position:sticky;top:0;z-index:50;display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;" +
      "padding:.5rem .75rem;margin:.5rem 0 1rem;background:#f5f7fa;border:1px solid #d0d7de;border-radius:6px;font-size:.85rem;";

    btnPlay = mk("▶ 読み上げ", toggle);
    var btnStop = mk("■ 停止", stop);
    var btnPrev = mk("⏮", function () { if (state !== "stopped") playFrom(idx - 1); }, "前の項目");
    var btnNext = mk("⏭", function () { if (state !== "stopped") playFrom(idx + 1); }, "次の項目");

    selRate = document.createElement("select");
    [0.8, 1, 1.2, 1.5, 2].forEach(function (r) {
      var o = document.createElement("option");
      o.value = r; o.textContent = "速度 ×" + r;
      if (r === rate) o.selected = true;
      selRate.appendChild(o);
    });
    selRate.onchange = function () {
      rate = parseFloat(selRate.value);
      try { saved.rate = rate; localStorage.setItem(STORE, JSON.stringify(saved)); } catch (e) {}
      if (state !== "stopped") playFrom(idx);
    };

    function save() { try { localStorage.setItem(STORE, JSON.stringify(saved)); } catch (e) {} }

    selPitch = document.createElement("select");
    [[0.8, "低め"], [1, "標準"], [1.2, "高め"], [1.4, "かなり高め"]].forEach(function (p) {
      var o = document.createElement("option");
      o.value = p[0]; o.textContent = "声の高さ " + p[1];
      if (p[0] === pitch) o.selected = true;
      selPitch.appendChild(o);
    });
    selPitch.onchange = function () {
      pitch = parseFloat(selPitch.value);
      saved.pitch = pitch; save();
      if (state === "playing") playFrom(idx);
    };

    selVoice = document.createElement("select");
    selVoice.style.maxWidth = "14rem";
    function fillVoices() {
      var list = synth.getVoices().filter(function (v) { return /^ja/i.test(v.lang); });
      selVoice.textContent = "";
      var auto = document.createElement("option");
      auto.value = ""; auto.textContent = list.length ? "声: 自動" : "声: (日本語の声なし)";
      selVoice.appendChild(auto);
      var seen = {};
      list.forEach(function (v) {
        var id = v.voiceURI || v.name;
        var base = v.name.replace(/ - Japanese.*$/, "").replace(/^Microsoft /, "");
        var label = base;
        // 同名の声は、URI末尾(品質など)や通番で見分ける
        if (seen[base]) {
          var tail = (v.voiceURI || "").split(/[./]/).pop();
          label += " (" + (tail && tail !== v.name ? tail : "別版" + seen[base]) + ")";
        }
        seen[base] = (seen[base] || 1) + 1;
        var o = document.createElement("option");
        o.value = id;
        o.textContent = label;
        if (saved.voice === id) o.selected = true;
        selVoice.appendChild(o);
      });
      if (!saved.voice) selVoice.value = "";
    }
    selVoice.onchange = function () {
      saved.voice = selVoice.value; save();
      if (state === "playing") playFrom(idx);
    };
    fillVoices();
    if (synth.addEventListener) synth.addEventListener("voiceschanged", fillVoices);

    selJump = document.createElement("select");
    var o0 = document.createElement("option");
    o0.textContent = allBox ? "ノート・見出しへ移動…" : "見出しへ移動…";
    o0.value = "";
    selJump.appendChild(o0);
    items.forEach(function (it) {
      var isNote = allBox && it.tag === "H1";
      if (isNote || it.tag === "H2" || (!allBox && it.tag === "H3")) {
        var o = document.createElement("option");
        o.value = it.i;
        o.textContent = (isNote ? "■ " : (it.tag === "H3" ? "　　" : "　")) + (isNote ? (it.note || it.head) : it.head);
        selJump.appendChild(o);
      }
    });
    selJump.onchange = function () {
      if (selJump.value !== "") playFrom(parseInt(selJump.value, 10));
    };
    selJump.style.maxWidth = "16rem";

    info = document.createElement("span");
    info.style.color = "#555";

    [btnPlay, btnPrev, btnNext, btnStop, selRate, selPitch, selVoice, selJump, info].forEach(function (n) { bar.appendChild(n); });
    if (host) host.appendChild(bar); else after.parentNode.insertBefore(bar, after.nextSibling);

    window.addEventListener("beforeunload", function () { synth.cancel(); });
    synth.getVoices();
    setUI();
  }

  /* ---- 音声ファイル(MP3)のプレイヤー: 画面ロック中・別アプリ使用中も再生できる ---- */
  function audioUrl(noteUrl) {
    return noteUrl.replace(/topics\/([^/]+)\/notes(\.html)?\/?$/, "audio/$1.mp3");
  }
  function exists(url) {
    return fetch(url, { method: "HEAD" }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }
  function audioPlayer(tracks, withList) {
    var wrap = document.createElement("div");
    wrap.style.cssText = "margin:.5rem 0 1rem;padding:.6rem .75rem;background:#eef6ff;border:1px solid #b6d4f2;border-radius:6px;font-size:.85rem;";
    var head = document.createElement("div");
    head.style.cssText = "margin-bottom:.4rem;font-weight:600;";
    head.textContent = "🎧 音声ファイルで再生(画面ロック中も続きます)";
    var au = document.createElement("audio");
    au.controls = true; au.preload = "none"; au.style.cssText = "width:100%;";
    var row = document.createElement("div");
    row.style.cssText = "display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-top:.4rem;";
    var cur = 0;
    var arate = saved.arate || 1;

    function load(i, play) {
      cur = Math.max(0, Math.min(i, tracks.length - 1));
      au.src = tracks[cur].src;
      au.playbackRate = arate;
      if (sel) sel.value = cur;
      if ("mediaSession" in navigator && window.MediaMetadata) {
        navigator.mediaSession.metadata = new MediaMetadata({ title: tracks[cur].title, artist: "Claude認定資格 学習ノート" });
      }
      if (play) au.play().catch(function () {});
    }
    au.addEventListener("loadedmetadata", function () { au.playbackRate = arate; });
    au.addEventListener("play", function () { au.playbackRate = arate; });
    au.addEventListener("ended", function () { if (cur < tracks.length - 1) load(cur + 1, true); });

    var sel = null;
    if (withList) {
      sel = document.createElement("select");
      sel.style.maxWidth = "100%";
      tracks.forEach(function (t, i) {
        var o = document.createElement("option");
        o.value = i; o.textContent = t.title;
        sel.appendChild(o);
      });
      sel.onchange = function () { load(parseInt(sel.value, 10), true); };
      row.appendChild(mk("⏮ 前のノート", function () { load(cur - 1, true); }));
      row.appendChild(mk("次のノート ⏭", function () { load(cur + 1, true); }));
      row.appendChild(sel);
    }
    var sr = document.createElement("select");
    [0.8, 1, 1.2, 1.5, 1.8, 2].forEach(function (r) {
      var o = document.createElement("option");
      o.value = r; o.textContent = "速度 ×" + r;
      if (r === arate) o.selected = true;
      sr.appendChild(o);
    });
    sr.onchange = function () {
      arate = parseFloat(sr.value);
      au.playbackRate = arate;
      saved.arate = arate;
      try { localStorage.setItem(STORE, JSON.stringify(saved)); } catch (e) {}
    };
    row.appendChild(sr);

    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.setActionHandler("previoustrack", withList ? function () { load(cur - 1, true); } : null);
        navigator.mediaSession.setActionHandler("nexttrack", withList ? function () { load(cur + 1, true); } : null);
      } catch (e) {}
    }
    // ブラウザの読み上げと同時に鳴らないよう、音声ファイルの再生開始で読み上げを止める
    au.addEventListener("play", function () { if (state !== "stopped") stop(); });
    load(0, false);
    wrap.appendChild(head); wrap.appendChild(au); wrap.appendChild(row);
    return wrap;
  }

  function init() {
    if (allBox) {
      var urls = (allBox.getAttribute("data-urls") || "").split(",").filter(Boolean);
      var titles = (allBox.getAttribute("data-titles") || "").split("|");
      allBox.textContent = "全ノートを読み込み中…";
      Promise.all(urls.map(function (u) {
        return fetch(u).then(function (r) { if (!r.ok) throw new Error(u); return r.text(); });
      })).then(function (htmls) {
        allBox.textContent = "";
        htmls.forEach(function (h, n) {
          var doc = new DOMParser().parseFromString(h, "text/html");
          var main = doc.querySelector(".main-content");
          if (main) items = items.concat(collect(main, titles[n] || "", false));
        });
        build(allBox);
        Promise.all(urls.map(function (u) { return exists(audioUrl(u)); })).then(function (oks) {
          var tracks = [];
          urls.forEach(function (u, n) { if (oks[n]) tracks.push({ title: titles[n] || ("ノート" + (n + 1)), src: audioUrl(u) }); });
          if (tracks.length) allBox.insertBefore(audioPlayer(tracks, true), allBox.firstChild);
        });
      }).catch(function () { allBox.textContent = "ノートの読み込みに失敗しました。"; });
    } else {
      var main = document.querySelector(".main-content");
      var h1 = main && main.querySelector("h1");
      if (!h1) return;
      items = collect(main, "", true);
      build(null, h1);
      var au = audioUrl(location.pathname);
      if (au !== location.pathname) {
        exists(au).then(function (ok) {
          if (ok) h1.parentNode.insertBefore(audioPlayer([{ title: h1.textContent.trim(), src: au }], false), h1.nextSibling);
        });
      }
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
