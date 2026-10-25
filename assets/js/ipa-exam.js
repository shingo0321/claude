/*
 * IPA高度試験 過去問演習エンジン(共通)。
 * 問題文はIPAの著作物のため収録せず、公式PDFを別タブで開いて解答する方式。
 * 各ページで window.IPA_EXAM_DATA を定義するデータJSと合わせて読み込む。
 *
 * IPA_EXAM_DATA = {
 *   storageKey: "ipa-am2-pm",
 *   title: "午前II(PM)",
 *   sets: [{ id: "R07", label: "令和7年度 秋期", qsUrl, ansUrl, answers: "エイア…" }],
 *   // 任意: 問題ごとの補足。キーは "<setId>-<問番号>"
 *   notes: { "R07-5": { field: "分野名", explanation: "自作解説" } }
 * }
 */
(function () {
  "use strict";

  var CHOICES = ["ア", "イ", "ウ", "エ"];

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function load(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || {};
    } catch (e) {
      return {};
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* 保存できなくても演習は続行する */
    }
  }

  var STYLE = "\n"
    + "#ipa-exam-app .ie-bar { display: flex; flex-wrap: wrap; gap: 0.6rem 1rem; align-items: center; margin-bottom: 1rem; }\n"
    + "#ipa-exam-app select, #ipa-exam-app .ie-btn { font-size: 0.95rem; padding: 0.4rem 0.8rem; border-radius: 6px; border: 1px solid #d0d7de; background: #fff; cursor: pointer; }\n"
    + "#ipa-exam-app .ie-btn.primary { background: #0969da; border-color: #0969da; color: #fff; font-weight: 600; }\n"
    + "#ipa-exam-app .ie-stats { font-size: 0.9rem; color: #57606a; }\n"
    + "#ipa-exam-app .ie-links a { margin-right: 1rem; }\n"
    + "#ipa-exam-app .ie-q { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; border: 1px solid #d0d7de; border-radius: 8px; padding: 0.5rem 0.8rem; margin-bottom: 0.5rem; }\n"
    + "#ipa-exam-app .ie-q.ok { background: #dafbe1; border-color: #1a7f37; }\n"
    + "#ipa-exam-app .ie-q.ng { background: #ffebe9; border-color: #cf222e; }\n"
    + "#ipa-exam-app .ie-qnum { font-weight: 700; min-width: 3.2rem; }\n"
    + "#ipa-exam-app .ie-choice { min-width: 2.6rem; }\n"
    + "#ipa-exam-app .ie-choice.picked { outline: 2px solid #0969da; }\n"
    + "#ipa-exam-app .ie-result { font-weight: 700; }\n"
    + "#ipa-exam-app .ie-note { flex-basis: 100%; font-size: 0.88rem; color: #24292f; margin: 0; }\n"
    + "#ipa-exam-app .ie-tag { font-size: 0.78rem; color: #0969da; background: #ddf4ff; padding: 0.1rem 0.5rem; border-radius: 999px; }\n";

  function init() {
    var root = document.getElementById("ipa-exam-app");
    var data = window.IPA_EXAM_DATA;
    if (!root || !data) return;

    var style = document.createElement("style");
    style.textContent = STYLE;
    document.head.appendChild(style);

    var notes = data.notes || {};
    var state = { setId: data.sets[0].id, onlyWrong: false };
    // 履歴: { "<setId>-<no>": { picked: "ア", ok: true } }
    var history = load(data.storageKey);

    function currentSet() {
      return data.sets.filter(function (s) {
        return s.id === state.setId;
      })[0];
    }

    function stats(set) {
      var done = 0;
      var ok = 0;
      for (var i = 1; i <= set.answers.length; i++) {
        var h = history[set.id + "-" + i];
        if (h) {
          done++;
          if (h.ok) ok++;
        }
      }
      return { done: done, ok: ok, total: set.answers.length };
    }

    function render() {
      var set = currentSet();
      var st = stats(set);
      var opts = data.sets
        .map(function (s) {
          return '<option value="' + esc(s.id) + '"' + (s.id === set.id ? " selected" : "") + ">" + esc(s.label) + "</option>";
        })
        .join("");

      var html = '<div class="ie-bar">'
        + '<label>年度: <select id="ie-set">' + opts + "</select></label>"
        + '<label><input type="checkbox" id="ie-wrong"' + (state.onlyWrong ? " checked" : "") + "> 不正解のみ表示</label>"
        + '<button type="button" class="ie-btn" id="ie-reset">この年度の記録を消去</button>'
        + "</div>"
        + '<p class="ie-links">'
        + '<a href="' + esc(set.qsUrl) + '" target="_blank" rel="noopener">問題冊子(IPA公式PDF)</a>'
        + '<a href="' + esc(set.ansUrl) + '" target="_blank" rel="noopener">解答例(IPA公式PDF)</a></p>'
        + '<p class="ie-stats">' + esc(data.title) + " / " + esc(set.label) + ": 解答済み " + st.done + " / " + st.total
        + "、正解 " + st.ok + (st.done ? "(正答率 " + Math.round((st.ok / st.done) * 100) + "%)" : "") + "</p>";

      for (var no = 1; no <= set.answers.length; no++) {
        var key = set.id + "-" + no;
        var h = history[key];
        if (state.onlyWrong && !(h && !h.ok)) continue;
        var cls = h ? (h.ok ? "ok" : "ng") : "";
        var buttons = CHOICES.map(function (c) {
          return '<button type="button" class="ie-btn ie-choice' + (h && h.picked === c ? " picked" : "")
            + '" data-key="' + key + '" data-no="' + no + '" data-c="' + c + '"' + (h ? " disabled" : "") + ">" + c + "</button>";
        }).join("");
        var n = notes[key] || {};
        var result = h
          ? '<span class="ie-result">' + (h.ok ? "正解" : "不正解(正解: " + set.answers.charAt(no - 1) + ")") + "</span>"
          : "";
        html += '<div class="ie-q ' + cls + '">'
          + '<span class="ie-qnum">問' + no + "</span>" + buttons + result
          + (n.field ? '<span class="ie-tag">' + esc(n.field) + "</span>" : "")
          + (h && n.explanation ? '<p class="ie-note"><strong>解説: </strong>' + esc(n.explanation) + "</p>" : "")
          + "</div>";
      }
      root.innerHTML = html;
    }

    root.addEventListener("change", function (e) {
      if (e.target.id === "ie-set") {
        state.setId = e.target.value;
        render();
      } else if (e.target.id === "ie-wrong") {
        state.onlyWrong = e.target.checked;
        render();
      }
    });

    root.addEventListener("click", function (e) {
      var t = e.target;
      if (t.id === "ie-reset") {
        var set = currentSet();
        for (var i = 1; i <= set.answers.length; i++) delete history[set.id + "-" + i];
        save(data.storageKey, history);
        render();
      } else if (t.classList && t.classList.contains("ie-choice")) {
        var set2 = currentSet();
        var key = t.getAttribute("data-key");
        var no = Number(t.getAttribute("data-no"));
        var picked = t.getAttribute("data-c");
        if (history[key]) return;
        history[key] = { picked: picked, ok: set2.answers.charAt(no - 1) === picked };
        save(data.storageKey, history);
        render();
      }
    });

    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
