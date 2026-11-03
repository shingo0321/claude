---
layout: default
title: 知識の俯瞰図
nav_order: 2
description: "4試験の知識をテーマ別に整理した俯瞰図と、試験×テーマの対応表"
permalink: /overview/
---

# 知識の俯瞰図

4試験(計27ドメイン)で問われる知識を、試験の枠を越えて **8つのテーマ** に整理したページです。
全体像 → テーマ別の詳細 → 「どの試験のどの章で扱うか」の対応表 の順に見ていきます。

## 1. 全体像

```mermaid
flowchart LR
  ROOT(["Claudeを業務・開発・<br/>組織で使いこなす"])
  ROOT --> T1["プロンプト/コンテキスト設計"]
  ROOT --> T2["API統合・モデル選定・<br/>最適化"]
  ROOT --> T3["ツール設計とMCP"]
  ROOT --> T4["エージェント設計"]
  ROOT --> T5["Claude Code"]
  ROOT --> T6["評価・テスト・デバッグ"]
  ROOT --> T7["ガバナンス・安全性"]
  ROOT --> T8["組織導入・コミュニケーション"]
  T1 --> T1a["指示の構造化: XML・<br/>few-shot・段階的思考"]
  T1 --> T1b["コンテキスト管理: 要約・<br/>圧縮・RAG・キャッシュ"]
  T2 --> T2a["Messages API・ストリーミング・<br/>バッチ"]
  T2 --> T2b["モデル階層の選定とコスト・<br/>遅延の最適化"]
  T3 --> T3a["ツール定義・エラー応答・<br/>tool_choice"]
  T3 --> T3b["MCPの構成・スコープ・<br/>組織規模の統合"]
  T4 --> T4a["ワークフロー vs エージェント"]
  T4 --> T4b["マルチエージェント・<br/>人の関与"]
  T5 --> T5a["CLAUDE.md・rules・<br/>コマンド・スキル"]
  T5 --> T5b["フック・権限・サブエージェント・<br/>CI"]
  T6 --> T6a["評価データセット・ルーブリック・<br/>LLM-as-judge"]
  T6 --> T6b["回帰テスト・本番監視・<br/>原因切り分け"]
  T7 --> T7a["プロンプトインジェクション・<br/>最小権限"]
  T7 --> T7b["プライバシー・責任あるAI・監査"]
  T8 --> T8a["Projects・ナレッジ・<br/>チーム設定"]
  T8 --> T8b["経営層への説明・変更管理・<br/>引き継ぎ"]
```

## 2. テーマ別の詳細

### 2-1. プロンプト/コンテキスト設計

```mermaid
flowchart TD
  P["良い依頼文: 目的・<br/>読み手・形式・成功基準"] --> S["構造化: XMLタグで<br/>指示と資料を区別"]
  S --> F["出力の安定化: few-shot<br/>・スキーマ"]
  F --> R["推論の質: 段階的思考・<br/>拡張思考"]
  C["コンテキスト管理"] --> C1["変わらない部分を<br/>先頭にしてキャッシュ"]
  C --> C2["長い履歴は要約・<br/>圧縮して引き継ぐ"]
  C --> C3["必要な情報だけを<br/>検索して注入"]
```

### 2-2. エージェント設計

```mermaid
flowchart TD
  Q{"手順は事前に決められるか"}
  Q -->|はい| W["ワークフロー: チェイニング・<br/>ルーティング・並列化"]
  Q -->|いいえ| A["エージェント: 計画→<br/>実行→観察のループ"]
  A --> G["コード側で上限・停止条件・<br/>予算を設ける"]
  A --> M["複雑なら: コーディネーター<br/>+ サブエージェント"]
  M --> H["影響の大きい操作は人の<br/>承認を挟む"]
  W --> H
```

### 2-3. Claude Code の設定の層

```mermaid
flowchart LR
  subgraph 共有する設定
    CM["CLAUDE.md: 階層・スコープ"]
    RU[".claude/rules: パス指定の規約"]
    CMD[".claude/commands・スキル: 定型ワークフロー"]
    MCPJ[".mcp.json: MCPサーバー構成"]
  end
  subgraph 確実に制御する仕組み
    HK["フック: ツール実行の前後で強制"]
    PM["権限: allow / deny・managed settings"]
    SA["サブエージェント: ツールを絞った専用役割"]
  end
  CI["CI/CD: 非対話モードで自動実行"]
  CM --> CI
  HK --> CI
  PM --> CI
```

### 2-4. 評価と改善のループ

```mermaid
flowchart TD
  D1["評価データセット: 代表例・<br/>エッジ・過去の失敗"] --> E1["採点: ルーブリック・<br/>LLM-as-judge・人手"]
  E1 --> R1["変更前後で比較: 回帰を検知"]
  R1 --> O1["本番: トレース・メトリクス・<br/>アラート"]
  O1 --> I1["失敗例を収集し原因を<br/>切り分け"]
  I1 --> D1
```

