// 午前I(高度共通)。answers は問1から順の正答(IPA公式の解答例より転記)。
(function () {
  var B = "https://www.ipa.go.jp/shiken/mondai-kaiotu/";
  function set(id, label, dir, y, answers) {
    return {
      id: id,
      label: label,
      qsUrl: B + dir + "/" + y + "a_koudo_am1_qs.pdf",
      ansUrl: B + dir + "/" + y + "a_koudo_am1_ans.pdf",
      answers: answers,
    };
  }
  window.IPA_EXAM_DATA = {
    storageKey: "ipa-am1",
    title: "午前I(高度共通)",
    sets: [
      set("R07", "令和7年度 秋期", "nl10bi0000009lh8-att", "2025r07", "イイイエイエアイアウアイウアアイエエウアエイアエウイイイイア"),
      set("R06", "令和6年度 秋期", "m42obm000000afqx-att", "2024r06", "エウイイエエウウエウウアアウイアイウエエアウイイアウウイウア"),
      set("R05", "令和5年度 秋期", "ps6vr70000010d6y-att", "2023r05", "アアウウエアアイアイエウウアアエアエアイイウイエエイウイイア"),
      set("R04", "令和4年度 秋期", "gmcbt80000008smf-att", "2022r04", "エイイエウイウアウイウウイイアアウイウイエウエイエイエウウウ"),
    ],
    notes: {},
  };
})();
