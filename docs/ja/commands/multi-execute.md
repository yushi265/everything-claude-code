# Execute - マルチモデル協調実行

マルチモデル協調実行 - 計画からプロトタイプを取得 → Claude がリファクタリングして実装 → マルチモデル監査と配信。

$ARGUMENTS

---

## コアプロトコル

- **言語プロトコル**: ツール/モデルと対話するときは**英語**を使用、ユーザーとはユーザーの言語でコミュニケーション
- **コード主権**: 外部モデルは**ファイルシステムへの書き込みアクセスがゼロ**、すべての変更は Claude が実行
- **ダーティプロトタイプのリファクタリング**: Codex/Gemini の Unified Diff を「ダーティプロトタイプ」として扱い、プロダクショングレードのコードにリファクタリングする必要あり
- **損失制限メカニズム**: 現在のフェーズの出力が検証されるまで次のフェーズに進まない
- **前提条件**: `/ccg:plan` の出力に対してユーザーが明示的に「Y」と返信した後にのみ実行（欠落している場合は、最初に確認する必要あり）

---

## マルチモデル呼び出し仕様

**呼び出し構文**（並列: `run_in_background: true` を使用）:

```
# セッション再開呼び出し（推奨）- 実装プロトタイプ
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <ロールプロンプトパス>
<TASK>
Requirement: <タスクの説明>
Context: <計画内容 + 対象ファイル>
</TASK>
OUTPUT: Unified Diff Patch のみ。実際の変更を厳しく禁止。
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Brief description"
})

# 新規セッション呼び出し - 実装プロトタイプ
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <ロールプロンプトパス>
<TASK>
Requirement: <タスクの説明>
Context: <計画内容 + 対象ファイル>
</TASK>
OUTPUT: Unified Diff Patch のみ。実際の変更を厳しく禁止。
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Brief description"
})
```