## 3. 試験 × テーマの対応表

各セルのリンクは、そのテーマを扱うノートです(「—」は専用のドメインなし)。

> 割り当ての基準は、各ドメインの主題に最も近いテーマです。専用のドメインがない場合は、ノートの中で扱っている内容で補っています(例: Arch-F 04 は、プロンプトのバージョン管理・テストを扱うため「評価・テスト・デバッグ」に含めています。Arch-F のフックによるガバナンスは、Arch-F 03 のノート内で扱うため「Claude Code」の行に入っています)。

| テーマ | Associate | Developer | Architect Foundations | Architect Professional |
|---|---|---|---|---|
| **プロンプト/コンテキスト設計** | [Assoc 01]({{ site.baseurl }}/associate-foundations/topics/01-prompting-task-execution/notes.html) | [Dev 06]({{ site.baseurl }}/developer-foundations/topics/06-prompt-context-engineering/notes.html) | [Arch-F 04]({{ site.baseurl }}/architect-foundations/topics/04-prompt-engineering/notes.html)<br>[Arch-F 05]({{ site.baseurl }}/architect-foundations/topics/05-context-management/notes.html) | [Arch-P 02]({{ site.baseurl }}/architect-professional/topics/02-models-prompting-context-engineering/notes.html) |
| **API統合・モデル選定・最適化** | [Assoc 03]({{ site.baseurl }}/associate-foundations/topics/03-product-model-selection/notes.html) | [Dev 02]({{ site.baseurl }}/developer-foundations/topics/02-applications-and-integration/notes.html)<br>[Dev 05]({{ site.baseurl }}/developer-foundations/topics/05-model-selection-optimization/notes.html) | — | [Arch-P 02]({{ site.baseurl }}/architect-professional/topics/02-models-prompting-context-engineering/notes.html)<br>[Arch-P 04]({{ site.baseurl }}/architect-professional/topics/04-evaluation-testing-optimization/notes.html) |
| **ツール設計とMCP** | — | [Dev 08]({{ site.baseurl }}/developer-foundations/topics/08-tools-and-mcp/notes.html) | [Arch-F 02]({{ site.baseurl }}/architect-foundations/topics/02-tool-design-mcp/notes.html) | [Arch-P 03]({{ site.baseurl }}/architect-professional/topics/03-integration/notes.html) |
| **エージェント設計** | [Assoc 04]({{ site.baseurl }}/associate-foundations/topics/04-workflow-integration-solution-design/notes.html) | [Dev 01]({{ site.baseurl }}/developer-foundations/topics/01-agents-and-workflows/notes.html) | [Arch-F 01]({{ site.baseurl }}/architect-foundations/topics/01-agentic-architecture/notes.html) | [Arch-P 01]({{ site.baseurl }}/architect-professional/topics/01-solution-design-architecture/notes.html) |
| **Claude Code** | — | [Dev 03]({{ site.baseurl }}/developer-foundations/topics/03-claude-code/notes.html) | [Arch-F 03]({{ site.baseurl }}/architect-foundations/topics/03-claude-code/notes.html) | [Arch-P 07]({{ site.baseurl }}/architect-professional/topics/07-developer-productivity-operational-enablement/notes.html) |
| **評価・テスト・デバッグ** | [Assoc 02]({{ site.baseurl }}/associate-foundations/topics/02-output-evaluation-validation/notes.html)<br>[Assoc 07]({{ site.baseurl }}/associate-foundations/topics/07-troubleshooting-escalation/notes.html) | [Dev 04]({{ site.baseurl }}/developer-foundations/topics/04-eval-testing-debugging/notes.html) | [Arch-F 04]({{ site.baseurl }}/architect-foundations/topics/04-prompt-engineering/notes.html) | [Arch-P 04]({{ site.baseurl }}/architect-professional/topics/04-evaluation-testing-optimization/notes.html) |
| **ガバナンス・安全性** | [Assoc 06]({{ site.baseurl }}/associate-foundations/topics/06-governance-risk-responsible-use/notes.html) | [Dev 07]({{ site.baseurl }}/developer-foundations/topics/07-security-and-safety/notes.html) | — | [Arch-P 05]({{ site.baseurl }}/architect-professional/topics/05-governance-safety-risk/notes.html) |
| **組織導入・コミュニケーション** | [Assoc 05]({{ site.baseurl }}/associate-foundations/topics/05-configuration-knowledge-management/notes.html) | — | — | [Arch-P 06]({{ site.baseurl }}/architect-professional/topics/06-stakeholder-communication-lifecycle/notes.html)<br>[Arch-P 07]({{ site.baseurl }}/architect-professional/topics/07-developer-productivity-operational-enablement/notes.html) |

## 4. 試験別のドメインと配点

### Associate – Foundations

