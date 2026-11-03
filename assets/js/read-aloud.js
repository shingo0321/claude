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

  function clean(t) {
    return t.replace(/`/g, "").replace(/https?:\/\/\S+/g, "リンク").replace(/\s+/g, " ").trim();
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
      var isH = el.tagName.charAt(0) === "H";
      if (isH) text = text.replace(/^\d+\.\s*/, "") + "。";
      if (text) out.push({ el: live ? el : null, text: text, note: note, tag: el.tagName, head: isH ? text.replace(/。$/, "") : "" });
    });
    return out;
  }

  function pickVoice() {
    var voices = synth.getVoices().filter(function (v) { return /^ja/i.test(v.lang); });
    if (!voices.length) return null;
    var byName = voices.filter(function (v) { return v.name === saved.voice; })[0];
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
      var u = new SpeechSynthesisUtterance(it.text);
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
    setUI();
    // Safariはユーザー操作の中で直接speak()しないと無音になるため、遅延させず同期で呼ぶ
    speakNext(token);
  }

  function stop() {
    token++;
    synth.cancel();
    state = "stopped";
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
      synth.pause(); state = "paused"; setUI();
    } else {
      synth.resume(); state = "playing"; setUI();
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
      list.forEach(function (v) {
        var o = document.createElement("option");
        o.value = v.name;
        o.textContent = v.name.replace(/ - Japanese.*$/, "").replace(/^Microsoft /, "");
        if (saved.voice === v.name) o.selected = true;
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
      }).catch(function () { allBox.textContent = "ノートの読み込みに失敗しました。"; });
    } else {
      var main = document.querySelector(".main-content");
      var h1 = main && main.querySelector("h1");
      if (!h1) return;
      items = collect(main, "", true);
      build(null, h1);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
