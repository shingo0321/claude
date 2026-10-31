/*
 * 模擬試験エンジン(共通)。study/claude/<exam>/mock-exam/ 配下の各ページから、
 * その試験専用の mock-exam-data.js (window.MOCK_EXAM_DATA を定義) と合わせて読み込む。
 */
(function () {
  "use strict";

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // 元データの英日テキストには `code` と **bold** のみ含まれる想定。
  // 必ずHTMLエスケープしてから変換することで、"<instructions>" のような
  // 選択肢中の文字列がタグとして解釈されるのを防ぐ。
  function formatText(s) {
    var out = escapeHtml(s);
    out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    return out;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function formatClock(totalSeconds) {
    var s = Math.max(0, Math.round(totalSeconds));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return (m < 10 ? "0" + m : m) + ":" + (r < 10 ? "0" + r : r);
  }

  var STYLE = "\n"
    + "#mock-exam-app { font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Hiragino Sans\", \"Yu Gothic\", sans-serif; }\n"
    + "#mock-exam-app .me-intro { border: 1px solid #d0d7de; border-radius: 10px; padding: 1.5rem; background: #f6f8fa; }\n"
    + "#mock-exam-app .me-intro dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.3rem 1rem; margin: 1rem 0; }\n"
    + "#mock-exam-app .me-intro dt { color: #57606a; }\n"
    + "#mock-exam-app .me-intro dd { margin: 0; font-weight: 600; }\n"
    + "#mock-exam-app .me-btn { display: inline-block; padding: 0.6rem 1.4rem; border-radius: 6px; border: none; background: #0969da; color: #fff; font-size: 1rem; font-weight: 600; cursor: pointer; }\n"
    + "#mock-exam-app .me-btn:hover { background: #0757ba; }\n"
    + "#mock-exam-app .me-btn.me-btn-secondary { background: #57606a; }\n"
    + "#mock-exam-app .me-btn.me-btn-secondary:hover { background: #424a53; }\n"
    + "#mock-exam-app .me-note { color: #57606a; font-size: 0.85rem; }\n"
    + "#mock-exam-app .me-panel { position: sticky; top: 0.5rem; z-index: 5; border: 1px solid #d0d7de; border-radius: 10px; background: #fff; padding: 0.8rem 1rem; margin-bottom: 1.2rem; box-shadow: 0 2px 8px rgba(27,31,36,0.08); display: flex; flex-wrap: wrap; align-items: center; gap: 0.8rem 1.5rem; }\n"
    + "#mock-exam-app .me-panel-item { font-size: 0.9rem; color: #24292f; }\n"
    + "#mock-exam-app .me-panel-item strong { font-size: 1.05rem; }\n"
    + "#mock-exam-app .me-timer.me-timer-warn { color: #cf222e; font-weight: 700; }\n"
    + "#mock-exam-app .me-panel-spacer { flex: 1; }\n"
    + "#mock-exam-app .me-score-badge { display: inline-block; padding: 0.15rem 0.6rem; border-radius: 999px; font-weight: 700; font-size: 0.85rem; }\n"
    + "#mock-exam-app .me-score-badge.pass { background: #dafbe1; color: #116329; }\n"
    + "#mock-exam-app .me-score-badge.fail { background: #ffebe9; color: #82071e; }\n"
    + "#mock-exam-app .me-domain-table { width: 100%; border-collapse: collapse; margin: 0 0 1.2rem; font-size: 0.9rem; }\n"
    + "#mock-exam-app .me-domain-table th, #mock-exam-app .me-domain-table td { border: 1px solid #d0d7de; padding: 0.35rem 0.6rem; text-align: left; }\n"
    + "#mock-exam-app .me-domain-table th { background: #f6f8fa; }\n"
    + "#mock-exam-app .me-rate { display: flex; align-items: center; gap: 0.5rem; min-width: 9rem; }\n"
    + "#mock-exam-app .me-rate-bar { flex: 1; height: 0.6rem; border-radius: 999px; background: #eaeef2; overflow: hidden; }\n"
    + "#mock-exam-app .me-rate-bar span { display: block; height: 100%; background: #1a7f37; }\n"
    + "#mock-exam-app .me-rate.me-rate-low .me-rate-bar span { background: #cf222e; }\n"
    + "#mock-exam-app .me-rate-num { font-weight: 700; min-width: 2.6rem; text-align: right; }\n"
    + "#mock-exam-app .me-rate.me-rate-low .me-rate-num { color: #cf222e; }\n"
    + "#mock-exam-app .me-weak-note { font-size: 0.85rem; color: #57606a; margin: -0.6rem 0 1.2rem; }\n"
    + "#mock-exam-app .me-scenario { border-left: 4px solid #0969da; background: #f6f8fa; border-radius: 6px; padding: 0.7rem 1rem; margin: 1.4rem 0 0.8rem; }\n"
    + "#mock-exam-app .me-scenario p { margin: 0.3rem 0 0; font-size: 0.92rem; }\n"
    + "#mock-exam-app .me-question { border: 1px solid #d0d7de; border-radius: 10px; padding: 1.1rem 1.2rem; margin-bottom: 1rem; }\n"
    + "#mock-exam-app .me-question-head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem; flex-wrap: wrap; }\n"
    + "#mock-exam-app .me-qnum { font-weight: 700; }\n"
    + "#mock-exam-app .me-domain-tag { font-size: 0.78rem; color: #0969da; background: #ddf4ff; padding: 0.1rem 0.5rem; border-radius: 999px; text-decoration: none; }\n"
    + "#mock-exam-app .me-domain-tag:hover { text-decoration: underline; }\n"
    + "#mock-exam-app .me-multi-hint { font-size: 0.78rem; color: #9a6700; background: #fff8c5; padding: 0.1rem 0.5rem; border-radius: 999px; }\n"
    + "#mock-exam-app .me-stem-ja { margin: 0.2rem 0 0.8rem; }\n"
    + "#mock-exam-app .me-options { display: flex; flex-direction: column; gap: 0.4rem; }\n"
    + "#mock-exam-app .me-option { display: flex; gap: 0.6rem; align-items: center; border: 1px solid #d0d7de; border-radius: 8px; padding: 0.5rem 0.7rem; cursor: pointer; }\n"
    + "#mock-exam-app .me-option:hover { background: #f6f8fa; }\n"
    + "#mock-exam-app .me-option input { margin: 0; flex: none; }\n"
    + "#mock-exam-app .me-option-ja { display: block; }\n"
    + "#mock-exam-app .me-option.me-correct { border-color: #1a7f37; background: #dafbe1; }\n"
    + "#mock-exam-app .me-option.me-incorrect { border-color: #cf222e; background: #ffebe9; }\n"
    + "#mock-exam-app .me-flag-btn { margin-left: auto; font-size: 0.8rem; border: 1px solid #d0d7de; background: #fff; color: #57606a; border-radius: 999px; padding: 0.1rem 0.7rem; cursor: pointer; }\n"
    + "#mock-exam-app .me-flag-btn.me-flagged { background: #fff8c5; border-color: #bf8700; color: #7d4e00; font-weight: 700; }\n"
    + "#mock-exam-app .me-question.me-flagged-card { border-color: #bf8700; box-shadow: 0 0 0 1px #bf8700; }\n"
    + "#mock-exam-app .me-opt-row { display: flex; gap: 0.9rem; align-items: stretch; }\n"
    + "#mock-exam-app .me-opt-row .me-option { flex: 1; min-width: 0; }\n"
    + "#mock-exam-app .me-strike-btn { flex: none; width: 3.6rem; font-size: 0.8rem; line-height: 1.2; border: 1px solid #d0d7de; background: #fff; color: #57606a; border-radius: 8px; padding: 0; cursor: pointer; }\n"
    + "#mock-exam-app .me-strike-btn:hover { background: #f6f8fa; }\n"
    + "#mock-exam-app .me-opt-row.me-struck .me-option-text { text-decoration: line-through; color: #8c959f; }\n"
    + "#mock-exam-app .me-opt-row.me-struck .me-strike-btn { background: #eaeef2; color: #24292f; font-weight: 700; }\n"
    + "#mock-exam-app .me-flag-list a { display: inline-block; margin-left: 0.3rem; padding: 0 0.45rem; border-radius: 999px; background: #fff8c5; border: 1px solid #bf8700; color: #7d4e00; font-size: 0.82rem; text-decoration: none; }\n"
    + "#mock-exam-app .me-submit-wrap { margin-top: 0.6rem; }\n"
    + "#mock-exam-app .me-btn:disabled { background: #8c959f; cursor: not-allowed; }\n"
    + "#mock-exam-app .me-feedback { margin-top: 0.8rem; padding-top: 0.7rem; border-top: 1px dashed #d0d7de; }\n"
    + "#mock-exam-app .me-feedback-badge { display: inline-block; font-size: 0.8rem; font-weight: 700; padding: 0.1rem 0.6rem; border-radius: 999px; margin-bottom: 0.4rem; }\n"
    + "#mock-exam-app .me-badge-correct { background: #dafbe1; color: #116329; }\n"
    + "#mock-exam-app .me-badge-incorrect { background: #ffebe9; color: #82071e; }\n"
    + "#mock-exam-app .me-badge-unanswered { background: #eaeef2; color: #57606a; }\n"
    + "#mock-exam-app .me-explanation { margin: 0; color: #24292f; }\n"
    + "#mock-exam-app .me-expl-block { margin: 0.55rem 0 0; color: #24292f; }\n"
    + "#mock-exam-app .me-expl-label { display: inline-block; font-size: 0.78rem; font-weight: 700; padding: 0.05rem 0.5rem; border-radius: 999px; margin-right: 0.4rem; background: #ddf4ff; color: #0550ae; }\n"
    + "#mock-exam-app .me-expl-label.runner { background: #fff8c5; color: #7d4e00; }\n"
    + "#mock-exam-app .me-expl-label.rest { background: #eaeef2; color: #57606a; }\n"
    + "#mock-exam-app .me-expl-label.deep { background: #dafbe1; color: #116329; }\n"
    + "#mock-exam-app .me-expl-rest { margin: 0.3rem 0 0 1rem; padding: 0; }\n"
    + "#mock-exam-app .me-expl-rest li { margin: 0.2rem 0; }\n"
    + "#mock-exam-app .me-fig { margin: 0.8rem 0 0; padding: 0.7rem 0.8rem; border: 1px solid #d0d7de; border-radius: 8px; background: #f6f8fa; }\n"
    + "#mock-exam-app .me-fig-cap { font-size: 0.82rem; font-weight: 700; color: #57606a; margin: 0 0 0.5rem; }\n"
    + "#mock-exam-app .me-fig-row { display: flex; flex-wrap: wrap; align-items: stretch; gap: 0.3rem 0.2rem; }\n"
    + "#mock-exam-app .me-fig-node { border: 1px solid #afb8c1; border-radius: 6px; background: #fff; padding: 0.35rem 0.6rem; font-size: 0.85rem; min-width: 7rem; max-width: 14rem; }\n"
    + "#mock-exam-app .me-fig-node small { display: block; color: #57606a; font-size: 0.75rem; margin-top: 0.1rem; }\n"
    + "#mock-exam-app .me-fig-node.key { border-color: #0969da; background: #ddf4ff; }\n"
    + "#mock-exam-app .me-fig-node.ok { border-color: #1a7f37; background: #dafbe1; }\n"
    + "#mock-exam-app .me-fig-node.bad { border-color: #cf222e; background: #ffebe9; }\n"
    + "#mock-exam-app .me-fig-arrow { align-self: center; color: #57606a; font-weight: 700; padding: 0 0.1rem; }\n"
    + "#mock-exam-app .me-fig-branch { margin-top: 0.4rem; display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: stretch; }\n"
    + "#mock-exam-app .me-fig-back { margin-top: 0.4rem; font-size: 0.8rem; color: #57606a; }\n"
    + "#mock-exam-app .me-fig-table { border-collapse: collapse; width: 100%; font-size: 0.82rem; background: #fff; }\n"
    + "#mock-exam-app .me-fig-table th, #mock-exam-app .me-fig-table td { border: 1px solid #d0d7de; padding: 0.3rem 0.5rem; text-align: left; vertical-align: top; }\n"
    + "#mock-exam-app .me-fig-table th { background: #eaeef2; }\n"
    + "#mock-exam-app .me-fig-table td.key { background: #ddf4ff; font-weight: 600; }\n"
    + "@media (max-width: 640px) {\n"
    + "  #mock-exam-app .me-intro dl { grid-template-columns: 1fr; }\n"
    + "}\n";

  function injectStyle() {
    if (document.getElementById("mock-exam-style")) return;
    var style = document.createElement("style");
    style.id = "mock-exam-style";
    style.textContent = STYLE;
    document.head.appendChild(style);
  }

  function domainKey(label) {
    return String(label).split(":")[0];
  }

  // 公式の問題数に満たない問題プールでは、時間を問題数に比例して短縮する。
  function timeLimitFor(data, count) {
    var official = data.officialQuestionCount || count;
    if (count >= official) return data.timeLimitMinutes;
    return Math.max(1, Math.ceil((data.timeLimitMinutes * count) / official));
  }

  // 配点比率に応じて、問題プールから公式の問題数まで抽出する(プールが足りないときは全問)。
  function sampleByWeights(data) {
    var pool = data.questions;
    var total = data.officialQuestionCount;
    var weights = data.domainWeights;
    if (!total || !weights || pool.length <= total) return shuffle(pool);
    var byDomain = {};
    pool.forEach(function (q) {
      var k = domainKey(q.domainLabel);
      (byDomain[k] = byDomain[k] || []).push(q);
    });
    var picked = [];
    var rest = [];
    Object.keys(byDomain).forEach(function (k) {
      var list = shuffle(byDomain[k]);
      var want = Math.round(((weights[k] || 0) * total) / 100);
      picked = picked.concat(list.slice(0, want));
      rest = rest.concat(list.slice(want));
    });
    rest = shuffle(rest);
    while (picked.length < total && rest.length) picked.push(rest.shift());
    // 丸めで超過した分は、最も多く選ばれた分野から外す(特定の分野が丸ごと消えないようにする)
    while (picked.length > total) {
      var counts = {};
      picked.forEach(function (q) {
        var k = domainKey(q.domainLabel);
        counts[k] = (counts[k] || 0) + 1;
      });
      var maxKey = Object.keys(counts).sort(function (x, y) {
        return counts[y] - counts[x];
      })[0];
      var idxs = [];
      picked.forEach(function (q, i) {
        if (domainKey(q.domainLabel) === maxKey) idxs.push(i);
      });
      picked.splice(idxs[Math.floor(Math.random() * idxs.length)], 1);
    }
    return shuffle(picked);
  }

  // シナリオ形式の試験は、問題を持つシナリオからランダムに選び、シナリオごとにまとめて出題する。
  function selectQuestions(data) {
    if (data.scenarios && data.scenarioCount) {
      var usable = data.scenarios.filter(function (sc) {
        return data.questions.some(function (q) {
          return q.scenario === sc.id;
        });
      });
      var chosen = shuffle(usable).slice(0, data.scenarioCount);
      // 1シナリオあたりの上限(公式: 60問 ÷ 4シナリオ = 15問)。問題プールが多くても公式の問題数に収める。
      var perScenario = data.officialQuestionCount
        ? Math.ceil(data.officialQuestionCount / data.scenarioCount)
        : Infinity;
      var out = [];
      chosen.forEach(function (sc) {
        out = out.concat(
          shuffle(
            data.questions.filter(function (q) {
              return q.scenario === sc.id;
            })
          ).slice(0, perScenario)
        );
      });
      return out;
    }
    return sampleByWeights(data);
  }

  function prepareAttempt(data) {
    var questions = selectQuestions(data).map(function (q) {
      var options = shuffle(
        q.options.map(function (o) {
          return { origLetter: o.letter, ja: o.ja };
        })
      );
      return {
        id: q.id,
        scenario: q.scenario,
        domainLabel: q.domainLabel,
        domainLink: q.domainLink,
        stemJa: q.stemJa,
        options: options,
        correct: q.correct.slice(),
        explanation: q.explanation,
        runnerUp: q.runnerUp,
        others: q.others,
        deep: q.deep,
        fig: q.fig,
      };
    });
    return questions;
  }

  function renderIntro(root, data, onStart) {
    injectStyle();
    var official = data.officialQuestionCount;
    var pool = data.questions.length;
    var scenarioMode = !!(data.scenarios && data.scenarioCount);
    var planned = scenarioMode ? null : official && pool > official ? official : pool;
    var countText = scenarioMode
      ? "開始時に決まります(" + data.scenarioCount + "シナリオを、" + data.scenarios.length + "シナリオからランダムに選択)"
      : planned + "問";
    var timeText = scenarioMode
      ? "出題数に応じて決まります(公式は" + data.timeLimitMinutes + "分)"
      : timeLimitFor(data, planned) + "分(公式は" + data.timeLimitMinutes + "分)";
    var officialText = official
      ? "<dt>公式の問題数</dt><dd>" + official + "問" + (scenarioMode ? "(" + data.scenarioCount + "シナリオ)" : "") + "</dd>"
      : "";
    var shortNote =
      official && pool < official
        ? '<p class="me-note">現在の問題プールは' + pool + "問で、公式の問題数(" + official + "問)に届いていません。問題数に比例して制限時間を短縮しています。問題の追加に合わせて、公式の問題数に近づけていきます。</p>"
        : "";
    root.innerHTML =
      '<div class="me-intro">'
      + "<p>" + escapeHtml(data.examTitle) + " の模擬試験です。公式の試験ガイドの出題形式(問題数・配点比率・制限時間)に合わせて出題し、問題ごとに、解答を確定した時点で正答と解説を表示します。</p>"
      + "<dl>"
      + officialText
      + "<dt>今回の問題数</dt><dd>" + countText + "</dd>"
      + "<dt>制限時間</dt><dd>" + timeText + "</dd>"
      + "<dt>合格ライン</dt><dd>スケールスコア " + data.passScore + " / " + data.scoreMax + "</dd>"
      + "</dl>"
      + shortNote
      + '<p class="me-note">出題順・選択肢の順序は開始のたびにランダムに入れ替わります。1つ選ぶ問題は、選んだ時点で確定します。複数選択の問題は、指定数を選んで「解答する」を押すと確定します。確定後は選び直せず、正誤は変わりません(選び直しによる加点はありません)。制限時間になると、未確定の問題はその時点の選択で確定し、結果を表示します。スケールスコアは正答率を100〜1000の範囲に単純換算した自己学習用の目安であり、実際の採点方式(非公開)を再現するものではありません。</p>'
      + '<button type="button" class="me-btn" id="me-start-btn">模擬試験を開始する</button>'
      + "</div>";
    root.querySelector("#me-start-btn").addEventListener("click", onStart);
  }

  function optionInputType(q) {
    return q.correct.length > 1 ? "checkbox" : "radio";
  }

  function renderExam(root, data, questions, onGrade) {
    injectStyle();

    var panelHtml =
      '<div class="me-panel" id="me-panel">'
      + '<div class="me-panel-item">残り時間: <strong class="me-timer" id="me-timer">' + formatClock(timeLimitFor(data, questions.length) * 60) + "</strong></div>"
      + '<div class="me-panel-item" id="me-progress">解答済み: <strong>0</strong> / ' + questions.length + "</div>"
      + '<div class="me-panel-item me-flag-list" id="me-flag-list" hidden>フラグ:<span></span></div>'
      + '<div class="me-panel-spacer"></div>'
      + '<button type="button" class="me-btn" id="me-grade-btn">試験を終了して結果を見る</button>'
      + "</div>";

    var lastScenario = null;
    var questionsHtml = questions
      .map(function (q, idx) {
        var scenarioHtml = "";
        if (data.scenarios && q.scenario !== lastScenario) {
          lastScenario = q.scenario;
          var sc = data.scenarios.filter(function (x) {
            return x.id === q.scenario;
          })[0];
          if (sc) {
            scenarioHtml =
              '<div class="me-scenario"><strong>シナリオ: ' + escapeHtml(sc.title) + "</strong><p>" + formatText(sc.description) + "</p></div>";
          }
        }
        var inputType = optionInputType(q);
        var multiHint =
          q.correct.length > 1
            ? '<span class="me-multi-hint">' + q.correct.length + "つ選択</span>"
            : "";
        var optionsHtml = q.options
          .map(function (o, oIdx) {
            var displayLetter = String.fromCharCode(65 + oIdx);
            return (
              '<div class="me-opt-row">'
              + '<label class="me-option" data-letter="' + o.origLetter + '">'
              + '<input type="' + inputType + '" name="q-' + q.id + '" value="' + o.origLetter + '">'
              + '<span class="me-option-text">'
              + '<span class="me-option-ja">' + displayLetter + ". " + formatText(o.ja) + "</span>"
              + "</span>"
              + "</label>"
              + '<button type="button" class="me-strike-btn" title="この選択肢を消去(取り消し線)">取消</button>'
              + "</div>"
            );
          })
          .join("");

        return (
          scenarioHtml
          + '<div class="me-question" id="me-q' + (idx + 1) + '" data-no="' + (idx + 1) + '" data-qid="' + q.id + '">'
          + '<div class="me-question-head">'
          + '<span class="me-qnum">問' + (idx + 1) + "</span>"
          + '<a class="me-domain-tag" href="' + escapeHtml(q.domainLink) + '" target="_blank" rel="noopener">' + escapeHtml(q.domainLabel) + "</a>"
          + multiHint
          + '<button type="button" class="me-flag-btn" title="あとで見直す問題にフラグを付ける">⚑ フラグ</button>'
          + "</div>"
          + '<div class="me-stem">'
          + '<p class="me-stem-ja">' + formatText(q.stemJa) + "</p>"
          + "</div>"
          + '<div class="me-options">' + optionsHtml + "</div>"
          + (q.correct.length > 1
            ? '<div class="me-submit-wrap"><button type="button" class="me-btn me-submit-q" disabled>解答する(' + q.correct.length + "つ選択)</button></div>"
            : "")
          + '<div class="me-feedback" hidden></div>'
          + "</div>"
        );
      })
      .join("");

    root.innerHTML = panelHtml + '<div id="me-questions">' + questionsHtml + "</div>";

    var progressStrong = root.querySelector("#me-progress strong");
    function updateProgress() {
      progressStrong.textContent = String(
        questions.filter(function (q) {
          return q.locked;
        }).length
      );
    }
    function findQuestion(el) {
      var card = el.closest(".me-question");
      if (!card) return null;
      var qid = card.getAttribute("data-qid");
      var q = questions.filter(function (x) {
        return String(x.id) === qid;
      })[0];
      return q ? { q: q, card: card } : null;
    }
    var area = root.querySelector("#me-questions");
    // 1つ選ぶ問題は選んだ時点で確定し、正答と解説を表示する。確定後は選び直せない(再選択による加点はない)。
    // 複数選択の問題は、指定数を選んだ上で「解答する」で確定する。
    area.addEventListener("change", function (e) {
      var f = findQuestion(e.target);
      if (!f || f.q.locked) return;
      if (f.q.correct.length === 1) {
        lockQuestion(f.q, f.card);
        updateProgress();
      } else {
        var n = f.card.querySelectorAll("input:checked").length;
        f.card.querySelector(".me-submit-q").disabled = n !== f.q.correct.length;
      }
    });
    var flagList = root.querySelector("#me-flag-list");
    function updateFlags() {
      var nos = Array.prototype.map.call(area.querySelectorAll(".me-flagged-card"), function (c) {
        return c.getAttribute("data-no");
      });
      flagList.hidden = nos.length === 0;
      flagList.querySelector("span").innerHTML = nos
        .map(function (n) { return '<a href="#me-q' + n + '">問' + n + "</a>"; })
        .join("");
    }
    flagList.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a) return;
      e.preventDefault();
      var card = area.querySelector(a.getAttribute("href"));
      if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    // フラグ(見直し用の目印)と選択肢の取り消し線。どちらも採点には影響しない。
    area.addEventListener("click", function (e) {
      var strike = e.target.closest && e.target.closest(".me-strike-btn");
      if (strike) {
        e.preventDefault();
        var fs = findQuestion(strike);
        if (fs && !fs.q.locked) strike.closest(".me-opt-row").classList.toggle("me-struck");
        return;
      }
      var flagBtn = e.target.closest && e.target.closest(".me-flag-btn");
      if (flagBtn) {
        var card = flagBtn.closest(".me-question");
        var on = !card.classList.contains("me-flagged-card");
        card.classList.toggle("me-flagged-card", on);
        flagBtn.classList.toggle("me-flagged", on);
        flagBtn.textContent = on ? "⚑ フラグ済み" : "⚑ フラグ";
        updateFlags();
      }
    });
    area.addEventListener("click", function (e) {
      if (!e.target.classList || !e.target.classList.contains("me-submit-q")) return;
      var f = findQuestion(e.target);
      if (!f || f.q.locked) return;
      lockQuestion(f.q, f.card);
      updateProgress();
    });

    root.querySelector("#me-grade-btn").addEventListener("click", function () {
      onGrade();
    });

    var timerEl = root.querySelector("#me-timer");
    var remaining = timeLimitFor(data, questions.length) * 60;
    var timerId = setInterval(function () {
      remaining -= 1;
      timerEl.textContent = formatClock(remaining);
      if (remaining <= 300) timerEl.classList.add("me-timer-warn");
      if (remaining <= 0) {
        clearInterval(timerId);
        onGrade();
      }
    }, 1000);

    return {
      stopTimer: function () {
        clearInterval(timerId);
      },
    };
  }

  // 問題を確定し、正答と解説を表示する。一度確定した問題の結果は変わらない。
  function lockQuestion(q, card) {
    if (q.locked) return;
    q.locked = true;
    var checked = Array.prototype.slice
      .call(card.querySelectorAll("input:checked"))
      .map(function (i) {
        return i.value;
      });
    var correctSet = q.correct;
    q.answered = checked.length > 0;
    q.isCorrect =
      checked.length === correctSet.length && checked.every(function (v) {
        return correctSet.indexOf(v) !== -1;
      });

    Array.prototype.forEach.call(card.querySelectorAll(".me-option"), function (label) {
      var input = label.querySelector("input");
      input.disabled = true;
      label.style.cursor = "default";
      var sb = label.parentNode.querySelector(".me-strike-btn");
      if (sb) sb.hidden = true;
      var letter = label.getAttribute("data-letter");
      if (correctSet.indexOf(letter) !== -1) {
        label.classList.add("me-correct");
      } else if (input.checked) {
        label.classList.add("me-incorrect");
      }
    });
    var submit = card.querySelector(".me-submit-q");
    if (submit) submit.hidden = true;

    var fb = card.querySelector(".me-feedback");
    fb.hidden = false;
    var badgeClass = !q.answered ? "me-badge-unanswered" : q.isCorrect ? "me-badge-correct" : "me-badge-incorrect";
    var badgeText = !q.answered ? "未解答" : q.isCorrect ? "正解" : "不正解";
    fb.innerHTML =
      '<span class="me-feedback-badge ' + badgeClass + '">' + badgeText + "</span>"
      + explanationHtml(q);
  }

  // 解説: 正答の理由 / 次点 / ほかの選択肢 / 見分け方 / 図。
  // 選択肢は毎回シャッフルされるので、データ中の元の文字(origLetter)を表示上の文字に直して示す。
  function displayLetterOf(q, origLetter) {
    for (var i = 0; i < q.options.length; i++) {
      if (q.options[i].origLetter === origLetter) return String.fromCharCode(65 + i);
    }
    return origLetter;
  }

  function figHtml(fig) {
    if (!fig) return "";
    function node(n) {
      return '<div class="me-fig-node ' + escapeHtml(n.tone || "") + '">' + formatText(n.t)
        + (n.s ? "<small>" + formatText(n.s) + "</small>" : "") + "</div>";
    }
    var body = "";
    if (fig.kind === "table") {
      body = '<table class="me-fig-table"><thead><tr>'
        + fig.head.map(function (h) { return "<th>" + formatText(h) + "</th>"; }).join("")
        + "</tr></thead><tbody>"
        + fig.rows.map(function (r) {
          // セルが {t, key:true} のオブジェクトなら、正答の行として強調する
          return "<tr>" + r.map(function (c) {
            var isObj = typeof c === "object";
            return "<td" + (isObj ? ' class="key"' : "") + ">" + formatText(isObj ? c.t : c) + "</td>";
          }).join("") + "</tr>";
        }).join("")
        + "</tbody></table>";
    } else {
      body = '<div class="me-fig-row">'
        + fig.steps.map(function (n, i) {
          return (i ? '<span class="me-fig-arrow">→</span>' : "") + node(n);
        }).join("")
        + "</div>";
      if (fig.end) {
        body += '<div class="me-fig-branch"><span class="me-fig-arrow">↳</span>' + fig.end.map(node).join("") + "</div>";
      }
      if (fig.back) body += '<div class="me-fig-back">↺ ' + formatText(fig.back) + "</div>";
    }
    return '<div class="me-fig"><p class="me-fig-cap">図: ' + formatText(fig.cap) + "</p>" + body + "</div>";
  }

  function explanationHtml(q) {
    var html = '<p class="me-explanation"><strong>解説: </strong>' + formatText(q.explanation) + "</p>";
    if (q.runnerUp) {
      html += '<p class="me-expl-block"><span class="me-expl-label runner">次点: '
        + displayLetterOf(q, q.runnerUp.letter) + "</span>" + formatText(q.runnerUp.why) + "</p>";
    }
    if (q.others) {
      var items = Object.keys(q.others)
        .sort(function (a, b) {
          return displayLetterOf(q, a) < displayLetterOf(q, b) ? -1 : 1;
        })
        .map(function (k) {
          return "<li><strong>" + displayLetterOf(q, k) + "</strong>: " + formatText(q.others[k]) + "</li>";
        })
        .join("");
      if (items) {
        html += '<p class="me-expl-block"><span class="me-expl-label rest">ほかの選択肢</span></p><ul class="me-expl-rest">' + items + "</ul>";
      }
    }
    if (q.deep) {
      html += '<p class="me-expl-block"><span class="me-expl-label deep">見分け方</span>' + formatText(q.deep) + "</p>";
    }
    return html + figHtml(q.fig);
  }

  function gradeExam(root, data, questions) {
    var correctCount = 0;
    var domainStats = {};

    questions.forEach(function (q) {
      var card = root.querySelector('.me-question[data-qid="' + q.id + '"]');
      lockQuestion(q, card); // 未確定の問題は、その時点の選択で確定する
      if (!domainStats[q.domainLabel]) domainStats[q.domainLabel] = { correct: 0, total: 0, link: q.domainLink };
      domainStats[q.domainLabel].total++;
      if (q.isCorrect) {
        domainStats[q.domainLabel].correct++;
        correctCount++;
      }
    });

    return { correctCount: correctCount, total: questions.length, domainStats: domainStats };
  }

  function renderResultPanel(root, data, result) {
    var pct = result.correctCount / result.total;
    var scaled = Math.round(data.scoreMin + pct * (data.scoreMax - data.scoreMin));
    var pass = scaled >= data.passScore;

    // 合格ライン(正答率換算)を下回る分野は赤で示す
    var passRate = (data.passScore - data.scoreMin) / (data.scoreMax - data.scoreMin);
    var domainRows = Object.keys(result.domainStats)
      .sort()
      .map(function (label) {
        var s = result.domainStats[label];
        var w = data.domainWeights ? data.domainWeights[domainKey(label)] : null;
        var rate = s.total ? Math.round((s.correct / s.total) * 100) : 0;
        var low = s.total && s.correct / s.total < passRate;
        var rateHtml =
          '<div class="me-rate' + (low ? " me-rate-low" : "") + '">'
          + '<div class="me-rate-bar"><span style="width:' + rate + '%"></span></div>'
          + '<span class="me-rate-num">' + (s.total ? rate + "%" : "-") + "</span></div>";
        return (
          "<tr><td>" + escapeHtml(label) + "</td><td>" + s.correct + " / " + s.total + "</td><td>" + rateHtml + "</td>"
          + (data.domainWeights ? "<td>" + (w != null ? w + "%" : "-") + "</td>" : "")
          + '<td><a href="' + escapeHtml(s.link) + '" target="_blank" rel="noopener">学習ノートを開く</a></td>'
          + "</tr>"
        );
      })
      .join("");

    var panel = root.querySelector("#me-panel");
    panel.innerHTML =
      '<div class="me-panel-item">正答数: <strong>' + result.correctCount + " / " + result.total + "</strong>(" + Math.round(pct * 100) + "%)</div>"
      + '<div class="me-panel-item">スケールスコア目安: <strong>' + scaled + " / " + data.scoreMax + "</strong></div>"
      + '<div class="me-panel-item"><span class="me-score-badge ' + (pass ? "pass" : "fail") + '">' + (pass ? "合格ライン到達" : "合格ラインには未到達") + "</span></div>"
      + '<div class="me-panel-spacer"></div>'
      + '<button type="button" class="me-btn me-btn-secondary" id="me-retry-btn">もう一度挑戦する(出題順をシャッフル)</button>';

    var table = document.createElement("table");
    table.className = "me-domain-table";
    table.innerHTML = "<thead><tr><th>出題分野</th><th>正答数</th><th>正答率</th>" + (data.domainWeights ? "<th>公式の配点比率</th>" : "") + "<th>学習コンテンツ</th></tr></thead><tbody>" + domainRows + "</tbody>";
    panel.insertAdjacentElement("afterend", table);
    var note = document.createElement("p");
    note.className = "me-weak-note";
    note.textContent = "赤い分野は、合格ライン(正答率 " + Math.round(passRate * 100) + "% 相当)を下回っています。右の「学習ノートを開く」から復習できます。";
    table.insertAdjacentElement("afterend", note);

    panel.querySelector("#me-retry-btn").addEventListener("click", function () {
      startAttempt(root, data);
    });

    if (typeof panel.scrollIntoView === "function") {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function startAttempt(root, data) {
    var questions = prepareAttempt(data);
    var timerHandle = renderExam(root, data, questions, function onGrade() {
      timerHandle.stopTimer();
      var result = gradeExam(root, data, questions);
      renderResultPanel(root, data, result);
    });
  }

  function init() {
    var root = document.getElementById("mock-exam-app");
    if (!root || typeof window.MOCK_EXAM_DATA === "undefined") return;
    var data = window.MOCK_EXAM_DATA;
    renderIntro(root, data, function () {
      startAttempt(root, data);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