**監査呼び出し構文**（コードレビュー / 監査）:

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <ロールプロンプトパス>
<TASK>
Scope: 最終的なコード変更を監査する。
Inputs:
- 適用されたパッチ（git diff / 最終的な unified diff）
- 触れられたファイル（必要に応じて関連する抜粋）
Constraints:
- ファイルを変更しないでください。
- ファイルシステムアクセスを前提とするツールコマンドを出力しないでください。
</TASK>
OUTPUT:
1) 優先度付けされた問題リスト（重大度、ファイル、理由）
2) 具体的な修正。コード変更が必要な場合は、フェンス付きコードブロックに Unified Diff Patch を含めてください。
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Brief description"
})
```

**モデルパラメータのノート**:
- `{{GEMINI_MODEL_FLAG}}`: `--backend gemini` を使用する場合、`--gemini-model gemini-3-pro-preview ` に置き換える（末尾のスペースに注意）。codex の場合は空文字列を使用

**ロールプロンプト**:

| フェーズ | Codex | Gemini |
|-------|-------|--------|
| 実装 | `~/.claude/.ccg/prompts/codex/architect.md` | `~/.claude/.ccg/prompts/gemini/frontend.md` |
| レビュー | `~/.claude/.ccg/prompts/codex/reviewer.md` | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**セッションの再利用**: `/ccg:plan` が SESSION_ID を提供した場合、`resume <SESSION_ID>` を使用してコンテキストを再利用します。

**バックグラウンドタスクを待つ**（最大タイムアウト 600000ms = 10 分）:

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**重要**:
- `timeout: 600000` を指定する必要があります。そうしないとデフォルトの 30 秒で早期タイムアウトします
- 10 分後も不完全な場合は、`TaskOutput` でポーリングを続けます。**絶対にプロセスを kill しない**
- タイムアウトによりスキップされた場合は、**ユーザーに待ち続けるかタスクを kill するか尋ねる `AskUserQuestion` を呼び出す必要あり**

---

## 実行ワークフロー

**実行タスク**: $ARGUMENTS

### フェーズ 0: 計画を読む

`[Mode: Prepare]`

1. **入力タイプの識別**:
   - 計画ファイルパス（例: `.claude/plan/xxx.md`）
   - 直接タスク説明

2. **計画内容を読む**:
   - 計画ファイルパスが提供されている場合、読んで解析
   - 抽出: タスクタイプ、実装ステップ、キーファイル、SESSION_ID

3. **実行前確認**:
   - 入力が「直接タスク説明」の場合、または計画に `SESSION_ID` / キーファイルが欠けている場合: 最初にユーザーに確認
   - ユーザーが計画に「Y」と返信したことを確認できない場合: 進む前に再度確認する必要あり

4. **タスクタイプルーティング**:

   | タスクタイプ | 検出 | ルート |
   |-----------|-----------|-------|
   | **Frontend** | ページ、コンポーネント、UI、スタイル、レイアウト | Gemini |
   | **Backend** | API、インターフェース、データベース、ロジック、アルゴリズム | Codex |
   | **Fullstack** | フロントエンドとバックエンドの両方を含む | Codex ∥ Gemini 並列 |

---

### フェーズ 1: クイックコンテキスト取得

`[Mode: Retrieval]`

**クイックコンテキスト取得には MCP ツールを使用する必要があります。ファイルを一つずつ手動で読まないでください**

計画の「キーファイル」リストに基づいて、`mcp__ace-tool__search_context` を呼び出します:

```
mcp__ace-tool__search_context({
  query: "<計画内容に基づくセマンティッククエリ（キーファイル、モジュール、関数名を含む）>",
  project_root_path: "$PWD"
})
```

**取得戦略**:
- 計画の「キーファイル」テーブルから対象パスを抽出
- カバー範囲を含むセマンティッククエリを構築: エントリーファイル、依存モジュール、関連する型定義
- 結果が不十分な場合、1-2 回の再帰的取得を追加
- **絶対に** Bash + find/ls を使用してプロジェクト構造を手動で探索しない

**取得後**:
- 取得したコードスニペットを整理
- 実装のための完全なコンテキストを確認
- フェーズ 3 に進む

---

### フェーズ 3: プロトタイプ取得

`[Mode: Prototype]`

**タスクタイプに基づいてルーティング**:

#### ルート A: Frontend/UI/Styles → Gemini

**制限**: コンテキスト < 32k トークン

1. Gemini を呼び出す（`~/.claude/.ccg/prompts/gemini/frontend.md` を使用）
2. 入力: 計画内容 + 取得したコンテキスト + 対象ファイル
3. OUTPUT: `Unified Diff Patch のみ。実際の変更を厳しく禁止。`
4. **Gemini はフロントエンドデザインの権威、その CSS/React/Vue プロトタイプは最終的なビジュアルベースライン**
5. **警告**: Gemini のバックエンドロジック提案は無視
6. 計画に `GEMINI_SESSION` が含まれている場合: `resume <GEMINI_SESSION>` を優先

#### ルート B: Backend/Logic/Algorithms → Codex

1. Codex を呼び出す（`~/.claude/.ccg/prompts/codex/architect.md` を使用）
2. 入力: 計画内容 + 取得したコンテキスト + 対象ファイル
3. OUTPUT: `Unified Diff Patch のみ。実際の変更を厳しく禁止。`
4. **Codex はバックエンドロジックの権威、その論理的推論とデバッグ能力を活用**
5. 計画に `CODEX_SESSION` が含まれている場合: `resume <CODEX_SESSION>` を優先

#### ルート C: Fullstack → 並列呼び出し

1. **並列呼び出し**（`run_in_background: true`）:
   - Gemini: フロントエンド部分を処理
   - Codex: バックエンド部分を処理
2. `TaskOutput` で両方のモデルの完全な結果を待つ
3. それぞれ計画からの対応する `SESSION_ID` を使用して `resume`（欠落している場合は新しいセッションを作成）

**上記の `マルチモデル呼び出し仕様` の `重要` 指示に従ってください**

---

### フェーズ 4: コード実装

`[Mode: Implement]`

**コード主権者としての Claude が次のステップを実行**:

1. **Diff を読む**: Codex/Gemini が返した Unified Diff Patch を解析

2. **メンタルサンドボックス**:
   - 対象ファイルへの Diff 適用をシミュレート
   - 論理的一貫性をチェック
   - 潜在的な競合や副作用を特定

3. **リファクタリングとクリーンアップ**:
   - 「ダーティプロトタイプ」を**高度に読みやすく、保守可能なエンタープライズグレードのコード**にリファクタリング
   - 冗長なコードを削除
   - プロジェクトの既存のコード標準への準拠を確保
   - **必要でない限りコメント/ドキュメントを生成しない**、コードは自己説明的であるべき

4. **最小スコープ**:
   - 変更は要件スコープのみに制限
   - 副作用の**必須レビュー**
   - 対象を絞った修正を行う

5. **変更を適用**:
   - Edit/Write ツールを使用して実際の変更を実行
   - **必要なコードのみを変更**、ユーザーの他の既存機能に影響しない

6. **自己検証**（強く推奨）:
   - プロジェクトの既存の lint / typecheck / tests を実行（最小限の関連スコープを優先）
   - 失敗した場合: 最初にリグレッションを修正し、次にフェーズ 5 に進む

---

### フェーズ 5: 監査と配信

`[Mode: Audit]`

#### 5.1 自動監査

**変更が有効になった後、すぐに並列呼び出し必須** Codex と Gemini をコードレビューのために呼び出します:

1. **Codex レビュー**（`run_in_background: true`）:
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/reviewer.md`
   - 入力: 変更された Diff + 対象ファイル
   - 焦点: セキュリティ、パフォーマンス、エラーハンドリング、ロジックの正確性

