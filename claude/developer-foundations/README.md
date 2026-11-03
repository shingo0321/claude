---
layout: default
title: Developer – Foundations
nav_order: 4
has_children: true
permalink: /claude/developer-foundations/
---

# Claude Certified Developer – Foundations 勉強用プロジェクト

Anthropic公式の技術認定「Claude Certified Developer – Foundations」(CCDV-F) の学習用フォルダ。
53問・120分の proctored 試験。Claude API連携、Claude Code、エージェント/ワークフロー設計、モデル選定、プロンプト/コンテキストエンジニアリング、セキュリティ、ツール/MCPなど、Claudeを使ったアプリケーション/エージェント開発全般の知識を問う。試験はPearson VUE経由、Anthropic Partner Academyから申込。合格ライン: スケール100〜1000中720点。

## 出題ドメイン

公式に報告されている8ドメインと出題比重は以下の通り（比重が大きい順）。

| # | ドメイン | 比重 |
|---|---|---|
| 02 | Applications and Integration | 33.1% |
| 05 | Model Selection and Optimization | 16.8% |
| 01 | Agents and Workflows | 14.7% |
| 06 | Prompt and Context Engineering | 11.0% |
| 08 | Tools and MCPs | 10.6% |
| 07 | Security and Safety | 8.1% |
| 03 | Claude Code | 3.1% |
| 04 | Eval, Testing, and Debugging | 2.6% |

## 全ノートの音声読み上げ

この試験の `topics/` のノートを、ドメイン順に続けて読み上げます(ブラウザ内蔵の音声合成を使用。コード・図は読み飛ばします)。

{% assign ra_notes = site.pages | where_exp: "p", "p.path contains 'claude/developer-foundations/topics/'" | where: "name", "notes.md" | sort: "path" %}
<div id="read-aloud-all" data-urls="{% for p in ra_notes %}{{ p.url | relative_url }},{% endfor %}" data-titles="{% for p in ra_notes %}{{ p.title }}|{% endfor %}"></div>

## フォルダ構成

- `topics/` — 試験範囲ごとのノート（ドメイン番号順）
  - `01-agents-and-workflows/` — エージェントループ設計、オーケストレーションパターン、タスク分解
  - `02-applications-and-integration/` — Messages API、ストリーミング、ツールユース、プロンプトキャッシュ、SDK、Claude Agent SDK
  - `03-claude-code/` — Claude Code (CLI, フック, スラッシュコマンド, MCP連携, 設定, サブエージェント)
  - `04-eval-testing-debugging/` — 評価データセット/ルーブリック、ツール呼び出しのデバッグ、ロギング
  - `05-model-selection-optimization/` — Haiku/Sonnet/Opusの選定、拡張思考、コンテキスト管理、コスト最適化
  - `06-prompt-context-engineering/` — システムプロンプト、XML構造化、few-shot、コンテキスト予算配分
  - `07-security-and-safety/` — プロンプトインジェクション対策、最小権限、入出力検証
  - `08-tools-and-mcp/` — Model Context Protocol (サーバー/クライアント、ツール/リソース、トランスポート)
- `practice-questions/` — 練習問題・模擬問題（オリジナル、非公式）
- `mock-exam/` — `practice-questions/`と同じ問題セットを使った採点機能付きの模擬試験(出題順・選択肢順をランダム化し、解答後に自動採点)

## 参考リンク

- [Pearson VUE: Claude Certification Program](https://www.pearsonvue.com/us/en/anthropic.html)

## 進め方(たたき台)

1. `topics/`の8ドメインを比重の高いものから順に読み進め、要点をノートにまとめる
2. `practice-questions/`で理解度を確認する
3. `mock-exam/`で本番同様の通し形式で解き、採点結果とドメイン別正答数で弱点を確認する
