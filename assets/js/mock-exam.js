/*
 * 模擬試験エンジン(共通)。<exam>/mock-exam/ 配下の各ページから、
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
    + "#mock-exam-app .me-review { margin: 0 0 1.2rem; font-size: 0.9rem; }\n"
    + "#mock-exam-app .me-review-row { margin: 0.3rem 0; }\n"
    + "#mock-exam-app .me-review a { display: inline-block; margin: 0.15rem 0.2rem 0.15rem 0; padding: 0 0.55rem; border-radius: 999px; text-decoration: none; border: 1px solid; }\n"
    + "#mock-exam-app .me-review a.me-rv-wrong { background: #ffebe9; border-color: #cf222e; color: #82071e; }\n"
    + "#mock-exam-app .me-review a.me-rv-skip { background: #eaeef2; border-color: #8c959f; color: #24292f; }\n"
    + "#mock-exam-app .me-review a.me-rv-flag { background: #fff8c5; border-color: #bf8700; color: #7d4e00; }\n"
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
    + "#mock-exam-app .me-mail { border: 1px solid #d0d7de; border-radius: 10px; padding: 0.8rem 1rem; margin: 0 0 1.2rem; background: #f6f8fa; }\n"
    + "#mock-exam-app .me-mail-actions { display: flex; flex-wrap: wrap; gap: 0.6rem; margin: 0.5rem 0; }\n"
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

  // 配点比率から、各分野の出題数を最大剰余法で配分する。分野の問題数が足りない分は、余裕のある分野へ回す。
  function allocateByWeights(weights, total, avail) {
    var keys = Object.keys(weights);
    var target = {};
    var alloc = {};
    var sum = 0;
    keys.forEach(function (k) {
      target[k] = (weights[k] * total) / 100;
      alloc[k] = Math.floor(target[k]);
      sum += alloc[k];
    });
    keys
      .slice()
      .sort(function (a, b) {
        return target[b] - alloc[b] - (target[a] - alloc[a]);
      })
      .forEach(function (k) {
        if (sum < total) {
          alloc[k]++;
          sum++;
        }
      });
    var short = 0;
    keys.forEach(function (k) {
      var have = avail[k] || 0;
      if (alloc[k] > have) {
        short += alloc[k] - have;
        alloc[k] = have;
      }
    });
    while (short > 0) {
      var best = null;
      keys.forEach(function (k) {
        if (alloc[k] < (avail[k] || 0) && (best === null || target[k] - alloc[k] > target[best] - alloc[best])) best = k;
      });
      if (best === null) break;
      alloc[best]++;
      short--;
    }
    var gap = 0;
    keys.forEach(function (k) {
      gap += Math.abs(alloc[k] - target[k]);
    });
    return { alloc: alloc, gap: gap };
  }

  function groupByDomain(list) {
    var by = {};
    list.forEach(function (q) {
      var k = domainKey(q.domainLabel);
      (by[k] = by[k] || []).push(q);
    });
    return by;
  }

  function countByDomain(by) {
    var n = {};
    Object.keys(by).forEach(function (k) {
      n[k] = by[k].length;
    });
    return n;
  }

  function pickByAlloc(by, alloc) {
    var picked = [];
    Object.keys(alloc).forEach(function (k) {
      picked = picked.concat(shuffle(by[k] || []).slice(0, alloc[k]));
    });
    return picked;
  }

  // 配点比率に応じて、問題プールから公式の問題数まで抽出する(プールが足りないときは全問)。
  function sampleByWeights(data) {
    var pool = data.questions;
    var total = data.officialQuestionCount;
    var weights = data.domainWeights;
    if (!total || !weights || pool.length <= total) return shuffle(pool);
    var by = groupByDomain(pool);
    var picked = pickByAlloc(by, allocateByWeights(weights, total, countByDomain(by)).alloc);
    return shuffle(picked);
  }

  // 組み合わせ(n個からk個)を列挙する。
  function combinations(items, k) {
    var out = [];
    (function rec(start, cur) {
      if (cur.length === k) {
        out.push(cur.slice());
        return;
      }
      for (var i = start; i < items.length; i++) {
        cur.push(items[i]);
        rec(i + 1, cur);
        cur.pop();
      }
    })(0, []);
    return out;
  }

  // 各シナリオから同数(公式: 60問 ÷ 4シナリオ = 15問)ずつ出す前提で、分野別の出題数が公式の配点比率に
  // 最も近くなる配分を、局所探索で求める。
  function planScenarioMix(set, byScenario, weights, total, per) {
    var target = {};
    var domains = Object.keys(weights);
    domains.forEach(function (k) {
      target[k] = (weights[k] * total) / 100;
    });
    var cur = {};
    domains.forEach(function (k) {
      cur[k] = 0;
    });
    var plan = {};
    set.forEach(function (sc) {
      var av = byScenario[sc.id];
      var x = {};
      var want = Math.min(per, Object.keys(av).reduce(function (n, k) { return n + av[k].length; }, 0));
      for (var i = 0; i < want; i++) {
        var best = null;
        Object.keys(av).forEach(function (k) {
          if ((x[k] || 0) < av[k].length && (best === null || target[k] - cur[k] > target[best] - cur[best])) best = k;
        });
        x[best] = (x[best] || 0) + 1;
        cur[best] = (cur[best] || 0) + 1;
      }
      plan[sc.id] = x;
    });
    var improved = true;
    while (improved) {
      improved = false;
      set.forEach(function (sc) {
        var av = byScenario[sc.id];
        var x = plan[sc.id];
        Object.keys(x).forEach(function (d1) {
          Object.keys(av).forEach(function (d2) {
            if (d1 === d2 || !(x[d1] > 0) || (x[d2] || 0) >= av[d2].length) return;
            var before = Math.abs(cur[d1] - target[d1]) + Math.abs((cur[d2] || 0) - target[d2]);
            var after = Math.abs(cur[d1] - 1 - target[d1]) + Math.abs((cur[d2] || 0) + 1 - target[d2]);
            if (after < before - 1e-9) {
              x[d1]--;
              x[d2] = (x[d2] || 0) + 1;
              cur[d1]--;
              cur[d2] = (cur[d2] || 0) + 1;
              improved = true;
            }
          });
        });
      });
    }
    var gap = 0;
    domains.forEach(function (k) {
      gap += Math.abs((cur[k] || 0) - target[k]);
    });
    return { plan: plan, gap: gap };
  }

  // シナリオ形式の試験: 公式どおり、シナリオごとに同数ずつ、シナリオごとにまとめて出題する。
  // シナリオの組み合わせは、分野別の出題数が公式の配点比率に最も近くなるものからランダムに選ぶ。
  function selectQuestions(data) {
    if (data.scenarios && data.scenarioCount) {
      var usable = data.scenarios.filter(function (sc) {
        return data.questions.some(function (q) {
          return q.scenario === sc.id;
        });
      });
      var count = Math.min(data.scenarioCount, usable.length);
      var total = data.officialQuestionCount;
      var per = total ? Math.ceil(total / data.scenarioCount) : Infinity;
      var byScenario = {};
      usable.forEach(function (sc) {
        byScenario[sc.id] = groupByDomain(
          data.questions.filter(function (q) {
            return q.scenario === sc.id;
          })
        );
      });
      var combos = combinations(usable, count).map(function (set) {
        var r = data.domainWeights && total ? planScenarioMix(set, byScenario, data.domainWeights, per * count, per) : null;
        return { set: set, r: r, gap: r ? r.gap : 0 };
      });
      var minGap = Math.min.apply(
        null,
        combos.map(function (c) {
          return c.gap;
        })
      );
      var best = combos.filter(function (c) {
        return c.gap <= minGap + 1;
      });
      var chosen = best[Math.floor(Math.random() * best.length)];
      var out = [];
      shuffle(chosen.set).forEach(function (sc) {
        var picked = [];
        var av = byScenario[sc.id];
        if (chosen.r) {
          Object.keys(chosen.r.plan[sc.id]).forEach(function (k) {
            picked = picked.concat(shuffle(av[k]).slice(0, chosen.r.plan[sc.id][k]));
          });
        } else {
          Object.keys(av).forEach(function (k) {
            picked = picked.concat(av[k]);
          });
          picked = shuffle(picked).slice(0, per);
        }
        out = out.concat(shuffle(picked));
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
      + '<div class="me-panel-item" id="me-accuracy">正答率: <strong>-</strong></div>'
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
    var accuracyStrong = root.querySelector("#me-accuracy strong");
    function updateProgress() {
      var locked = questions.filter(function (q) {
        return q.locked;
      });
      var correct = locked.filter(function (q) {
        return q.isCorrect;
      }).length;
      progressStrong.textContent = String(locked.length);
      accuracyStrong.textContent = locked.length
        ? Math.round((correct / locked.length) * 100) + "% (" + correct + "/" + locked.length + ")"
        : "-";
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
    q.picked = checked;
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
    var scenarioStats = {};
    var review = { wrong: [], skipped: [], flagged: [] };

    questions.forEach(function (q) {
      var card = root.querySelector('.me-question[data-qid="' + q.id + '"]');
      lockQuestion(q, card); // 未確定の問題は、その時点の選択で確定する
      var no = card.getAttribute("data-no");
      if (!q.answered) review.skipped.push(no);
      else if (!q.isCorrect) review.wrong.push(no);
      if (card.classList.contains("me-flagged-card")) review.flagged.push(no);
      if (!domainStats[q.domainLabel]) domainStats[q.domainLabel] = { correct: 0, total: 0, link: q.domainLink };
      domainStats[q.domainLabel].total++;
      if (q.scenario) {
        if (!scenarioStats[q.scenario]) scenarioStats[q.scenario] = { correct: 0, total: 0 };
        scenarioStats[q.scenario].total++;
        if (q.isCorrect) scenarioStats[q.scenario].correct++;
      }
      if (q.isCorrect) {
        domainStats[q.domainLabel].correct++;
        correctCount++;
      }
    });

    return { correctCount: correctCount, total: questions.length, domainStats: domainStats, scenarioStats: scenarioStats, review: review, questions: questions };
  }

  // 結果レポート(Markdown)。summary=メール本文(短い要約)、full=添付するテキストファイル(不正解・未解答の問題の問題文・選択肢・回答・正解まで)。
  // 問題ID(q.id)は出題データ固有の番号で、出題順や選択肢をシャッフルしても変わらない。
  function buildReport(data, result, scaled, pass) {
    var d = new Date();
    var pad = function (n) { return n < 10 ? "0" + n : String(n); };
    var dateStr = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    var plain = function (s) { return String(s).replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1"); };
    var pct = Math.round((result.correctCount / result.total) * 100);
    var lines = [];
    lines.push("# 模擬試験結果: " + data.examTitle + " (" + dateStr + ")");
    lines.push("");
    lines.push("- 正答数: " + result.correctCount + " / " + result.total + " (" + pct + "%)");
    lines.push("- スケールスコア目安: " + scaled + " / " + data.scoreMax + " (合格ライン " + data.passScore + "): " + (pass ? "到達" : "未到達"));
    lines.push("");
    lines.push("## 分野別正答率(★は合格ライン相当を下回る分野)");
    lines.push("");
    var passRate = (data.passScore - data.scoreMin) / (data.scoreMax - data.scoreMin);
    Object.keys(result.domainStats).sort().forEach(function (label) {
      var s = result.domainStats[label];
      var w = data.domainWeights ? data.domainWeights[domainKey(label)] : null;
      var low = s.total && s.correct / s.total < passRate;
      lines.push("- " + label + ": " + s.correct + "/" + s.total + " (" + (s.total ? Math.round((s.correct / s.total) * 100) + "%" : "-") + ")"
        + (w != null ? " ・配点" + w + "%" : "") + (low ? " ★要復習" : ""));
      if (s.link && low) {
        var url = s.link;
        try { url = new URL(s.link, location.href).href; } catch (e) {}
        lines.push("  学習ノート: " + url);
      }
    });
    var wrong = result.questions.filter(function (q) { return q.answered && !q.isCorrect; });
    var skipped = result.questions.filter(function (q) { return !q.answered; });
    var ids = function (arr) { return arr.map(function (q) { return q.id; }).join(", ") || "なし"; };
    lines.push("");
    lines.push("## 見直す問題(問題ID)");
    lines.push("");
    lines.push("- 不正解 (" + wrong.length + "問): " + ids(wrong));
    lines.push("- 未解答 (" + skipped.length + "問): " + ids(skipped));
    var summary = lines.join("\n");

    lines.push("");
    lines.push("## 不正解・未解答の問題の詳細");
    lines.push("");
    lines.push("凡例　●：正解、○：未選択、×：誤り");
    wrong.concat(skipped).forEach(function (q) {
      lines.push("");
      lines.push("### 問題ID " + q.id + " [" + q.domainLabel + "] " + (q.answered ? "不正解" : "未解答"));
      lines.push(plain(q.stemJa));
      lines.push("");
      q.options.forEach(function (o, i) {
        var picked = !!q.picked && q.picked.indexOf(o.origLetter) !== -1;
        var correct = q.correct.indexOf(o.origLetter) !== -1;
        var mark = picked ? (correct ? "●" : "×") : correct ? "○" : "　";
        lines.push(mark + " " + String.fromCharCode(65 + i) + ". " + plain(o.ja));
      });
      lines.push("");
      lines.push("- 解説: " + plain(q.explanation));
      if (q.runnerUp) lines.push("- 次点(" + displayLetterOf(q, q.runnerUp.letter) + "): " + plain(q.runnerUp.why));
      if (q.others) {
        Object.keys(q.others)
          .sort(function (a, b) { return displayLetterOf(q, a) < displayLetterOf(q, b) ? -1 : 1; })
          .forEach(function (k) { lines.push("- ほかの選択肢(" + displayLetterOf(q, k) + "): " + plain(q.others[k])); });
      }
      if (q.deep) lines.push("- 見分け方: " + plain(q.deep));
    });
    lines.push("");
    var subject = "[模擬試験結果] " + data.examTitle + " " + dateStr + " " + pct + "%";
    return { subject: subject, summary: summary, full: lines.join("\n"), fileName: "模擬試験結果_" + dateStr + ".txt" };
  }

  // 結果をメールで送る(外部サービスなし)。Web Share APIで、要約を本文、詳細のテキストファイルを添付として共有する。
  function renderMailBox(panel, report) {
    var box = document.createElement("div");
    box.className = "me-mail";
    box.innerHTML =
      '<strong>結果をメールで送る</strong>'
      + '<div class="me-mail-actions">'
      + '<button type="button" class="me-btn" id="me-share-btn">メールアプリに添付して共有</button>'
      + "</div>"
      + '<p class="me-note" id="me-mail-status">本文には要約(スコア・分野別正答率・見直す問題のID)を入れ、詳細はテキストファイル(.txt)で添付します。共有に対応した環境(スマートフォンなど)で使えます。宛先は共有先のアプリで選びます。</p>';
    panel.insertAdjacentElement("afterend", box);
    var status = box.querySelector("#me-mail-status");
    box.querySelector("#me-share-btn").addEventListener("click", function () {
      var file = new File([report.full], report.fileName, { type: "text/plain;charset=utf-8" });
      if (!(navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share)) {
        status.textContent = "この環境は、ファイルの共有に対応していません。";
        return;
      }
      navigator.share({ files: [file], title: report.subject, text: report.summary }).catch(function (e) {
        if (e && e.name !== "AbortError") status.textContent = "共有に失敗しました。";
      });
    });
  }

  function renderResultPanel(root, data, result) {
    var pct = result.correctCount / result.total;
    var scaled = Math.round(data.scoreMin + pct * (data.scoreMax - data.scoreMin));
    var pass = scaled >= data.passScore;

    // 合格ライン(正答率換算)を下回る分野は赤で示す
    var passRate = (data.passScore - data.scoreMin) / (data.scoreMax - data.scoreMin);
    function rateCell(s) {
      var rate = s.total ? Math.round((s.correct / s.total) * 100) : 0;
      var low = s.total && s.correct / s.total < passRate;
      return (
        '<div class="me-rate' + (low ? " me-rate-low" : "") + '">'
        + '<div class="me-rate-bar"><span style="width:' + rate + '%"></span></div>'
        + '<span class="me-rate-num">' + (s.total ? rate + "%" : "-") + "</span></div>"
      );
    }
    var domainRows = Object.keys(result.domainStats)
      .sort()
      .map(function (label) {
        var s = result.domainStats[label];
        var w = data.domainWeights ? data.domainWeights[domainKey(label)] : null;
        var rateHtml = rateCell(s);
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
    var weakest = Object.keys(result.domainStats)
      .filter(function (k) { return result.domainStats[k].total; })
      .sort(function (a, b) {
        var x = result.domainStats[a], y = result.domainStats[b];
        return x.correct / x.total - y.correct / y.total;
      })[0];
    note.textContent = "赤い分野は、合格ライン(正答率 " + Math.round(passRate * 100) + "% 相当)を下回っています。右の「学習ノートを開く」から復習できます。"
      + (weakest ? "最も正答率が低い分野: " + weakest + "(" + result.domainStats[weakest].correct + " / " + result.domainStats[weakest].total + ")。" : "");
    table.insertAdjacentElement("afterend", note);

    // 見直す問題の一覧(クリックでその問題へ移動)。フラグを付けた問題も含める
    var rv = result.review;
    function chips(nos, cls) {
      return nos.map(function (n) { return '<a class="' + cls + '" href="#me-q' + n + '">問' + n + "</a>"; }).join("");
    }
    var rvHtml =
      (rv.wrong.length ? '<div class="me-review-row"><strong>不正解 ' + rv.wrong.length + "問:</strong> " + chips(rv.wrong, "me-rv-wrong") + "</div>" : "")
      + (rv.skipped.length ? '<div class="me-review-row"><strong>未解答 ' + rv.skipped.length + "問:</strong> " + chips(rv.skipped, "me-rv-skip") + "</div>" : "")
      + (rv.flagged.length ? '<div class="me-review-row"><strong>フラグ ' + rv.flagged.length + "問:</strong> " + chips(rv.flagged, "me-rv-flag") + "</div>" : "");
    if (rvHtml) {
      var rvBox = document.createElement("div");
      rvBox.className = "me-review";
      rvBox.innerHTML = rvHtml;
      rvBox.addEventListener("click", function (e) {
        var a = e.target.closest("a");
        if (!a) return;
        e.preventDefault();
        var card = root.querySelector(a.getAttribute("href"));
        if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      note.insertAdjacentElement("afterend", rvBox);
    }

    // シナリオ形式の試験(Architect – Foundations)は、シナリオ別の正答率も示す
    if (data.scenarios && Object.keys(result.scenarioStats).length) {
      var scRows = data.scenarios
        .filter(function (sc) { return result.scenarioStats[sc.id]; })
        .map(function (sc) {
          var st = result.scenarioStats[sc.id];
          return "<tr><td>" + escapeHtml(sc.title) + "</td><td>" + st.correct + " / " + st.total + "</td><td>" + rateCell(st) + "</td></tr>";
        })
        .join("");
      var scTable = document.createElement("table");
      scTable.className = "me-domain-table";
      scTable.innerHTML = "<thead><tr><th>シナリオ</th><th>正答数</th><th>正答率</th></tr></thead><tbody>" + scRows + "</tbody>";
      note.insertAdjacentElement("afterend", scTable);
    }

    renderMailBox(panel, buildReport(data, result, scaled, pass));

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