> Assoc 07 のフォルダ名は `07-troubleshooting-escalation` ですが、公式のドメイン名は「Troubleshooting and Optimization」です(リンク切れを避けるためフォルダ名は変えていません)。

| ドメイン | 名称 | 配点 |
|---|---|---|
| [Assoc 01]({{ site.baseurl }}/associate-foundations/topics/01-prompting-task-execution/notes.html) | Prompting and Task Execution | 14% |
| [Assoc 02]({{ site.baseurl }}/associate-foundations/topics/02-output-evaluation-validation/notes.html) | Output Evaluation and Validation | 21% |
| [Assoc 03]({{ site.baseurl }}/associate-foundations/topics/03-product-model-selection/notes.html) | Product and Model Selection | 12% |
| [Assoc 04]({{ site.baseurl }}/associate-foundations/topics/04-workflow-integration-solution-design/notes.html) | Workflow Integration and Solution Design | 16% |
| [Assoc 05]({{ site.baseurl }}/associate-foundations/topics/05-configuration-knowledge-management/notes.html) | Configuration and Knowledge Management | 12% |
| [Assoc 06]({{ site.baseurl }}/associate-foundations/topics/06-governance-risk-responsible-use/notes.html) | Governance, Risk, and Responsible Use | 15% |
| [Assoc 07]({{ site.baseurl }}/associate-foundations/topics/07-troubleshooting-escalation/notes.html) | Troubleshooting and Optimization | 10% |

### Developer – Foundations

| ドメイン | 名称 | 配点 |
|---|---|---|
| [Dev 01]({{ site.baseurl }}/developer-foundations/topics/01-agents-and-workflows/notes.html) | Agents and Workflows | 14.7% |
| [Dev 02]({{ site.baseurl }}/developer-foundations/topics/02-applications-and-integration/notes.html) | Applications and Integration | 33.1% |
| [Dev 03]({{ site.baseurl }}/developer-foundations/topics/03-claude-code/notes.html) | Claude Code | 3.1% |
| [Dev 04]({{ site.baseurl }}/developer-foundations/topics/04-eval-testing-debugging/notes.html) | Eval, Testing, and Debugging | 2.6% |
| [Dev 05]({{ site.baseurl }}/developer-foundations/topics/05-model-selection-optimization/notes.html) | Model Selection and Optimization | 16.8% |
| [Dev 06]({{ site.baseurl }}/developer-foundations/topics/06-prompt-context-engineering/notes.html) | Prompt and Context Engineering | 11.0% |
| [Dev 07]({{ site.baseurl }}/developer-foundations/topics/07-security-and-safety/notes.html) | Security and Safety | 8.1% |
| [Dev 08]({{ site.baseurl }}/developer-foundations/topics/08-tools-and-mcp/notes.html) | Tools and MCPs | 10.6% |

### Architect – Foundations

| ドメイン | 名称 | 配点 |
|---|---|---|
| [Arch-F 01]({{ site.baseurl }}/architect-foundations/topics/01-agentic-architecture/notes.html) | Agentic Architecture | 27% |
| [Arch-F 02]({{ site.baseurl }}/architect-foundations/topics/02-tool-design-mcp/notes.html) | Tool Design & MCP | 18% |
| [Arch-F 03]({{ site.baseurl }}/architect-foundations/topics/03-claude-code/notes.html) | Claude Code | 20% |
| [Arch-F 04]({{ site.baseurl }}/architect-foundations/topics/04-prompt-engineering/notes.html) | Prompt Engineering | 20% |
| [Arch-F 05]({{ site.baseurl }}/architect-foundations/topics/05-context-management/notes.html) | Context Management | 15% |

### Architect – Professional

| ドメイン | 名称 | 配点 |
|---|---|---|
| [Arch-P 01]({{ site.baseurl }}/architect-professional/topics/01-solution-design-architecture/notes.html) | Solution Design & Architecture | 17% |
| [Arch-P 02]({{ site.baseurl }}/architect-professional/topics/02-models-prompting-context-engineering/notes.html) | Claude Models, Prompting & Context Engineering | 13% |
| [Arch-P 03]({{ site.baseurl }}/architect-professional/topics/03-integration/notes.html) | Integration | 19% |
| [Arch-P 04]({{ site.baseurl }}/architect-professional/topics/04-evaluation-testing-optimization/notes.html) | Evaluation, Testing & Optimization | 16% |
| [Arch-P 05]({{ site.baseurl }}/architect-professional/topics/05-governance-safety-risk/notes.html) | Governance, Safety & Risk Management | 14% |
| [Arch-P 06]({{ site.baseurl }}/architect-professional/topics/06-stakeholder-communication-lifecycle/notes.html) | Stakeholder Communication & Lifecycle Management | 14% |
| [Arch-P 07]({{ site.baseurl }}/architect-professional/topics/07-developer-productivity-operational-enablement/notes.html) | Developer Productivity & Operational Enablement | 7% |
