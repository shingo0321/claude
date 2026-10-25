// 午前II(プロジェクトマネージャ)。answers は問1から順の正答(IPA公式の解答例より転記)。
(function () {
  var B = "https://www.ipa.go.jp/shiken/mondai-kaiotu/";
  function set(id, label, dir, y, answers) {
    return {
      id: id,
      label: label,
      qsUrl: B + dir + "/" + y + "a_pm_am2_qs.pdf",
      ansUrl: B + dir + "/" + y + "a_pm_am2_ans.pdf",
      answers: answers,
    };
  }
  window.IPA_EXAM_DATA = {
    storageKey: "ipa-am2-pm",
    title: "午前II(PM)",
    sets: [
      set("R07", "令和7年度 秋期", "nl10bi0000009lh8-att", "2025r07", "エイアイアイウアエイウエエアイイエウイエウアエアエ"),
      set("R06", "令和6年度 秋期", "m42obm000000afqx-att", "2024r06", "イアウウエイエウアエイイイアイイエイアエウイエエウ"),
      set("R05", "令和5年度 秋期", "ps6vr70000010d6y-att", "2023r05", "イイアアエイイアウアアイエイアエアウウウイウアエイ"),
      set("R04", "令和4年度 秋期", "gmcbt80000008smf-att", "2022r04", "イエアアエエイエウエエアアウエエエエエウイエイエウ"),
    ],
    notes: {},
  };
})();
