# Everything Claude Codeへの貢献

貢献のご意向ありがとうございます！このリポジトリはClaude Codeユーザーのためのコミュニティリソースです。

## 目次

- [探しているもの](#探しているもの)
- [クイックスタート](#クイックスタート)
- [スキルの貢献](#スキルの貢献)
- [エージェントの貢献](#エージェントの貢献)
- [フックの貢献](#フックの貢献)
- [コマンドの貢献](#コマンドの貢献)
- [プルリクエストプロセス](#プルリクエストプロセス)

---

## 探しているもの

### エージェント
特定のタスクをうまく処理する新しいエージェント：
- 言語固有のレビュアー（Python、Go、Rust）
- フレームワークエキスパート（Django、Rails、Laravel、Spring）
- DevOpsスペシャリスト（Kubernetes、Terraform、CI/CD）
- ドメインエキスパート（MLパイプライン、データエンジニアリング、モバイル）

### スキル
ワークフロー定義とドメイン知識：
- 言語のベストプラクティス
- フレームワークパターン
- テスト戦略
- アーキテクチャガイド

### フック
有用な自動化：
- リント/フォーマットフック
- セキュリティチェック
- バリデーションフック
- 通知フック

### コマンド
有用なワークフローを呼び出すスラッシュコマンド：
- デプロイコマンド
- テストコマンド
- コード生成コマンド

---

## クイックスタート

```bash
# 1. フォークしてクローン
gh repo fork affaan-m/everything-claude-code --clone
cd everything-claude-code

# 2. ブランチを作成
git checkout -b feat/my-contribution

# 3. 貢献を追加（以下のセクション参照）

# 4. ローカルでテスト
cp -r skills/my-skill ~/.claude/skills/  # スキルの場合
# その後Claude Codeでテスト

# 5. PRを提出
git add . && git commit -m "feat: add my-skill" && git push
```

---

## スキルの貢献

スキルはClaude Codeがコンテキストに基づいてロードする知識モジュールです。

### ディレクトリ構造

```
skills/
└── your-skill-name/
    └── SKILL.md
```

### SKILL.mdテンプレート

```markdown
---
name: your-skill-name
description: スキルリストに表示される簡単な説明
---

# スキルタイトル

このスキルがカバーする内容の簡単な概要。

## 主要概念

主要なパターンとガイドラインを説明。

## コード例

\`\`\`typescript
// 実用的でテスト済みの例を含める
function example() {
  // よくコメントされたコード
}
\`\`\`

## ベストプラクティス

- 実行可能なガイドライン
- すべきこととすべきでないこと
- 避けるべき一般的な落とし穴

## 使用するタイミング

このスキルが適用されるシナリオを説明。
```

### スキルチェックリスト

- [ ] 1つのドメイン/テクノロジーに焦点を当てている
- [ ] 実用的なコード例を含む
- [ ] 500行未満
- [ ] 明確なセクションヘッダーを使用
- [ ] Claude Codeでテスト済み

### スキル例

| スキル | 目的 |
|-------|---------|
| `coding-standards/` | TypeScript/JavaScriptパターン |
| `frontend-patterns/` | ReactとNext.jsのベストプラクティス |
| `backend-patterns/` | APIとデータベースパターン |
| `security-review/` | セキュリティチェックリスト |

---

## エージェントの貢献

エージェントはTaskツールを介して呼び出される専門アシスタントです。

### ファイルの場所

```
agents/your-agent-name.md
```

### エージェントテンプレート

```markdown
---
name: your-agent-name
description: このエージェントが何をするか、いつClaudeが呼び出すべきか。具体的に！
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]
model: sonnet
---

あなたは[役割]スペシャリストです。

## あなたの役割

- 主な責任
- 二次的な責任
- あなたがしないこと（境界）

## ワークフロー

### ステップ1: 理解
タスクへのアプローチ方法。

### ステップ2: 実行
作業の実行方法。

### ステップ3: 検証
結果の検証方法。

## 出力形式

ユーザーに返すもの。

## 例

### 例: [シナリオ]
入力: [ユーザーが提供するもの]
アクション: [あなたがすること]
出力: [あなたが返すもの]
```

### エージェントフィールド

| フィールド | 説明 | オプション |
|-------|-------------|---------|
| `name` | 小文字、ハイフン区切り | `code-reviewer` |
| `description` | 呼び出しタイミングの決定に使用 | 具体的に！ |
| `tools` | 必要なもののみ | `Read, Write, Edit, Bash, Grep, Glob, WebFetch, Task` |
| `model` | 複雑さレベル | `haiku`（シンプル）、`sonnet`（コーディング）、`opus`（複雑） |

### エージェント例

| エージェント | 目的 |
|-------|---------|
| `tdd-guide.md` | テスト駆動開発 |
| `code-reviewer.md` | コードレビュー |
| `security-reviewer.md` | セキュリティスキャン |
| `build-error-resolver.md` | ビルドエラー修正 |

---

## フックの貢献

フックはClaude Codeイベントによってトリガーされる自動動作です。

### ファイルの場所

```
hooks/hooks.json
```

### フックタイプ

| タイプ | トリガー | ユースケース |
|------|---------|----------|
| `PreToolUse` | ツール実行前 | 検証、警告、ブロック |
| `PostToolUse` | ツール実行後 | フォーマット、チェック、通知 |
| `SessionStart` | セッション開始時 | コンテキストロード |
| `Stop` | セッション終了時 | クリーンアップ、監査 |

### フック形式

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "tool == \"Bash\" && tool_input.command matches \"rm -rf /\"",
        "hooks": [
          {
            "type": "command",
            "command": "echo '[Hook] ブロック: 危険なコマンド' && exit 1"
          }
        ],
        "description": "危険なrmコマンドをブロック"
      }
    ]
  }
}
```

### マッチャー構文

```javascript
// 特定のツールに一致
tool == "Bash"
tool == "Edit"
tool == "Write"

// 入力パターンに一致
tool_input.command matches "npm install"
tool_input.file_path matches "\\.tsx?$"

// 条件を組み合わせる
tool == "Bash" && tool_input.command matches "git push"
```

### フック例

```json
// tmux外での開発サーバーをブロック
{
  "matcher": "tool == \"Bash\" && tool_input.command matches \"npm run dev\"",
  "hooks": [{"type": "command", "command": "echo '開発サーバーにはtmuxを使用してください' && exit 1"}],
  "description": "開発サーバーがtmuxで実行されることを保証"
}

// TypeScript編集後に自動フォーマット
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\.tsx?$\"",
  "hooks": [{"type": "command", "command": "npx prettier --write \"$file_path\""}],
  "description": "編集後にTypeScriptファイルをフォーマット"
}

// git push前に警告
{
  "matcher": "tool == \"Bash\" && tool_input.command matches \"git push\"",
  "hooks": [{"type": "command", "command": "echo '[Hook] プッシュ前に変更をレビューしてください'"}],
  "description": "プッシュ前のレビューリマインダー"
}
```

### フックチェックリスト

- [ ] マッチャーが具体的（過度に広範ではない）
- [ ] 明確なエラー/情報メッセージを含む
- [ ] 正しい終了コードを使用（`exit 1`はブロック、`exit 0`は許可）
- [ ] 徹底的にテスト済み
- [ ] 説明がある

---

## コマンドの貢献

コマンドは`/command-name`で呼び出されるユーザー起動アクションです。

### ファイルの場所

```
commands/your-command.md
```

### コマンドテンプレート

```markdown
---
description: /helpに表示される簡単な説明
---

# コマンド名

## 目的

このコマンドが何をするか。

## 使用方法

\`\`\`
/your-command [args]
\`\`\`

## ワークフロー

1. 最初のステップ
2. 2番目のステップ
3. 最後のステップ

## 出力

ユーザーが受け取るもの。
```

### コマンド例

| コマンド | 目的 |
|---------|---------|
| `commit.md` | gitコミットを作成 |
| `code-review.md` | コード変更をレビュー |
| `tdd.md` | TDDワークフロー |
| `e2e.md` | E2Eテスト |

---

## プルリクエストプロセス

### 1. PRタイトル形式

```
feat(skills): rust-patternsスキルを追加
feat(agents): api-designerエージェントを追加
feat(hooks): auto-formatフックを追加
fix(skills): Reactパターンを更新
docs: 貢献ガイドを改善
```

### 2. PR説明

```markdown
## 概要
追加するものとその理由。

## タイプ
- [ ] スキル
- [ ] エージェント
- [ ] フック
- [ ] コマンド

## テスト
これをテストした方法。

## チェックリスト
- [ ] 形式ガイドラインに従う
- [ ] Claude Codeでテスト済み
- [ ] 機密情報なし（APIキー、パス）
- [ ] 明確な説明
```

### 3. レビュープロセス

1. メンテナーが48時間以内にレビュー
2. リクエストがあればフィードバックに対応
3. 承認されたらmainにマージ

---

## ガイドライン

### すべきこと
- 貢献を焦点を絞りモジュール化する
- 明確な説明を含める
- 提出前にテスト
- 既存のパターンに従う
- 依存関係を文書化

### すべきでないこと
- 機密データを含める（APIキー、トークン、パス）
- 過度に複雑またはニッチな設定を追加
- テストされていない貢献を提出
- 既存の機能の重複を作成

---

## ファイル命名

- ハイフン付き小文字を使用: `python-reviewer.md`
- 説明的に: `tdd-workflow.md`（`workflow.md`ではなく）
- 名前をファイル名に一致させる

---

## 質問？

- **Issues:** [github.com/affaan-m/everything-claude-code/issues](https://github.com/affaan-m/everything-claude-code/issues)
- **X/Twitter:** [@affaanmustafa](https://x.com/affaanmustafa)

---

貢献いただきありがとうございます！一緒に素晴らしいリソースを構築しましょう。