2. **Gemini レビュー**（`run_in_background: true`）:
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/reviewer.md`
   - 入力: 変更された Diff + 対象ファイル
   - 焦点: アクセシビリティ、デザインの一貫性、ユーザーエクスペリエンス

`TaskOutput` で両方のモデルの完全なレビュー結果を待ちます。コンテキストの一貫性のためにフェーズ 3 のセッション（`resume <SESSION_ID>`）の再利用を優先します。

#### 5.2 統合と修正

1. Codex + Gemini のレビューフィードバックを統合
2. 信頼ルールで重み付け: バックエンドは Codex に従い、フロントエンドは Gemini に従う
3. 必要な修正を実行
4. 必要に応じてフェーズ 5.1 を繰り返す（リスクが許容できるまで）

#### 5.3 配信確認

監査が通過した後、ユーザーに報告:

```markdown
## 実行完了

### 変更サマリー
| ファイル | 操作 | 説明 |
|------|-----------|-------------|
| path/to/file.ts | 変更 | 説明 |

### 監査結果
- Codex: <通過/N 件の問題発見>
- Gemini: <通過/N 件の問題発見>

### 推奨事項
1. [ ] <推奨テストステップ>
2. [ ] <推奨検証ステップ>
```

---

## 重要なルール

1. **コード主権** – すべてのファイル変更は Claude が実行、外部モデルは書き込みアクセスゼロ
2. **ダーティプロトタイプのリファクタリング** – Codex/Gemini の出力はドラフトとして扱い、リファクタリングが必須
3. **信頼ルール** – バックエンドは Codex に従い、フロントエンドは Gemini に従う
4. **最小変更** – 必要なコードのみを変更、副作用なし
5. **必須監査** – 変更後はマルチモデルコードレビューを実行する必要あり

---

## 使い方

```bash
# 計画ファイルを実行
/ccg:execute .claude/plan/feature-name.md

# タスクを直接実行（コンテキストで既に議論された計画の場合）
/ccg:execute implement user authentication based on previous plan
```

---

## /ccg:plan との関係

1. `/ccg:plan` が計画 + SESSION_ID を生成
2. ユーザーが「Y」で確認
3. `/ccg:execute` が計画を読み、SESSION_ID を再利用して実装を実行
