---
name: skill-create
description: ローカルのgit履歴を分析してコーディングパターンを抽出し、SKILL.mdファイルを生成します。Skill Creator GitHub Appのローカル版です。
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /skill-create - ローカルスキル生成

リポジトリのgit履歴を分析してコーディングパターンを抽出し、チームのプラクティスをClaudeに教えるSKILL.mdファイルを生成します。

## 使用方法

```bash
/skill-create                    # 現在のリポジトリを分析
/skill-create --commits 100      # 最新100コミットを分析
/skill-create --output ./skills  # カスタム出力ディレクトリ
/skill-create --instincts        # continuous-learning-v2用のinstinctsも生成
```

## 実行内容

1. **Git履歴の解析** - コミット、ファイル変更、パターンを分析
2. **パターン検出** - 繰り返されるワークフローと規約を特定
3. **SKILL.md生成** - 有効なClaude Codeスキルファイルを作成
4. **Instincts作成（オプション）** - continuous-learning-v2システム用

## 分析ステップ

### ステップ1: Gitデータの収集

```bash
# ファイル変更を含む最近のコミットを取得
git log --oneline -n ${COMMITS:-200} --name-only --pretty=format:"%H|%s|%ad" --date=short

# ファイル別のコミット頻度を取得
git log --oneline -n 200 --name-only | grep -v "^$" | grep -v "^[a-f0-9]" | sort | uniq -c | sort -rn | head -20

# コミットメッセージのパターンを取得
git log --oneline -n 200 | cut -d' ' -f2- | head -50
```

### ステップ2: パターン検出

以下のパターンタイプを検索します:

| パターン | 検出方法 |
|---------|-----------------|
| **コミット規約** | コミットメッセージの正規表現（feat:、fix:、chore:） |
| **ファイル同時変更** | 常に一緒に変更されるファイル |
| **ワークフローシーケンス** | 繰り返されるファイル変更パターン |
| **アーキテクチャ** | フォルダ構造と命名規則 |
| **テストパターン** | テストファイルの場所、命名、カバレッジ |

### ステップ3: SKILL.md生成

出力形式:

```markdown
---
name: {repo-name}-patterns
description: {repo-name}から抽出されたコーディングパターン
version: 1.0.0
source: local-git-analysis
analyzed_commits: {count}
---

# {Repo Name} パターン

## コミット規約
{検出されたコミットメッセージパターン}

## コードアーキテクチャ
{検出されたフォルダ構造と組織}

## ワークフロー
{検出された繰り返しファイル変更パターン}

## テストパターン
{検出されたテスト規約}
```

### ステップ4: Instincts生成（--instinctsの場合）

continuous-learning-v2統合用:

```yaml
---
id: {repo}-commit-convention
trigger: "when writing a commit message"
confidence: 0.8
domain: git
source: local-repo-analysis
---

# Conventional Commitsを使用

## Action
コミットのプレフィックス: feat:、fix:、chore:、docs:、test:、refactor:

## Evidence
- {n}コミットを分析
- {percentage}%がconventional commit形式に従う
```

## 出力例

TypeScriptプロジェクトで`/skill-create`を実行すると、以下のような出力が得られる可能性があります:

```markdown
---
name: my-app-patterns
description: my-appリポジトリからのコーディングパターン
version: 1.0.0
source: local-git-analysis
analyzed_commits: 150
---

# My App パターン

## コミット規約

このプロジェクトは**conventional commits**を使用します:
- `feat:` - 新機能
- `fix:` - バグ修正
- `chore:` - メンテナンスタスク
- `docs:` - ドキュメント更新

## コードアーキテクチャ

```
src/
├── components/     # Reactコンポーネント（PascalCase.tsx）
├── hooks/          # カスタムフック（use*.ts）
├── utils/          # ユーティリティ関数
├── types/          # TypeScript型定義
└── services/       # APIと外部サービス
```

## ワークフロー

### 新しいコンポーネントの追加
1. `src/components/ComponentName.tsx`を作成
2. `src/components/__tests__/ComponentName.test.tsx`にテストを追加
3. `src/components/index.ts`からエクスポート

### データベースマイグレーション
1. `src/db/schema.ts`を変更
2. `pnpm db:generate`を実行
3. `pnpm db:migrate`を実行

## テストパターン

- テストファイル: `__tests__/`ディレクトリまたは`.test.ts`サフィックス
- カバレッジ目標: 80%以上
- フレームワーク: Vitest
```

## GitHub Appとの統合

高度な機能（10k以上のコミット、チーム共有、自動PR）については、[Skill Creator GitHub App](https://github.com/apps/skill-creator)を使用してください:

- インストール: [github.com/apps/skill-creator](https://github.com/apps/skill-creator)
- 任意のissueに`/skill-creator analyze`とコメント
- 生成されたスキルを含むPRを受信

## 関連コマンド

- `/instinct-import` - 生成されたinstinctsをインポート
- `/instinct-status` - 学習したinstinctsを表示
- `/evolve` - instinctsをスキル/エージェントにクラスタリング

---

*[Everything Claude Code](https://github.com/affaan-m/everything-claude-code)の一部*
