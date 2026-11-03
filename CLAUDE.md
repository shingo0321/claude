# CLAUDE.md

このファイルは、このディレクトリで作業する際にClaude Codeへガイダンスを提供するものです。

## これは何か

Claude認定プログラムの学習ノート、gitリポジトリ(`shingo0321/claude`、公開URLは`/claude/`)。`study/`配下の3リポジトリ(`study/claude/`=このリポジトリ、`study/ipa/`=`shingo0321/ipa`、`study/english/`=`shingo0321/english`)の1つで、`study/`自体はgitリポジトリではない。このリポジトリのルートはフォルダ`study/claude/`で、試験フォルダ(`associate-foundations/`など)はルート直下にある。パスワードゲート(`_includes/head_custom.html`)は`ipa`・`english`と同じパスワード・保存キーを使うので、変えるときは3つを合わせること。

- ルート直下 — Anthropic公式のClaude認定プログラム(4試験、すべてPearson VUE経由)。試験ごとに1フォルダ: `associate-foundations/`、`developer-foundations/`、`architect-foundations/`、`architect-professional/`。試験一覧は`README.md`を、各試験のドメイン内訳はそれぞれの試験フォルダの`README.md`を参照。各試験フォルダは同じ構成に従う: `topics/<NN-domain-name>/notes.md`(公式試験ドメインごとに1ファイル) + `practice-questions/README.md`(独自の練習問題、実際の試験内容ではない)。

## 補足事項

- `overview.md` — 4試験の知識をテーマ別に整理した俯瞰図ページ(Mermaid図 + 試験×テーマの対応表)。Mermaidは`_config.yml`の`mermaid`設定と`_includes/mermaid_config.js`で有効化している。試験のドメインやノートを追加・改名したら、このページの対応表のリンクも更新する。
- `<試験>/overview.md` — 試験別の「覚える内容の俯瞰図」(ドメインごとのMermaid図 + 「覚える項目・正答の型・誤答になりやすい例」の表)。根拠は各`topics/*/notes.md`と練習問題(`mock-exam-data.js`)の正答。ノートや練習問題の正答を変えたら、該当ページの表も合わせて更新する。

- `<試験>/mock-exam/mock-exam-data.js` — 模擬試験の問題データ(エンジンは`assets/js/mock-exam.js`)。各問は`explanation`(正答の理由)に加え、`runnerUp`(次点: `{letter, why}`)・`others`(ほかの誤答の理由: 文字→理由)・任意の`deep`(見分け方)・`fig`(図: `steps`/`end`/`back`のフロー、または`kind:"table"`の表)を持つ。文字はデータ中の元の文字で、エンジンが選択肢のシャッフル後の表示文字に変換するので、`explanation`の本文に「Bは…」のように選択肢の文字を書かないこと。問題を足したり正答を変えたら、`practice-questions/README.md`(同じ内容を`次点`・`ほかの選択肢`込みで掲載)と、各試験の`overview.md`も合わせて更新する。

- 模擬試験の結果メール — 結果画面で、本文=要約(スコア・分野別正答率・不正解/未解答の問題ID)、添付=詳細の.md(問題文・選択肢・自分の回答・正解)のメールを作る(`assets/js/mock-exam.js`の`buildReport`・`renderMailBox`)。mailtoはファイルを添付できないため、スマートフォン等は「共有」(Web Share API)、パソコンは「.mdを保存してmailtoを開く」。外部サービスは使わない。問題IDは`mock-exam-data.js`の`id`で、シャッフルしても変わらない。サイト上にはメールの用途(Claudeなど)を書かない。宛先はユーザーが入力し、そのブラウザのlocalStorageにだけ保存する。
- これは親ワークスペース`c:\Users\snows\Claude\`(それ自体はgitリポジトリではない)・`study/ipa/`・`study/english/`とは別のgitリポジトリである。
- 内容は日本語で書かれている。
