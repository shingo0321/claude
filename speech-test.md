---
layout: default
title: 音声テスト
nav_exclude: true
search_exclude: true
---

# 音声読み上げテスト

上から順に押して、画面の「ログ」を教えてください。

<div id="st-btns" style="display:flex;flex-direction:column;gap:.6rem;max-width:22rem"></div>

<pre id="st-log" style="white-space:pre-wrap;margin-top:1rem;padding:.6rem;background:#f5f7fa;border:1px solid #d0d7de;font-size:.8rem;min-height:8rem"></pre>

<script>
(function () {
  var log = document.getElementById("st-log");
  function L(m) { log.textContent += m + "\n"; }
  var synth = window.speechSynthesis;
  L("speechSynthesis: " + (synth ? "あり" : "なし"));
  L("UA: " + navigator.userAgent);
  function voices() { return synth.getVoices(); }
  function ja() { return voices().filter(function (v) { return /^ja/i.test(v.lang); }); }
  function say(label, opts) {
    return function () {
      L("--- " + label);
      var u = new SpeechSynthesisUtterance("音声のテストです");
      if (opts.lang) u.lang = "ja-JP";
      if (opts.voice) {
        var j = ja();
        L("日本語の声: " + j.length + "件 " + j.slice(0, 3).map(function (v) { return v.name; }).join(", "));
        if (j[0]) u.voice = j[0];
      }
      ["start", "end", "error", "pause", "resume"].forEach(function (t) {
        u["on" + t] = function (e) { L("event: " + t + (e.error ? " (" + e.error + ")" : "")); };
      });
      L("speak前 speaking=" + synth.speaking + " pending=" + synth.pending + " paused=" + synth.paused);
      synth.speak(u);
      L("speak後 speaking=" + synth.speaking + " pending=" + synth.pending);
      setTimeout(function () { L("2秒後 speaking=" + synth.speaking + " pending=" + synth.pending); }, 2000);
    };
  }
  var box = document.getElementById("st-btns");
  [["① 声・言語の指定なし", {}], ["② 言語だけ指定(ja-JP)", { lang: 1 }], ["③ 日本語の声を指定", { lang: 1, voice: 1 }]].forEach(function (a) {
    var b = document.createElement("button");
    b.textContent = a[0]; b.style.padding = ".6rem";
    b.onclick = say(a[0], a[1]);
    box.appendChild(b);
  });
  var r = document.createElement("button");
  r.textContent = "④ 停止して状態をリセット"; r.style.padding = ".6rem";
  r.onclick = function () { synth.cancel(); L("cancel実行"); };
  box.appendChild(r);
  setTimeout(function () { L("声の総数: " + voices().length + " / 日本語: " + ja().length); }, 800);
})();
</script>
