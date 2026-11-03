---
layout: default
title: Architect – Professional
nav_order: 6
has_children: true
permalink: /claude/architect-professional/
---

# Claude Certified Architect – Professional 勉強用プロジェクト

Anthropic公式の技術認定「Claude Certified Architect – Professional」(CCAR-P)の学習用フォルダ。
63問・120分の proctored 試験。シナリオバンク形式の Foundations とは異なり、独立した設問(standalone items)で構成される。本番運用を見据えたソリューション設計から、統合・評価・ガバナンス・ステークホルダー対応・ライフサイクル管理まで、シニアアーキテクトに求められる知識を幅広く問う breadth 試験。対象は3年以上のシステムアーキテクチャ経験、かつ6ヶ月以上のClaude本番運用経験を持つ層。試験はPearson VUE経由、Anthropic Partner Academyから申込。合格ライン: スケール100〜1000中720点。

**前提資格はない**。Claude認定プログラムには他の認定の合格を必須とする前提資格(prerequisite)は存在しない。ただし内容的には [`../architect-foundations/`](../architect-foundations/) の基礎知識(Claude Code / Agent SDK / API / MCPの基本)を土台にした発展的な内容のため、実務上はFoundationsを先に学習・受験してからProfessionalに進む学習パスが一般的に取られている。

## 出題ドメインと配点

Claude認定プログラムの中で最も配点の分散が緩やか(最小7%〜最大19%)な試験。

| # | ドメイン | 配点 | フォルダ |
|---|---|---|---|
| 1 | Solution Design & Architecture | 17% | `topics/01-solution-design-architecture/` |
| 2 | Claude Models, Prompting & Context Engineering | 13% | `topics/02-models-prompting-context-engineering/` |
| 3 | Integration | 19%(最大) | `topics/03-integration/` |
| 4 | Evaluation, Testing & Optimization | 16% | `topics/04-evaluation-testing-optimization/` |
| 5 | Governance, Safety & Risk Management | 14% | `topics/05-governance-safety-risk/` |
| 6 | Stakeholder Communication & Lifecycle Management | 14% | `topics/06-stakeholder-communication-lifecycle/` |
| 7 | Developer Productivity & Operational Enablement | 7%(最小) | `topics/07-developer-productivity-operational-enablement/` |

## 全ノートの音声読み上げ

この試験の `topics/` のノートを、ドメイン順に続けて音声で再生します(音声ファイル。画面ロック中も続きます。コード・図・出典は読み飛ばします)。

{% assign ra_notes = site.pages | where_exp: "p", "p.path contains 'claude/architect-professional/topics/'" | where: "name", "notes.md" | sort: "path" %}
<div id="read-aloud-all" data-urls="{% for p in ra_notes %}{{ p.url | relative_url }},{% endfor %}" data-titles="{% for p in ra_notes %}{{ p.title }}|{% endfor %}"></div>

## フォルダ構成

- `topics/` — 上表7ドメインごとのノート(各`notes.md`)
- `practice-questions/` — 練習問題・模擬問題(オリジナル、7ドメインに配点比率で対応)
- `mock-exam/` — `practice-questions/`と同じ問題セットを使った採点機能付きの模擬試験(出題順・選択肢順をランダム化し、解答後に自動採点)

## 参考リンク

- [Pearson VUE: Claude Certification Program](https://www.pearsonvue.com/us/en/anthropic.html)

## 進め方(たたき台)

1. (任意・推奨)[`../architect-foundations/`](../architect-foundations/) で基礎(Claude Code / Agent SDK / API / MCP)を復習する
2. `topics/`の7ドメインを、本番運用・アーキテクチャ設計・ガバナンスの観点で読み進める。特に配点の大きいIntegration(19%)、Solution Design(17%)、Evaluation(16%)を重点的に
3. `practice-questions/`で理解度を確認する
4. `mock-exam/`で本番同様の通し形式で解き、採点結果とドメイン別正答数で弱点を確認する
