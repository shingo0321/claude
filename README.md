---
layout: default
title: Claude認定 ホーム
nav_order: 1
description: "Claude Certification Program 学習ノート・練習問題"
permalink: /
---

# Claude認定資格 学習サイト

Anthropic公式「Claude Certification Program」の学習用フォルダ。全4試験、いずれもPearson VUE経由のproctored試験(120分、合格ラインはスケール100〜1000中720点)。前提資格は4試験とも**なし**(Architect – ProfessionalもFoundations合格は必須ではない)。試験・準備用コンテンツは英語と日本語で提供されています(公式FAQ)。

> 練習問題はすべて自己学習用に作成したオリジナル問題であり、Anthropic公式の実際の試験問題ではありません。

## 資格一覧

| フォルダ | 資格名 | 受験料 | 出題数 | ドメイン数 |
| --- | --- | --- | --- | --- |
| [`associate-foundations/`](associate-foundations/) | Claude Certified Associate – Foundations (CCAO-F) | $99 | 60問 | 7 |
| [`developer-foundations/`](developer-foundations/) | Claude Certified Developer – Foundations (CCDV-F) | $125 | 53問 | 8 |
| [`architect-foundations/`](architect-foundations/) | Claude Certified Architect – Foundations (CCAR-F) | $125 | 60問(4シナリオ) | 5 |
| [`architect-professional/`](architect-professional/) | Claude Certified Architect – Professional (CCAR-P) | $175 | 63問 | 7 |

## 出題形式

公式の試験ガイドによる。

- 4試験とも、問題の形式は**選択式(multiple-choice)**と**複数選択(multiple-response)**。各問題は、いくつ選ぶかを問題文に明記する。
- **Architect – Foundations**はシナリオベースの出題で、各シナリオが現実の本番環境の状況を示し、それに関連する一連の問題が続く。公式の6シナリオ(カスタマーサポート、Claude Codeでのコード生成、マルチエージェント調査、開発者生産性、CIでのClaude Code、構造化データ抽出)から、本番ではランダムに4つが出題される。

## 受験の流れ・ルール

Pearson VUEの公式ページ(最終更新日: 2026-10-02)とAnthropic Partner AcademyのFAQに基づく。

- 対象: Claude Partner Networkに所属する組織が対象。認定はパートナー資格の評価にも反映される。
- 事前学習: Anthropic Partner Academyで自己学習型コースを受講できる(Claude Partner Network会員向け)。
- 申込み: Partner Academyに登録後、Pearsonアカウントで受験予約する。
- 受験形式: テストセンター、またはOnVUE(オンライン監督付き)から選べる。
- 再受験: 不合格後、1回目の後は14日、2回目の後は30日、3回目の後は90日で再受験できる。ローリング12か月で最大4回まで(試験ごとに適用)。
- 予約の変更・キャンセル: 予約の48時間前までに行う。遅れると受験料は没収される。
- 氏名の訂正: 試験の24時間前までに申請する。
- デジタルバッジ: Credlyを通じて発行される。
- 提供言語: 試験・準備用コンテンツとも英語と日本語(Partner Academy FAQ)。
- 試験中のルール: クローズドブック。メモ・資料・AIアシスタント・ブラウザの翻訳ツールは使用不可。解答時間は120分で、チェックイン等を含め約135分の着席時間が必要。
- 受験資格: パートナー組織の従業員で、18歳以上、認定されたパートナーのメールドメインを使用すること。
- 受験料: Architect – Foundationsは2026年6月30日以降$125(それ以前は$99)。いずれもパートナー割引適用前。

各資格で対象読者・出題ドメインが異なるため、`topics/`配下のフォルダ構成は資格ごとに公式ドメイン名で揃えている(詳細は各フォルダの`README.md`を参照)。

- Associate: 業務でClaudeを使いこなす利用者向け(プロンプト設計、出力評価、製品/モデル選定、ワークフロー統合、ガバナンス等)
- Developer: Claudeを使ったアプリ/エージェント実装者向け(API統合、Claude Code、モデル選定、ツール/MCP実装等)
- Architect Foundations: ソリューション設計の基礎(エージェント型アーキテクチャ、ツール設計/MCP、Claude Code、プロンプト設計、コンテキスト管理)
- Architect Professional: 本番運用を統括する上級アーキテクト向け(設計、統合、評価、ガバナンス、ステークホルダー対応、開発者生産性)

各フォルダ共通:

- `topics/` — 公式ドメインごとのノート
- `practice-questions/` — 練習問題・模擬問題(独自作成、実際の試験問題ではない)
- `mock-exam/` — `practice-questions/`と同じ問題セットを使った採点機能付きの模擬試験(ブラウザ上で解答し、自動採点・ドメイン別の正答数を表示)

## 全体像

- [知識の俯瞰図]({{ site.baseurl }}/overview/) — 4試験の知識をテーマ別に整理し、試験×テーマの対応を一覧できるページ
- 試験別の「覚える内容の俯瞰図」 — 各ドメインで覚える具体的な内容(正答の型・誤答になりやすい例)を図と表で整理したページ: [Associate]({{ site.baseurl }}/associate-foundations/overview/)・[Developer]({{ site.baseurl }}/developer-foundations/overview/)・[Architect Foundations]({{ site.baseurl }}/architect-foundations/overview/)・[Architect Professional]({{ site.baseurl }}/architect-professional/overview/)

## 参考リンク

- [Pearson VUE: Claude Certification Program](https://www.pearsonvue.com/us/en/anthropic.html)
- [Anthropic Partner Academy: 認定FAQ](https://anthropic-partners.skilljar.com/page/faq-certifications)
