# Everything Claude Code

[![Stars](https://img.shields.io/github/stars/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/stargazers)
[![Forks](https://img.shields.io/github/forks/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/network/members)
[![Contributors](https://img.shields.io/github/contributors/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/graphs/contributors)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Shell](https://img.shields.io/badge/-Shell-4EAA25?logo=gnu-bash&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white)
![Go](https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white)
![Java](https://img.shields.io/badge/-Java-ED8B00?logo=openjdk&logoColor=white)
![Markdown](https://img.shields.io/badge/-Markdown-000000?logo=markdown&logoColor=white)

> **41K+ スター** | **5K+ フォーク** | **22名の貢献者** | **6言語対応**

---

<div align="center">

**🌐 Language / 语言 / 語言**

[**English**](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](docs/zh-TW/README.md) | [日本語](README.ja.md)

</div>

---

**Anthropicハッカソン優勝者による、完全なClaude Code設定コレクション。**

本番環境対応のエージェント、スキル、フック、コマンド、ルール、MCP設定を、実際の製品開発で10ヶ月以上にわたる集中的な日常使用を経て進化させました。

---

## ガイド

このリポジトリには生のコードのみが含まれています。ガイドですべてを説明しています。

<table>
<tr>
<td width="50%">
<a href="https://x.com/affaanmustafa/status/2012378465664745795">
<img src="https://github.com/user-attachments/assets/1a471488-59cc-425b-8345-5245c7efbcef" alt="The Shorthand Guide to Everything Claude Code" />
</a>
</td>
<td width="50%">
<a href="https://x.com/affaanmustafa/status/2014040193557471352">
<img src="https://github.com/user-attachments/assets/c9ca43bc-b149-427f-b551-af6840c368f0" alt="The Longform Guide to Everything Claude Code" />
</a>
</td>
</tr>
<tr>
<td align="center"><b>簡易ガイド</b><br/>セットアップ、基礎、哲学。<b>まずこちらをお読みください。</b></td>
<td align="center"><b>詳細ガイド</b><br/>トークン最適化、メモリの永続化、評価、並列化。</td>
</tr>
</table>

| トピック | 学べる内容 |
|-------|-------------------|
| トークン最適化 | モデル選択、システムプロンプトの削減、バックグラウンドプロセス |
| メモリの永続化 | セッション間でコンテキストを自動保存/ロードするフック |
| 継続的学習 | セッションから再利用可能なスキルへパターンを自動抽出 |
| 検証ループ | チェックポイント vs 継続的評価、評価者タイプ、pass@k指標 |
| 並列化 | Git worktrees、カスケード手法、インスタンスのスケーリングタイミング |
| サブエージェントオーケストレーション | コンテキストの問題、反復的取得パターン |

---

## 最新情報

### v1.4.1 — バグ修正（2026年2月）

- **インスティンクトインポートのコンテンツ損失を修正** — `parse_instinct_file()`が`/instinct-import`中にフロントマター後のすべてのコンテンツ（Action、Evidence、Examplesセクション）を静かに削除していた問題を修正。コミュニティ貢献者@ericcai0814により修正（[#148](https://github.com/affaan-m/everything-claude-code/issues/148)、[#161](https://github.com/affaan-m/everything-claude-code/pull/161)）

### v1.4.0 — 多言語ルール、インストールウィザード、PM2（2026年2月）

- **対話型インストールウィザード** — マージ/上書き検出機能付きのガイド付きセットアップを提供する新しい`configure-ecc`スキル
- **PM2 & マルチエージェントオーケストレーション** — 複雑なマルチサービスワークフローを管理するための6つの新しいコマンド（`/pm2`、`/multi-plan`、`/multi-execute`、`/multi-backend`、`/multi-frontend`、`/multi-workflow`）
- **多言語ルールアーキテクチャ** — フラットファイルから`common/` + `typescript/` + `python/` + `golang/`ディレクトリへルールを再構築。必要な言語のみをインストール
- **中国語（zh-CN）翻訳** — すべてのエージェント、コマンド、スキル、ルールの完全翻訳（80以上のファイル）
- **GitHub Sponsorsサポート** — GitHub Sponsorsを通じてプロジェクトをスポンサー
- **CONTRIBUTING.mdの強化** — 各貢献タイプの詳細なPRテンプレート

### v1.3.0 — OpenCodeプラグインサポート（2026年2月）

- **完全なOpenCode統合** — OpenCodeのプラグインシステムによるフックサポート付きの12エージェント、24コマンド、16スキル（20以上のイベントタイプ）
- **3つのネイティブカスタムツール** — run-tests、check-coverage、security-audit
- **LLMドキュメント** — 包括的なOpenCodeドキュメント用の`llms.txt`

### v1.2.0 — 統一コマンド & スキル（2026年2月）

- **Python/Djangoサポート** — Djangoパターン、セキュリティ、TDD、検証スキル
- **Java Spring Bootスキル** — Spring Bootのパターン、セキュリティ、TDD、検証
- **セッション管理** — セッション履歴用の`/sessions`コマンド
- **継続的学習v2** — 信頼度スコアリング、インポート/エクスポート、進化を備えたインスティンクトベースの学習

完全な変更履歴は[リリース](https://github.com/affaan-m/everything-claude-code/releases)をご覧ください。

---

## 🚀 クイックスタート

2分以内に起動して実行します：

### ステップ1: プラグインをインストール

```bash
# マーケットプレイスを追加
/plugin marketplace add affaan-m/everything-claude-code

# プラグインをインストール
/plugin install everything-claude-code@everything-claude-code
```

### ステップ2: ルールをインストール（必須）

> ⚠️ **重要:** Claude Codeプラグインは`rules`を自動的に配布できません。手動でインストールしてください：

```bash
# まずリポジトリをクローン
git clone https://github.com/affaan-m/everything-claude-code.git

# 共通ルールをインストール（必須）
cp -r everything-claude-code/rules/common/* ~/.claude/rules/

# 言語固有のルールをインストール（スタックを選択）
cp -r everything-claude-code/rules/typescript/* ~/.claude/rules/
cp -r everything-claude-code/rules/python/* ~/.claude/rules/
cp -r everything-claude-code/rules/golang/* ~/.claude/rules/
```

### ステップ3: 使い始める

```bash
# コマンドを試す
/plan "ユーザー認証を追加"

# 利用可能なコマンドを確認
/plugin list everything-claude-code@everything-claude-code
```

✨ **これで完了です！** 15以上のエージェント、30以上のスキル、30以上のコマンドにアクセスできるようになりました。

---

## 🌐 クロスプラットフォームサポート

このプラグインは現在、**Windows、macOS、Linux**を完全にサポートしています。すべてのフックとスクリプトは最大限の互換性のためNode.jsで書き直されています。

### パッケージマネージャーの検出

プラグインは優先するパッケージマネージャー（npm、pnpm、yarn、またはbun）を次の優先順位で自動検出します：

1. **環境変数**: `CLAUDE_PACKAGE_MANAGER`
2. **プロジェクト設定**: `.claude/package-manager.json`
3. **package.json**: `packageManager`フィールド
4. **ロックファイル**: package-lock.json、yarn.lock、pnpm-lock.yaml、またはbun.lockbからの検出
5. **グローバル設定**: `~/.claude/package-manager.json`
6. **フォールバック**: 最初に利用可能なパッケージマネージャー

優先するパッケージマネージャーを設定するには：

```bash
# 環境変数経由
export CLAUDE_PACKAGE_MANAGER=pnpm

# グローバル設定経由
node scripts/setup-package-manager.js --global pnpm

# プロジェクト設定経由
node scripts/setup-package-manager.js --project bun

# 現在の設定を検出
node scripts/setup-package-manager.js --detect
```

またはClaude Codeで`/setup-pm`コマンドを使用します。

---

## 📦 内容

このリポジトリは**Claude Codeプラグイン**です - 直接インストールするか、コンポーネントを手動でコピーしてください。

```
everything-claude-code/
|-- .claude-plugin/   # プラグインとマーケットプレイスのマニフェスト
|   |-- plugin.json         # プラグインメタデータとコンポーネントパス
|   |-- marketplace.json    # /plugin marketplace add用のマーケットプレイスカタログ
|
|-- agents/           # 委任用の専門サブエージェント
|   |-- planner.md           # 機能実装の計画
|   |-- architect.md         # システム設計の決定
|   |-- tdd-guide.md         # テスト駆動開発
|   |-- code-reviewer.md     # 品質とセキュリティのレビュー
|   |-- security-reviewer.md # 脆弱性分析
|   |-- build-error-resolver.md
|   |-- e2e-runner.md        # Playwright E2Eテスト
|   |-- refactor-cleaner.md  # デッドコードのクリーンアップ
|   |-- doc-updater.md       # ドキュメント同期
|   |-- go-reviewer.md       # Goコードレビュー
|   |-- go-build-resolver.md # Goビルドエラー解決
|   |-- python-reviewer.md   # Pythonコードレビュー（新規）
|   |-- database-reviewer.md # データベース/Supabaseレビュー（新規）
|
|-- skills/           # ワークフロー定義とドメイン知識
|   |-- coding-standards/           # 言語のベストプラクティス
|   |-- backend-patterns/           # API、データベース、キャッシュパターン
|   |-- frontend-patterns/          # React、Next.jsパターン
|   |-- continuous-learning/        # セッションからパターンを自動抽出（詳細ガイド）
|   |-- continuous-learning-v2/     # 信頼度スコアリング付きインスティンクトベース学習
|   |-- iterative-retrieval/        # サブエージェント用の段階的コンテキスト改良
|   |-- strategic-compact/          # 手動圧縮提案（詳細ガイド）
|   |-- tdd-workflow/               # TDD方法論
|   |-- security-review/            # セキュリティチェックリスト
|   |-- eval-harness/               # 検証ループ評価（詳細ガイド）
|   |-- verification-loop/          # 継続的検証（詳細ガイド）
|   |-- golang-patterns/            # Goのイディオムとベストプラクティス
|   |-- golang-testing/             # Goテストパターン、TDD、ベンチマーク
|   |-- django-patterns/            # Djangoパターン、モデル、ビュー（新規）
|   |-- django-security/            # Djangoセキュリティのベストプラクティス（新規）
|   |-- django-tdd/                 # Django TDDワークフロー（新規）
|   |-- django-verification/        # Django検証ループ（新規）
|   |-- python-patterns/            # Pythonのイディオムとベストプラクティス（新規）
|   |-- python-testing/             # pytestを使用したPythonテスト（新規）
|   |-- springboot-patterns/        # Java Spring Bootパターン（新規）
|   |-- springboot-security/        # Spring Bootセキュリティ（新規）
|   |-- springboot-tdd/             # Spring Boot TDD（新規）
|   |-- springboot-verification/    # Spring Boot検証（新規）
|   |-- configure-ecc/              # 対話型インストールウィザード（新規）
|
|-- commands/         # 迅速な実行のためのスラッシュコマンド
|   |-- tdd.md              # /tdd - テスト駆動開発
|   |-- plan.md             # /plan - 実装計画
|   |-- e2e.md              # /e2e - E2Eテスト生成
|   |-- code-review.md      # /code-review - 品質レビュー
|   |-- build-fix.md        # /build-fix - ビルドエラー修正
|   |-- refactor-clean.md   # /refactor-clean - デッドコード削除
|   |-- learn.md            # /learn - セッション中のパターン抽出（詳細ガイド）
|   |-- checkpoint.md       # /checkpoint - 検証状態の保存（詳細ガイド）
|   |-- verify.md           # /verify - 検証ループの実行（詳細ガイド）
|   |-- setup-pm.md         # /setup-pm - パッケージマネージャーの設定
|   |-- go-review.md        # /go-review - Goコードレビュー（新規）
|   |-- go-test.md          # /go-test - Go TDDワークフロー（新規）
|   |-- go-build.md         # /go-build - Goビルドエラー修正（新規）
|   |-- skill-create.md     # /skill-create - git履歴からスキルを生成（新規）
|   |-- instinct-status.md  # /instinct-status - 学習したインスティンクトを表示（新規）
|   |-- instinct-import.md  # /instinct-import - インスティンクトをインポート（新規）
|   |-- instinct-export.md  # /instinct-export - インスティンクトをエクスポート（新規）
|   |-- evolve.md           # /evolve - インスティンクトをスキルにクラスタリング
|   |-- pm2.md              # /pm2 - PM2サービスライフサイクル管理（新規）
|   |-- multi-plan.md       # /multi-plan - マルチエージェントタスク分解（新規）
|   |-- multi-execute.md    # /multi-execute - オーケストレーションされたマルチエージェントワークフロー（新規）
|   |-- multi-backend.md    # /multi-backend - バックエンドマルチサービスオーケストレーション（新規）
|   |-- multi-frontend.md   # /multi-frontend - フロントエンドマルチサービスオーケストレーション（新規）
|   |-- multi-workflow.md   # /multi-workflow - 一般的なマルチサービスワークフロー（新規）
|
|-- rules/            # 常時遵守ガイドライン（~/.claude/rules/にコピー）
|   |-- README.md            # 構造概要とインストールガイド
|   |-- common/              # 言語に依存しない原則
|   |   |-- coding-style.md    # 不変性、ファイル構成
|   |   |-- git-workflow.md    # コミット形式、PRプロセス
|   |   |-- testing.md         # TDD、80%カバレッジ要件
|   |   |-- performance.md     # モデル選択、コンテキスト管理
|   |   |-- patterns.md        # デザインパターン、スケルトンプロジェクト
|   |   |-- hooks.md           # フックアーキテクチャ、TodoWrite
|   |   |-- agents.md          # サブエージェントへの委任タイミング
|   |   |-- security.md        # 必須セキュリティチェック
|   |-- typescript/          # TypeScript/JavaScript固有
|   |-- python/              # Python固有
|   |-- golang/              # Go固有
|
|-- hooks/            # トリガーベースの自動化
|   |-- hooks.json                # すべてのフック設定（PreToolUse、PostToolUse、Stop等）
|   |-- memory-persistence/       # セッションライフサイクルフック（詳細ガイド）
|   |-- strategic-compact/        # 圧縮提案（詳細ガイド）
|
|-- scripts/          # クロスプラットフォームNode.jsスクリプト（新規）
|   |-- lib/                     # 共有ユーティリティ
|   |   |-- utils.js             # クロスプラットフォームファイル/パス/システムユーティリティ
|   |   |-- package-manager.js   # パッケージマネージャーの検出と選択
|   |-- hooks/                   # フック実装
|   |   |-- session-start.js     # セッション開始時にコンテキストをロード
|   |   |-- session-end.js       # セッション終了時に状態を保存
|   |   |-- pre-compact.js       # 圧縮前の状態保存
|   |   |-- suggest-compact.js   # 戦略的圧縮提案
|   |   |-- evaluate-session.js  # セッションからパターンを抽出
|   |-- setup-package-manager.js # 対話型PMセットアップ
|
|-- tests/            # テストスイート（新規）
|   |-- lib/                     # ライブラリテスト
|   |-- hooks/                   # フックテスト
|   |-- run-all.js               # すべてのテストを実行
|
|-- contexts/         # 動的システムプロンプト注入コンテキスト（詳細ガイド）
|   |-- dev.md              # 開発モードコンテキスト
|   |-- review.md           # コードレビューモードコンテキスト
|   |-- research.md         # リサーチ/探索モードコンテキスト
|
|-- examples/         # 設定例とセッション
|   |-- CLAUDE.md           # プロジェクトレベル設定例
|   |-- user-CLAUDE.md      # ユーザーレベル設定例
|
|-- mcp-configs/      # MCPサーバー設定
|   |-- mcp-servers.json    # GitHub、Supabase、Vercel、Railway等
|
|-- marketplace.json  # セルフホストマーケットプレイス設定（/plugin marketplace add用）
```

---

## 🛠️ エコシステムツール

### スキルクリエーター

リポジトリからClaude Codeスキルを生成する2つの方法：

#### オプションA: ローカル分析（組み込み）

外部サービスなしでローカル分析を行うには`/skill-create`コマンドを使用：

```bash
/skill-create                    # 現在のリポジトリを分析
/skill-create --instincts        # continuous-learning用のインスティンクトも生成
```

これはgit履歴をローカルで分析してSKILL.mdファイルを生成します。

#### オプションB: GitHub App（高度）

高度な機能（10k以上のコミット、自動PR、チーム共有）用：

[GitHub Appをインストール](https://github.com/apps/skill-creator) | [ecc.tools](https://ecc.tools)

```bash
# 任意のissueでコメント:
/skill-creator analyze

# またはデフォルトブランチへのpush時に自動トリガー
```

両方のオプションで作成されるもの：
- **SKILL.mdファイル** - Claude Code用のすぐに使えるスキル
- **インスティンクトコレクション** - continuous-learning-v2用
- **パターン抽出** - コミット履歴から学習

### 🧠 継続的学習v2

インスティンクトベースの学習システムが自動的にパターンを学習：

```bash
/instinct-status        # 信頼度付きで学習したインスティンクトを表示
/instinct-import <file> # 他者からインスティンクトをインポート
/instinct-export        # 共有用にインスティンクトをエクスポート
/evolve                 # 関連するインスティンクトをスキルにクラスタリング
```

完全なドキュメントは`skills/continuous-learning-v2/`をご覧ください。

---

## 📋 要件

### Claude Code CLIバージョン

**最小バージョン: v2.1.0以降**

このプラグインは、プラグインシステムがフックを処理する方法の変更により、Claude Code CLI v2.1.0以降が必要です。

バージョンを確認：
```bash
claude --version
```

### 重要: フックの自動ロード動作

> ⚠️ **貢献者向け:** `.claude-plugin/plugin.json`に`"hooks"`フィールドを追加しないでください。これは回帰テストによって強制されています。

Claude Code v2.1以降は、インストールされたプラグインから規約により`hooks/hooks.json`を**自動的にロード**します。`plugin.json`で明示的に宣言すると、重複検出エラーが発生します：

```
Duplicate hooks file detected: ./hooks/hooks.json resolves to already-loaded file
```

**履歴:** これにより、このリポジトリで修正/リバートサイクルが繰り返されました（[#29](https://github.com/affaan-m/everything-claude-code/issues/29)、[#52](https://github.com/affaan-m/everything-claude-code/issues/52)、[#103](https://github.com/affaan-m/everything-claude-code/issues/103)）。動作がClaude Codeバージョン間で変わったため、混乱が生じました。現在、これが再導入されないよう回帰テストがあります。

---

## 📥 インストール

### オプション1: プラグインとしてインストール（推奨）

このリポジトリを使用する最も簡単な方法 - Claude Codeプラグインとしてインストール：

```bash
# このリポジトリをマーケットプレイスとして追加
/plugin marketplace add affaan-m/everything-claude-code

# プラグインをインストール
/plugin install everything-claude-code@everything-claude-code
```

または、`~/.claude/settings.json`に直接追加：

```json
{
  "extraKnownMarketplaces": {
    "everything-claude-code": {
      "source": {
        "source": "github",
        "repo": "affaan-m/everything-claude-code"
      }
    }
  },
  "enabledPlugins": {
    "everything-claude-code@everything-claude-code": true
  }
}
```

これにより、すべてのコマンド、エージェント、スキル、フックに即座にアクセスできます。

> **注意:** Claude Codeプラグインシステムは、プラグインを介した`rules`の配布をサポートしていません（[上流の制限](https://code.claude.com/docs/en/plugins-reference)）。ルールは手動でインストールする必要があります：
>
> ```bash
> # まずリポジトリをクローン
> git clone https://github.com/affaan-m/everything-claude-code.git
>
> # オプションA: ユーザーレベルのルール（すべてのプロジェクトに適用）
> cp -r everything-claude-code/rules/common/* ~/.claude/rules/
> cp -r everything-claude-code/rules/typescript/* ~/.claude/rules/   # スタックを選択
> cp -r everything-claude-code/rules/python/* ~/.claude/rules/
> cp -r everything-claude-code/rules/golang/* ~/.claude/rules/
>
> # オプションB: プロジェクトレベルのルール（現在のプロジェクトのみに適用）
> mkdir -p .claude/rules
> cp -r everything-claude-code/rules/common/* .claude/rules/
> cp -r everything-claude-code/rules/typescript/* .claude/rules/     # スタックを選択
> ```

---

### 🔧 オプション2: 手動インストール

インストール内容を手動で制御したい場合：

```bash
# リポジトリをクローン
git clone https://github.com/affaan-m/everything-claude-code.git

# エージェントをClaude設定にコピー
cp everything-claude-code/agents/*.md ~/.claude/agents/

# ルールをコピー（共通 + 言語固有）
cp -r everything-claude-code/rules/common/* ~/.claude/rules/
cp -r everything-claude-code/rules/typescript/* ~/.claude/rules/   # スタックを選択
cp -r everything-claude-code/rules/python/* ~/.claude/rules/
cp -r everything-claude-code/rules/golang/* ~/.claude/rules/

# コマンドをコピー
cp everything-claude-code/commands/*.md ~/.claude/commands/

# スキルをコピー
cp -r everything-claude-code/skills/* ~/.claude/skills/
```

#### settings.jsonにフックを追加

`hooks/hooks.json`のフックを`~/.claude/settings.json`にコピーします。

#### MCPを設定

`mcp-configs/mcp-servers.json`から必要なMCPサーバーを`~/.claude.json`にコピーします。

**重要:** `YOUR_*_HERE`プレースホルダーを実際のAPIキーに置き換えてください。

---

## 🎯 主要概念

### エージェント

サブエージェントは限定されたスコープで委任されたタスクを処理します。例：

```markdown
---
name: code-reviewer
description: コードの品質、セキュリティ、保守性をレビュー
tools: ["Read", "Grep", "Glob", "Bash"]
model: opus
---

あなたはシニアコードレビュアーです...
```

### スキル

スキルはコマンドまたはエージェントによって呼び出されるワークフロー定義です：

```markdown
# TDDワークフロー

1. まずインターフェースを定義
2. 失敗するテストを書く（RED）
3. 最小限のコードを実装（GREEN）
4. リファクタリング（IMPROVE）
5. 80%以上のカバレッジを検証
```

### フック

フックはツールイベント時に発火します。例 - console.logの警告：

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] console.logを削除してください' >&2"
  }]
}
```

### ルール

ルールは常時遵守のガイドラインで、`common/`（言語に依存しない）+ 言語固有のディレクトリに整理されています：

```
rules/
  common/          # 普遍的な原則（常にインストール）
  typescript/      # TS/JS固有のパターンとツール
  python/          # Python固有のパターンとツール
  golang/          # Go固有のパターンとツール
```

インストールと構造の詳細については[`rules/README.md`](rules/README.md)をご覧ください。

---

## 🧪 テストの実行

プラグインには包括的なテストスイートが含まれています：

```bash
# すべてのテストを実行
node tests/run-all.js

# 個別のテストファイルを実行
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

---

## 🤝 貢献

**貢献は歓迎され、奨励されています。**

このリポジトリはコミュニティリソースとなることを意図しています。以下のようなものをお持ちの場合：
- 有用なエージェントまたはスキル
- 賢いフック
- より良いMCP設定
- 改善されたルール

ぜひ貢献してください！ガイドラインについては[CONTRIBUTING.md](CONTRIBUTING.md)をご覧ください。

### 貢献のアイデア

- 言語固有のスキル（Rust、C#、Swift、Kotlin） — Go、Python、Javaはすでに含まれています
- フレームワーク固有の設定（Rails、Laravel、FastAPI、NestJS） — Django、Spring Bootはすでに含まれています
- DevOpsエージェント（Kubernetes、Terraform、AWS、Docker）
- テスト戦略（異なるフレームワーク、ビジュアル回帰）
- ドメイン固有の知識（ML、データエンジニアリング、モバイル）

---

## 🔌 OpenCodeサポート

ECCはプラグインとフックを含む**完全なOpenCodeサポート**を提供します。

### クイックスタート

```bash
# OpenCodeをインストール
npm install -g opencode

# リポジトリルートで実行
opencode
```

設定は`.opencode/opencode.json`から自動的に検出されます。

### 機能パリティ

| 機能 | Claude Code | OpenCode | ステータス |
|---------|-------------|----------|--------|
| エージェント | ✅ 14エージェント | ✅ 12エージェント | **Claude Codeがリード** |
| コマンド | ✅ 30コマンド | ✅ 24コマンド | **Claude Codeがリード** |
| スキル | ✅ 28スキル | ✅ 16スキル | **Claude Codeがリード** |
| フック | ✅ 3フェーズ | ✅ 20以上のイベント | **OpenCodeがより多い！** |
| ルール | ✅ 8ルール | ✅ 8ルール | **完全パリティ** |
| MCPサーバー | ✅ 完全 | ✅ 完全 | **完全パリティ** |
| カスタムツール | ✅ フック経由 | ✅ ネイティブサポート | **OpenCodeがより良い** |

### プラグインを介したフックサポート

OpenCodeのプラグインシステムは、20以上のイベントタイプを持つClaude Codeよりも洗練されています：

| Claude Codeフック | OpenCodeプラグインイベント |
|-----------------|----------------------|
| PreToolUse | `tool.execute.before` |
| PostToolUse | `tool.execute.after` |
| Stop | `session.idle` |
| SessionStart | `session.created` |
| SessionEnd | `session.deleted` |

**追加のOpenCodeイベント**: `file.edited`、`file.watcher.updated`、`message.updated`、`lsp.client.diagnostics`、`tui.toast.show`など。

### 利用可能なコマンド（24）

| コマンド | 説明 |
|---------|-------------|
| `/plan` | 実装計画を作成 |
| `/tdd` | TDDワークフローを強制 |
| `/code-review` | コード変更をレビュー |
| `/security` | セキュリティレビューを実行 |
| `/build-fix` | ビルドエラーを修正 |
| `/e2e` | E2Eテストを生成 |
| `/refactor-clean` | デッドコードを削除 |
| `/orchestrate` | マルチエージェントワークフロー |
| `/learn` | セッションからパターンを抽出 |
| `/checkpoint` | 検証状態を保存 |
| `/verify` | 検証ループを実行 |
| `/eval` | 基準に対して評価 |
| `/update-docs` | ドキュメントを更新 |
| `/update-codemaps` | コードマップを更新 |
| `/test-coverage` | カバレッジを分析 |
| `/go-review` | Goコードレビュー |
| `/go-test` | Go TDDワークフロー |
| `/go-build` | Goビルドエラーを修正 |
| `/skill-create` | gitからスキルを生成 |
| `/instinct-status` | 学習したインスティンクトを表示 |
| `/instinct-import` | インスティンクトをインポート |
| `/instinct-export` | インスティンクトをエクスポート |
| `/evolve` | インスティンクトをスキルにクラスタリング |
| `/setup-pm` | パッケージマネージャーを設定 |

### プラグインのインストール

**オプション1: 直接使用**
```bash
cd everything-claude-code
opencode
```

**オプション2: npmパッケージとしてインストール**
```bash
npm install opencode-ecc
```

その後、`opencode.json`に追加：
```json
{
  "plugin": ["opencode-ecc"]
}
```

### ドキュメント

- **移行ガイド**: `.opencode/MIGRATION.md`
- **OpenCodeプラグインREADME**: `.opencode/README.md`
- **統合ルール**: `.opencode/instructions/INSTRUCTIONS.md`
- **LLMドキュメント**: `llms.txt`（LLM用の完全なOpenCodeドキュメント）

---

## 📖 背景

実験的ロールアウト以降、Claude Codeを使用してきました。2025年9月、[@DRodriguezFX](https://x.com/DRodriguezFX)と共にClaude Codeのみを使用して[zenith.chat](https://zenith.chat)を構築し、Anthropic x Forum Venturesハッカソンで優勝しました。

これらの設定は複数の本番アプリケーションで実戦テスト済みです。

---

## ⚠️ 重要な注意事項

### コンテキストウィンドウ管理

**重要:** すべてのMCPを一度に有効にしないでください。有効にするツールが多すぎると、200kのコンテキストウィンドウが70kに縮小する可能性があります。

経験則：
- 20-30のMCPを設定
- プロジェクトごとに10未満を有効に保つ
- アクティブなツールを80未満に

プロジェクト設定で`disabledMcpServers`を使用して未使用のものを無効にします。

### カスタマイズ

これらの設定は私のワークフローに対応しています。以下を行うべきです：
1. 共感できるものから始める
2. スタックに合わせて修正
3. 使用しないものを削除
4. 独自のパターンを追加

---

## 🌟 Star履歴

[![Star History Chart](https://api.star-history.com/svg?repos=affaan-m/everything-claude-code&type=Date)](https://star-history.com/#affaan-m/everything-claude-code&Date)

---

## 🔗 リンク

- **簡易ガイド（ここから始める）:** [The Shorthand Guide to Everything Claude Code](https://x.com/affaanmustafa/status/2012378465664745795)
- **詳細ガイド（高度）:** [The Longform Guide to Everything Claude Code](https://x.com/affaanmustafa/status/2014040193557471352)
- **フォロー:** [@affaanmustafa](https://x.com/affaanmustafa)
- **zenith.chat:** [zenith.chat](https://zenith.chat)

---

## 📄 ライセンス

MIT - 自由に使用、必要に応じて修正、可能であれば貢献してください。

---

**このリポジトリが役に立ったらスターを付けてください。両方のガイドを読んでください。素晴らしいものを構築してください。**
