**言語:** [English](../../README.md) | [繁體中文](../zh-TW/README.md) | [简体中文](../../README.zh-CN.md) | [日本語](README.md)

# Everything Claude Code

[![Stars](https://img.shields.io/github/stars/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
![Shell](https://img.shields.io/badge/-Shell-4EAA25?logo=gnu-bash&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)
![Go](https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white)
![Markdown](https://img.shields.io/badge/-Markdown-000000?logo=markdown&logoColor=white)

---

<div align="center">

**🌐 Language / 语言 / 語言 / 言語**

[**English**](../../README.md) | [简体中文](../../README.zh-CN.md) | [繁體中文](../zh-TW/README.md) | [日本語](../../README.ja.md)

</div>

---

**Anthropic ハッカソン受賞者による、Claude Code 設定の完全なコレクション。**

10ヶ月以上にわたる実製品開発での集中的な日常使用を通じて進化した、本番環境対応のエージェント、スキル、フック、コマンド、ルール、MCP設定。

---

## ガイド

このリポジトリには生のコードのみが含まれています。ガイドがすべてを説明します。

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
<td align="center"><b>ショートハンドガイド</b><br/>セットアップ、基礎、哲学。<b>まずこれを読んでください。</b></td>
<td align="center"><b>ロングフォームガイド</b><br/>トークン最適化、メモリ永続化、評価、並列化。</td>
</tr>
</table>

| トピック | 学べる内容 |
|-------|-------------------|
| トークン最適化 | モデル選択、システムプロンプトの削減、バックグラウンドプロセス |
| メモリ永続化 | セッション間でコンテキストを自動保存/ロードするフック |
| 継続的学習 | セッションからパターンを自動抽出し、再利用可能なスキルへ |
| 検証ループ | チェックポイント vs 継続的評価、評価者タイプ、pass@k 指標 |
| 並列化 | Git worktrees、カスケード手法、インスタンスのスケールタイミング |
| サブエージェント統制 | コンテキストの問題、反復的検索パターン |

---

## 🚀 クイックスタート

2分以内に起動と実行:

### ステップ1: プラグインのインストール

```bash
# マーケットプレースを追加
/plugin marketplace add affaan-m/everything-claude-code

# プラグインをインストール
/plugin install everything-claude-code@everything-claude-code
```

### ステップ2: ルールのインストール（必須）

> ⚠️ **重要:** Claude Code プラグインは `rules` を自動配布できません。手動でインストールしてください:

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

### ステップ3: 使用開始

```bash
# コマンドを試す
/plan "ユーザー認証を追加"

# 利用可能なコマンドを確認
/plugin list everything-claude-code@everything-claude-code
```

✨ **これで完了です!** 15以上のエージェント、30以上のスキル、30以上のコマンドにアクセスできます。

---

## 🌐 クロスプラットフォーム対応

このプラグインは **Windows、macOS、Linux** を完全にサポートしています。すべてのフックとスクリプトは最大の互換性のために Node.js で書き直されています。

### パッケージマネージャー検出

プラグインは優先するパッケージマネージャー（npm、pnpm、yarn、bun）を以下の優先順位で自動検出します:

1. **環境変数**: `CLAUDE_PACKAGE_MANAGER`
2. **プロジェクト設定**: `.claude/package-manager.json`
3. **package.json**: `packageManager` フィールド
4. **ロックファイル**: package-lock.json、yarn.lock、pnpm-lock.yaml、bun.lockb から検出
5. **グローバル設定**: `~/.claude/package-manager.json`
6. **フォールバック**: 最初に利用可能なパッケージマネージャー

優先するパッケージマネージャーを設定するには:

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

または Claude Code で `/setup-pm` コマンドを使用します。

---

## 📦 内容物

このリポジトリは **Claude Code プラグイン** です - 直接インストールするか、コンポーネントを手動でコピーしてください。

```
everything-claude-code/
|-- .claude-plugin/   # プラグインとマーケットプレースのマニフェスト
|   |-- plugin.json         # プラグインメタデータとコンポーネントパス
|   |-- marketplace.json    # /plugin marketplace add のマーケットプレースカタログ
|
|-- agents/           # 委任用の専門サブエージェント
|   |-- planner.md           # 機能実装計画
|   |-- architect.md         # システム設計決定
|   |-- tdd-guide.md         # テスト駆動開発
|   |-- code-reviewer.md     # 品質とセキュリティレビュー
|   |-- security-reviewer.md # 脆弱性分析
|   |-- build-error-resolver.md
|   |-- e2e-runner.md        # Playwright E2E テスト
|   |-- refactor-cleaner.md  # デッドコードのクリーンアップ
|   |-- doc-updater.md       # ドキュメント同期
|   |-- go-reviewer.md       # Go コードレビュー
|   |-- go-build-resolver.md # Go ビルドエラー解決
|   |-- python-reviewer.md   # Python コードレビュー（新規）
|   |-- database-reviewer.md # データベース/Supabase レビュー（新規）
|
|-- skills/           # ワークフロー定義とドメイン知識
|   |-- coding-standards/           # 言語のベストプラクティス
|   |-- backend-patterns/           # API、データベース、キャッシングパターン
|   |-- frontend-patterns/          # React、Next.js パターン
|   |-- continuous-learning/        # セッションからパターンを自動抽出（ロングフォームガイド）
|   |-- continuous-learning-v2/     # 直感ベースの学習と信頼スコア
|   |-- iterative-retrieval/        # サブエージェント用の段階的コンテキスト洗練
|   |-- strategic-compact/          # 手動圧縮提案（ロングフォームガイド）
|   |-- tdd-workflow/               # TDD 手法
|   |-- security-review/            # セキュリティチェックリスト
|   |-- eval-harness/               # 検証ループ評価（ロングフォームガイド）
|   |-- verification-loop/          # 継続的検証（ロングフォームガイド）
|   |-- golang-patterns/            # Go のイディオムとベストプラクティス
|   |-- golang-testing/             # Go テストパターン、TDD、ベンチマーク
|   |-- django-patterns/            # Django パターン、モデル、ビュー（新規）
|   |-- django-security/            # Django セキュリティベストプラクティス（新規）
|   |-- django-tdd/                 # Django TDD ワークフロー（新規）
|   |-- django-verification/        # Django 検証ループ（新規）
|   |-- python-patterns/            # Python のイディオムとベストプラクティス（新規）
|   |-- python-testing/             # pytest による Python テスト（新規）
|   |-- springboot-patterns/        # Java Spring Boot パターン（新規）
|   |-- springboot-security/        # Spring Boot セキュリティ（新規）
|   |-- springboot-tdd/             # Spring Boot TDD（新規）
|   |-- springboot-verification/    # Spring Boot 検証（新規）
|   |-- configure-ecc/              # インタラクティブインストールウィザード（新規）
|
|-- commands/         # クイック実行用のスラッシュコマンド
|   |-- tdd.md              # /tdd - テスト駆動開発
|   |-- plan.md             # /plan - 実装計画
|   |-- e2e.md              # /e2e - E2E テスト生成
|   |-- code-review.md      # /code-review - 品質レビュー
|   |-- build-fix.md        # /build-fix - ビルドエラー修正
|   |-- refactor-clean.md   # /refactor-clean - デッドコード削除
|   |-- learn.md            # /learn - セッション中にパターン抽出（ロングフォームガイド）
|   |-- checkpoint.md       # /checkpoint - 検証状態を保存（ロングフォームガイド）
|   |-- verify.md           # /verify - 検証ループを実行（ロングフォームガイド）
|   |-- setup-pm.md         # /setup-pm - パッケージマネージャー設定
|   |-- go-review.md        # /go-review - Go コードレビュー（新規）
|   |-- go-test.md          # /go-test - Go TDD ワークフロー（新規）
|   |-- go-build.md         # /go-build - Go ビルドエラー修正（新規）
|   |-- skill-create.md     # /skill-create - git 履歴からスキル生成（新規）
|   |-- instinct-status.md  # /instinct-status - 学習済み直感を表示（新規）
|   |-- instinct-import.md  # /instinct-import - 直感をインポート（新規）
|   |-- instinct-export.md  # /instinct-export - 直感をエクスポート（新規）
|   |-- evolve.md           # /evolve - 直感をスキルにクラスタ化
|   |-- pm2.md              # /pm2 - PM2 サービスライフサイクル管理（新規）
|   |-- multi-plan.md       # /multi-plan - マルチエージェントタスク分解（新規）
|   |-- multi-execute.md    # /multi-execute - オーケストレーション済みマルチエージェントワークフロー（新規）
|   |-- multi-backend.md    # /multi-backend - バックエンドマルチサービスオーケストレーション（新規）
|   |-- multi-frontend.md   # /multi-frontend - フロントエンドマルチサービスオーケストレーション（新規）
|   |-- multi-workflow.md   # /multi-workflow - 汎用マルチサービスワークフロー（新規）
|
|-- rules/            # 常時遵守のガイドライン（~/.claude/rules/ にコピー）
|   |-- README.md            # 構造概要とインストールガイド
|   |-- common/              # 言語非依存の原則
|   |   |-- coding-style.md    # 不変性、ファイル構成
|   |   |-- git-workflow.md    # コミットフォーマット、PR プロセス
|   |   |-- testing.md         # TDD、80% カバレッジ要件
|   |   |-- performance.md     # モデル選択、コンテキスト管理
|   |   |-- patterns.md        # デザインパターン、スケルトンプロジェクト
|   |   |-- hooks.md           # フックアーキテクチャ、TodoWrite
|   |   |-- agents.md          # サブエージェントへの委任タイミング
|   |   |-- security.md        # 必須セキュリティチェック
|   |-- typescript/          # TypeScript/JavaScript 固有
|   |-- python/              # Python 固有
|   |-- golang/              # Go 固有
|
|-- hooks/            # トリガーベースの自動化
|   |-- hooks.json                # すべてのフック設定（PreToolUse、PostToolUse、Stop など）
|   |-- memory-persistence/       # セッションライフサイクルフック（ロングフォームガイド）
|   |-- strategic-compact/        # 圧縮提案（ロングフォームガイド）
|
|-- scripts/          # クロスプラットフォーム Node.js スクリプト（新規）
|   |-- lib/                     # 共有ユーティリティ
|   |   |-- utils.js             # クロスプラットフォームファイル/パス/システムユーティリティ
|   |   |-- package-manager.js   # パッケージマネージャー検出と選択
|   |-- hooks/                   # フック実装
|   |   |-- session-start.js     # セッション開始時にコンテキストをロード
|   |   |-- session-end.js       # セッション終了時に状態を保存
|   |   |-- pre-compact.js       # 圧縮前の状態保存
|   |   |-- suggest-compact.js   # 戦略的圧縮提案
|   |   |-- evaluate-session.js  # セッションからパターンを抽出
|   |-- setup-package-manager.js # インタラクティブ PM セットアップ
|
|-- tests/            # テストスイート（新規）
|   |-- lib/                     # ライブラリテスト
|   |-- hooks/                   # フックテスト
|   |-- run-all.js               # すべてのテストを実行
|
|-- contexts/         # 動的システムプロンプト注入コンテキスト（ロングフォームガイド）
|   |-- dev.md              # 開発モードコンテキスト
|   |-- review.md           # コードレビューモードコンテキスト
|   |-- research.md         # 研究/探索モードコンテキスト
|
|-- examples/         # サンプル設定とセッション
|   |-- CLAUDE.md           # サンプルプロジェクトレベル設定
|   |-- user-CLAUDE.md      # サンプルユーザーレベル設定
|
|-- mcp-configs/      # MCP サーバー設定
|   |-- mcp-servers.json    # GitHub、Supabase、Vercel、Railway など
|
|-- marketplace.json  # 自己ホスト型マーケットプレース設定（/plugin marketplace add 用）
```

---

## 🛠️ エコシステムツール

### スキルクリエイター

リポジトリから Claude Code スキルを生成する2つの方法:

#### オプション A: ローカル分析（組み込み）

外部サービスを使わずにローカル分析を行う `/skill-create` コマンドを使用:

```bash
/skill-create                    # 現在のリポジトリを分析
/skill-create --instincts        # continuous-learning 用の直感も生成
```

これは git 履歴をローカルで分析し、SKILL.md ファイルを生成します。

#### オプション B: GitHub アプリ（高度）

高度な機能（10k+ コミット、自動 PR、チーム共有）用:

[GitHub アプリをインストール](https://github.com/apps/skill-creator) | [ecc.tools](https://ecc.tools)

```bash
# 任意の issue にコメント:
/skill-creator analyze

# またはデフォルトブランチへのプッシュで自動トリガー
```

両方のオプションが作成するもの:
- **SKILL.md ファイル** - Claude Code ですぐに使えるスキル
- **直感コレクション** - continuous-learning-v2 用
- **パターン抽出** - コミット履歴から学習

### 🧠 継続的学習 v2

直感ベースの学習システムがパターンを自動的に学習:

```bash
/instinct-status        # 信頼度付きで学習済み直感を表示
/instinct-import <file> # 他者から直感をインポート
/instinct-export        # 共有用に直感をエクスポート
/evolve                 # 関連する直感をスキルにクラスタ化
```

完全なドキュメントは `skills/continuous-learning-v2/` を参照してください。

---

## 📋 要件

### Claude Code CLI バージョン

**最小バージョン: v2.1.0 以上**

このプラグインは、プラグインシステムがフックを処理する方法の変更により、Claude Code CLI v2.1.0+ が必要です。

バージョンを確認:
```bash
claude --version
```

### 重要: フックの自動読み込み動作

> ⚠️ **貢献者向け:** `.claude-plugin/plugin.json` に `"hooks"` フィールドを追加しないでください。これは回帰テストで強制されます。

Claude Code v2.1+ は規約により、インストールされたプラグインの `hooks/hooks.json` を**自動的に読み込みます**。`plugin.json` で明示的に宣言すると、重複検出エラーが発生します:

```
Duplicate hooks file detected: ./hooks/hooks.json resolves to already-loaded file
```

**履歴:** これは、このリポジトリで繰り返し修正/元に戻すサイクルを引き起こしました（[#29](https://github.com/affaan-m/everything-claude-code/issues/29)、[#52](https://github.com/affaan-m/everything-claude-code/issues/52)、[#103](https://github.com/affaan-m/everything-claude-code/issues/103)）。Claude Code バージョン間で動作が変更され、混乱が生じました。現在、これが再導入されることを防ぐための回帰テストがあります。

---

## 📥 インストール

### オプション 1: プラグインとしてインストール（推奨）

このリポジトリを使用する最も簡単な方法 - Claude Code プラグインとしてインストール:

```bash
# このリポジトリをマーケットプレースとして追加
/plugin marketplace add affaan-m/everything-claude-code

# プラグインをインストール
/plugin install everything-claude-code@everything-claude-code
```

または、`~/.claude/settings.json` に直接追加:

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

> **注意:** Claude Code プラグインシステムは、プラグイン経由での `rules` の配布をサポートしていません（[上流の制限](https://code.claude.com/docs/en/plugins-reference)）。ルールを手動でインストールする必要があります:
>
> ```bash
> # まずリポジトリをクローン
> git clone https://github.com/affaan-m/everything-claude-code.git
>
> # オプション A: ユーザーレベルルール（すべてのプロジェクトに適用）
> cp -r everything-claude-code/rules/common/* ~/.claude/rules/
> cp -r everything-claude-code/rules/typescript/* ~/.claude/rules/   # スタックを選択
> cp -r everything-claude-code/rules/python/* ~/.claude/rules/
> cp -r everything-claude-code/rules/golang/* ~/.claude/rules/
>
> # オプション B: プロジェクトレベルルール（現在のプロジェクトのみに適用）
> mkdir -p .claude/rules
> cp -r everything-claude-code/rules/common/* .claude/rules/
> cp -r everything-claude-code/rules/typescript/* .claude/rules/     # スタックを選択
> ```

---

### 🔧 オプション 2: 手動インストール

インストールするものを手動で制御したい場合:

```bash
# リポジトリをクローン
git clone https://github.com/affaan-m/everything-claude-code.git

# エージェントを Claude 設定にコピー
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

#### settings.json にフックを追加

`hooks/hooks.json` のフックを `~/.claude/settings.json` にコピーします。

#### MCP を設定

`mcp-configs/mcp-servers.json` から必要な MCP サーバーを `~/.claude.json` にコピーします。

**重要:** `YOUR_*_HERE` プレースホルダーを実際の API キーに置き換えてください。

---

## 🎯 主要な概念

### エージェント

サブエージェントは限られたスコープで委任されたタスクを処理します。例:

```markdown
---
name: code-reviewer
description: 品質、セキュリティ、保守性についてコードをレビューする
tools: ["Read", "Grep", "Glob", "Bash"]
model: opus
---

あなたはシニアコードレビュアーです...
```

### スキル

スキルはコマンドやエージェントによって呼び出されるワークフロー定義です:

```markdown
# TDD ワークフロー

1. 最初にインターフェースを定義
2. 失敗するテストを書く（RED）
3. 最小限のコードを実装（GREEN）
4. リファクタリング（IMPROVE）
5. 80%以上のカバレッジを検証
```

### フック

フックはツールイベントで発火します。例 - console.log について警告:

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] console.log を削除してください' >&2"
  }]
}
```

### ルール

ルールは常時遵守のガイドラインで、`common/`（言語非依存）+ 言語固有ディレクトリに整理されています:

```
rules/
  common/          # 普遍的な原則（常にインストール）
  typescript/      # TS/JS 固有のパターンとツール
  python/          # Python 固有のパターンとツール
  golang/          # Go 固有のパターンとツール
```

インストールと構造の詳細については [`rules/README.md`](../../rules/README.md) を参照してください。

---

## 🧪 テストの実行

プラグインには包括的なテストスイートが含まれています:

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

**貢献を歓迎し、奨励します。**

このリポジトリはコミュニティリソースとなることを目的としています。以下のようなものがあれば:
- 有用なエージェントやスキル
- 巧妙なフック
- より良い MCP 設定
- 改善されたルール

ぜひ貢献してください! ガイドラインについては [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

### 貢献のアイデア

- 言語固有のスキル（Rust、C#、Swift、Kotlin）— Go、Python、Java は既に含まれています
- フレームワーク固有の設定（Rails、Laravel、FastAPI、NestJS）— Django、Spring Boot は既に含まれています
- DevOps エージェント（Kubernetes、Terraform、AWS、Docker）
- テスト戦略（異なるフレームワーク、ビジュアル回帰）
- ドメイン固有の知識（ML、データエンジニアリング、モバイル）

---

## 📖 背景

私は実験的なロールアウト以来、Claude Code を使用してきました。2025年9月に [@DRodriguezFX](https://x.com/DRodriguezFX) と共に、Claude Code を使って [zenith.chat](https://zenith.chat) を構築し、Anthropic x Forum Ventures ハッカソンで優勝しました。

これらの設定は複数の本番アプリケーションで実戦テストされています。

---

## ⚠️ 重要な注意事項

### コンテキストウィンドウ管理

**重要:** すべての MCP を一度に有効にしないでください。有効化するツールが多すぎると、200k のコンテキストウィンドウが 70k に縮小される可能性があります。

経験則:
- 20-30 の MCP を設定
- プロジェクトごとに 10 未満を有効化
- アクティブなツールを 80 未満に

プロジェクト設定で `disabledMcpServers` を使用して、未使用のものを無効にしてください。

### カスタマイズ

これらの設定は私のワークフローに適しています。以下を行うべきです:
1. 共感できるものから始める
2. スタックに合わせて変更する
3. 使わないものを削除する
4. 独自のパターンを追加する

---

## 🌟 Star 履歴

[![Star History Chart](https://api.star-history.com/svg?repos=affaan-m/everything-claude-code&type=Date)](https://star-history.com/#affaan-m/everything-claude-code&Date)

---

## 🔗 リンク

- **ショートハンドガイド（ここから開始）:** [The Shorthand Guide to Everything Claude Code](https://x.com/affaanmustafa/status/2012378465664745795)
- **ロングフォームガイド（高度）:** [The Longform Guide to Everything Claude Code](https://x.com/affaanmustafa/status/2014040193557471352)
- **フォロー:** [@affaanmustafa](https://x.com/affaanmustafa)
- **zenith.chat:** [zenith.chat](https://zenith.chat)

---

## 📄 ライセンス

MIT - 自由に使用し、必要に応じて変更し、可能であればコントリビュートしてください。

---

**このリポジトリが役立つ場合は Star をつけてください。両方のガイドを読んでください。素晴らしいものを作りましょう。**
