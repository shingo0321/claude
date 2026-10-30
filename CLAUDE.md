# CLAUDE.md

このファイルは、このディレクトリで作業する際にClaude Codeへガイダンスを提供するものです。

## これは何か

個人の学習ノート、gitリポジトリ(`shingo0321/study`)。科目ごとに1フォルダ構成で、現時点では`claude/`のみ存在する。

- `claude/` — Anthropic公式のClaude認定プログラム(4試験、すべてPearson VUE経由)。試験ごとに1フォルダ: `associate-foundations/`、`developer-foundations/`、`architect-foundations/`、`architect-professional/`。試験一覧は`claude/README.md`を、各試験のドメイン内訳はそれぞれの試験フォルダの`README.md`を参照。各試験フォルダは同じ構成に従う: `topics/<NN-domain-name>/notes.md`(公式試験ドメインごとに1ファイル) + `practice-questions/README.md`(独自の練習問題、実際の試験内容ではない)。

- `ipa-koudo/` — 情報処理技術者試験の**高度試験区分のみ**の学習サイト。`am1/`(午前I・共通)、区分ごとのフォルダ(現在は`pm/`のみ。`am2/`に午前II演習、`pm1/topics/<NN-theme>/notes.md`に午後I学習ノート)。過去問の問題文はIPAの著作物のため**収録しない**: 演習は`assets/js/ipa-exam.js`(共通エンジン)+各ページの`*-data.js`で、年度ごとの正答(IPA公式の解答例から転記)と公式PDFリンクを持つ。分野・解説は`*-data.js`の`notes`(キー`<年度ID>-<問番号>`)に追記できる。新年度を追加するときは`sets`にIPAの解答例PDFを見て正答文字列を追加する(解答例PDFはテキスト抽出できないため画像化して目視で転記した)。区分を増やすときは`pm/`と並べてフォルダを作り、`ipa-koudo/README.md`の収録範囲表を更新する。

## 補足事項

- `claude/overview.md` — 4試験の知識をテーマ別に整理した俯瞰図ページ(Mermaid図 + 試験×テーマの対応表)。Mermaidは`_config.yml`の`mermaid`設定と`_includes/mermaid_config.js`で有効化している。試験のドメインやノートを追加・改名したら、このページの対応表のリンクも更新する。
- `claude/<試験>/overview.md` — 試験別の「覚える内容の俯瞰図」(ドメインごとのMermaid図 + 「覚える項目・正答の型・誤答になりやすい例」の表)。根拠は各`topics/*/notes.md`と練習問題(`mock-exam-data.js`)の正答。ノートや練習問題の正答を変えたら、該当ページの表も合わせて更新する。

- `claude/<試験>/mock-exam/mock-exam-data.js` — 模擬試験の問題データ(エンジンは`assets/js/mock-exam.js`)。各問は`explanation`(正答の理由)に加え、`runnerUp`(次点: `{letter, why}`)・`others`(ほかの誤答の理由: 文字→理由)・任意の`deep`(見分け方)・`fig`(図: `steps`/`end`/`back`のフロー、または`kind:"table"`の表)を持つ。文字はデータ中の元の文字で、エンジンが選択肢のシャッフル後の表示文字に変換するので、`explanation`の本文に「Bは…」のように選択肢の文字を書かないこと。問題を足したり正答を変えたら、`practice-questions/README.md`(同じ内容を`次点`・`ほかの選択肢`込みで掲載)と、各試験の`overview.md`も合わせて更新する。

- これは親ワークスペース`c:\Users\snows\Claude\`(それ自体はgitリポジトリではない)とは別のgitリポジトリである。
- 内容は日本語で書かれている。
