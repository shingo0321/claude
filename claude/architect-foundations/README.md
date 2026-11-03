---
layout: default
title: Architect – Foundations
nav_order: 5
has_children: true
permalink: /claude/architect-foundations/
---

# Claude Certified Architect – Foundations 勉強用プロジェクト

Anthropic公式の技術認定「Claude Certified Architect – Foundations」の学習用フォルダ。
60問・120分の proctored 試験(シナリオ形式、6件のシナリオバンクから4件出題)。Claude Code / MCP / エージェント型アーキテクチャ / プロンプト設計 / コンテキスト管理の基礎知識を問う。試験はPearson VUE経由、Anthropic Partner Academyから申込。合格ライン: スケール100〜1000中720点。上位資格 [`../architect-professional/`](../architect-professional/) と内容面では関連するが、前提資格(必須の合格条件)ではない — Claude認定プログラムに他資格を前提とする試験はない。

## 全ノートの音声読み上げ

この試験の `topics/` のノートを、ドメイン順に続けて音声で再生します(音声ファイル。画面ロック中も続きます。コード・図・出典は読み飛ばします)。

{% assign ra_notes = site.pages | where_exp: "p", "p.path contains 'claude/architect-foundations/topics/'" | where: "name", "notes.md" | sort: "path" %}
<div id="read-aloud-all" data-urls="{% for p in ra_notes %}{{ p.url | relative_url }},{% endfor %}" data-titles="{% for p in ra_notes %}{{ p.title }}|{% endfor %}"></div>

## フォルダ構成

- `topics/` — 試験範囲(5ドメイン)ごとのノート
  - `01-agentic-architecture/` — Agentic Architecture(27%、最重要ドメイン。エージェントループ、シングル/マルチエージェント設計、状態管理、エラー回復、human-in-the-loop、コスト/レイテンシのトレードオフ)
  - `02-tool-design-mcp/` — Tool Design & MCP(18%。ツールインターフェース設計、MCPサーバーアーキテクチャ、トランスポート、権限・スコープ設計、コントラクトのバージョニング)
  - `03-claude-code/` — Claude Code(20%。CLIアーキテクチャ、フックによるガバナンス、サブエージェント、権限モード、プロジェクト単位のMCP構成、CI/チームワークフロー統合)
  - `04-prompt-engineering/` — Prompt Engineering(20%。本番向けシステムプロンプト設計、バージョニング/テスト、構造化出力、曖昧さへの対処、few-shot戦略)
  - `05-context-management/` — Context Management(15%。コンテキストウィンドウ予算設計、プロンプトキャッシュ戦略、RAGアーキテクチャ、要約/圧縮、マルチターン状態管理)
- `practice-questions/` — 練習問題・模擬問題(オリジナル作成、実試験の問題そのものではない)
- `mock-exam/` — `practice-questions/`と同じ問題セットを使った採点機能付きの模擬試験(出題順・選択肢順をランダム化し、解答後に自動採点)

## 参考リンク

- [Pearson VUE: Claude Certification Program](https://www.pearsonvue.com/us/en/anthropic.html)
- [Architect – Foundations 認定ページ(Partner Academy)](https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification) — 公式の試験ガイド(PDF、日本語版あり)へのリンクがある。`topics/`のノートはこのガイドのタスク記述に沿っている

## 進め方(たたき台)

1. `topics/`の5ドメインをそれぞれ読み進め、要点をノートにまとめる(配点の高い`01-agentic-architecture/`を優先)
2. `practice-questions/`で理解度を確認する
3. `mock-exam/`で本番同様の通し形式で解き、採点結果とドメイン別正答数で弱点を確認する
