# Everything Claude Codeの簡易ガイド

![ヘッダー: Anthropicハッカソン優勝 - Claude Codeのヒントとコツ](../../assets/images/shortform/00-header.png)

---

**2月の実験的ロールアウト以来、熱心なClaude Codeユーザーで、[@DRodriguezFX](https://x.com/DRodriguezFX)と一緒に[zenith.chat](https://zenith.chat)でAnthropic x Forum Venturesハッカソンに優勝しました - 完全にClaude Codeを使用。**

10ヶ月間の日常使用後の私の完全なセットアップは次のとおりです: スキル、フック、サブエージェント、MCP、プラグイン、そして実際に機能するもの。

---

## スキルとコマンド

スキルはルールのように動作し、特定のスコープとワークフローに制限されます。特定のワークフローを実行する必要がある場合の、プロンプトへの短縮形です。

Opus 4.5でコーディングした長いセッションの後、デッドコードと散らばった.mdファイルをクリーンアップしたいですか？ `/refactor-clean`を実行します。テストが必要ですか？ `/tdd`、`/e2e`、`/test-coverage`。スキルにはコードマップも含めることができます - Claudeが探索にコンテキストを消費せずに、コードベースをすばやくナビゲートする方法です。

![連鎖コマンドを示すターミナル](../../assets/images/shortform/02-chaining-commands.jpeg)
*コマンドの連鎖*

コマンドは、スラッシュコマンドを介して実行されるスキルです。重複していますが、異なる方法で保存されます:

- **スキル**: `~/.claude/skills/` - より広範なワークフロー定義
- **コマンド**: `~/.claude/commands/` - クイック実行可能プロンプト

```bash
# スキル構造の例
~/.claude/skills/
  pmx-guidelines.md      # プロジェクト固有のパターン
  coding-standards.md    # 言語のベストプラクティス
  tdd-workflow/          # README.mdを含む複数ファイルスキル
  security-review/       # チェックリストベースのスキル
```

---

## フック

フックは、特定のイベントで発火するトリガーベースの自動化です。スキルとは異なり、ツール呼び出しとライフサイクルイベントに制限されています。

**フックタイプ:**

1. **PreToolUse** - ツール実行前（検証、リマインダー）
2. **PostToolUse** - ツール終了後（フォーマット、フィードバックループ）
3. **UserPromptSubmit** - メッセージ送信時
4. **Stop** - Claude応答終了時
5. **PreCompact** - コンテキスト圧縮前
6. **Notification** - 許可リクエスト

**例: 長時間実行コマンド前のtmuxリマインダー**

```json
{
  "PreToolUse": [
    {
      "matcher": "tool == \"Bash\" && tool_input.command matches \"(npm|pnpm|yarn|cargo|pytest)\"",
      "hooks": [
        {
          "type": "command",
          "command": "if [ -z \"$TMUX\" ]; then echo '[Hook] Consider tmux for session persistence' >&2; fi"
        }
      ]
    }
  ]
}
```

![PostToolUseフックフィードバック](../../assets/images/shortform/03-posttooluse-hook.png)
*Claude CodeでPostToolUseフックを実行中に得られるフィードバックの例*

**プロヒント:** JSONを手動で書く代わりに、会話形式でフックを作成するには、`hookify`プラグインを使用します。`/hookify`を実行して、やりたいことを説明します。

---

## サブエージェント

サブエージェントは、メインClaude（オーケストレーター）が限定されたスコープでタスクを委任できるプロセスです。バックグラウンドまたはフォアグラウンドで実行でき、メインエージェントのコンテキストを解放します。

サブエージェントはスキルとうまく連携します - スキルのサブセットを実行できるサブエージェントは、タスクを委任され、それらのスキルを自律的に使用できます。また、特定のツール権限でサンドボックス化することもできます。

```bash
# サブエージェント構造の例
~/.claude/agents/
  planner.md           # 機能実装計画
  architect.md         # システム設計決定
  tdd-guide.md         # テスト駆動開発
  code-reviewer.md     # 品質/セキュリティレビュー
  security-reviewer.md # 脆弱性分析
  build-error-resolver.md
  e2e-runner.md
  refactor-cleaner.md
```

適切なスコープ設定のため、サブエージェントごとに許可されるツール、MCP、権限を設定します。

---

## ルールとメモリ

`.rules`フォルダには、Claudeが常に従うべきベストプラクティスを含む`.md`ファイルがあります。2つのアプローチ:

1. **単一のCLAUDE.md** - すべてを1つのファイルに（ユーザーまたはプロジェクトレベル）
2. **Rulesフォルダ** - 関心事ごとにグループ化されたモジュール式`.md`ファイル

```bash
~/.claude/rules/
  security.md      # ハードコードされたシークレットなし、入力検証
  coding-style.md  # イミュータビリティ、ファイル構成
  testing.md       # TDDワークフロー、80%カバレッジ
  git-workflow.md  # コミット形式、PRプロセス
  agents.md        # サブエージェントへの委任タイミング
  performance.md   # モデル選択、コンテキスト管理
```

**ルールの例:**

- コードベースに絵文字を使用しない
- フロントエンドで紫色の色相を避ける
- デプロイ前に必ずコードをテスト
- メガファイルよりモジュール化されたコードを優先
- console.logをコミットしない

---

## MCP（Model Context Protocol）

MCPはClaudeを外部サービスに直接接続します。APIの置き換えではありません - それらの周りのプロンプト駆動ラッパーで、情報をナビゲートする際により柔軟性を提供します。

**例:** Supabase MCPを使用すると、Claudeが特定のデータを引き出し、コピー＆ペーストなしでSQLを直接アップストリームで実行できます。データベース、デプロイプラットフォームなども同様です。

![テーブルをリスト表示するSupabase MCP](../../assets/images/shortform/04-supabase-mcp.jpeg)
*publicスキーマ内のテーブルをリスト表示するSupabase MCPの例*

**ClaudeのChrome:** Claudeがブラウザを自律的に制御できる組み込みプラグインMCPです - クリックして物事がどのように機能するかを確認します。

**重要: コンテキストウィンドウ管理**

MCPには慎重に選択してください。すべてのMCPをユーザー設定に保持していますが、**使用していないものはすべて無効にしています**。`/plugins`に移動してスクロールダウンするか、`/mcp`を実行します。

![/pluginsインターフェース](../../assets/images/shortform/05-plugins-interface.jpeg)
*/pluginsを使用してMCPに移動し、現在インストールされているものとそのステータスを確認*

圧縮前の200kコンテキストウィンドウは、有効なツールが多すぎると70kになる可能性があります。パフォーマンスが大幅に低下します。

**経験則:** 設定に20〜30のMCPを持ちますが、有効にするのは10未満 / アクティブなツールは80未満に保ちます。

```bash
# 有効なMCPをチェック
/mcp

# ~/.claude.jsonのprojects.disabledMcpServersで未使用のものを無効化
```

---

## プラグイン

プラグインは、面倒な手動セットアップの代わりに簡単にインストールできるツールをパッケージ化します。プラグインは、スキル + MCPを組み合わせたもの、またはフック/ツールをバンドルしたものです。

**プラグインのインストール:**

```bash
# マーケットプレースを追加
claude plugin marketplace add https://github.com/mixedbread-ai/mgrep

# Claudeを開き、/pluginsを実行し、新しいマーケットプレースを見つけてそこからインストール
```

![mgrepを表示するMarketplacesタブ](../../assets/images/shortform/06-marketplaces-mgrep.jpeg)
*新しくインストールされたMixedbread-Grepマーケットプレースの表示*

**LSPプラグイン**は、エディタの外でClaude Codeを頻繁に実行する場合に特に便利です。Language Server Protocolは、IDEを開く必要なく、Claudeにリアルタイムの型チェック、定義へのジャンプ、インテリジェントな補完を提供します。

```bash
# 有効なプラグインの例
typescript-lsp@claude-plugins-official  # TypeScriptインテリジェンス
pyright-lsp@claude-plugins-official     # Python型チェック
hookify@claude-plugins-official         # 会話形式でフックを作成
mgrep@Mixedbread-Grep                   # ripgrepより優れた検索
```

MCPと同じ警告 - コンテキストウィンドウに注意してください。

---

## ヒントとコツ

### キーボードショートカット

- `Ctrl+U` - 行全体を削除（バックスペース連打より速い）
- `!` - クイックbashコマンドプレフィックス
- `@` - ファイルを検索
- `/` - スラッシュコマンドを開始
- `Shift+Enter` - 複数行入力
- `Tab` - 思考の表示を切り替え
- `Esc Esc` - Claudeを中断 / コードを復元

### 並列ワークフロー

- **フォーク** (`/fork`) - キューに入れられたメッセージをスパムする代わりに、重複しないタスクを並列で実行するために会話をフォーク
- **Gitワークツリー** - 競合なしで重複する並列Claudeのため。各ワークツリーは独立したチェックアウトです

```bash
git worktree add ../feature-branch feature-branch
# 各ワークツリーで別々のClaudeインスタンスを実行
```

### 長時間実行コマンド用のtmux

Claudeが実行するログ/bashプロセスをストリーム配信して監視します:

https://github.com/user-attachments/assets/shortform/07-tmux-video.mp4

```bash
tmux new -s dev
# Claudeはここでコマンドを実行し、デタッチと再アタッチができます
tmux attach -t dev
```

### mgrep > grep

`mgrep`はripgrep/grepからの大幅な改善です。プラグインマーケットプレース経由でインストールし、`/mgrep`スキルを使用します。ローカル検索とウェブ検索の両方で動作します。

```bash
mgrep "function handleSubmit"  # ローカル検索
mgrep --web "Next.js 15 app router changes"  # ウェブ検索
```

### その他の便利なコマンド

- `/rewind` - 以前の状態に戻る
- `/statusline` - ブランチ、コンテキスト%、TODOでカスタマイズ
- `/checkpoints` - ファイルレベルのアンドゥポイント
- `/compact` - 手動でコンテキスト圧縮をトリガー

### GitHub Actions CI/CD

GitHub ActionsでPRのコードレビューをセットアップします。設定すると、ClaudeがPRを自動的にレビューできます。

![PRを承認するClaudeボット](../../assets/images/shortform/08-github-pr-review.jpeg)
*バグ修正PRを承認するClaude*

### サンドボックス化

リスクのある操作にはサンドボックスモードを使用します - Claudeは実際のシステムに影響を与えずに制限された環境で実行されます。

---

## エディタについて

エディタの選択は、Claude Codeワークフローに大きな影響を与えます。Claude Codeはあらゆるターミナルから動作しますが、有能なエディタと組み合わせることで、リアルタイムのファイル追跡、素早いナビゲーション、統合されたコマンド実行が可能になります。

### Zed（私の好み）

私は[Zed](https://zed.dev)を使用しています - Rustで書かれているため、本当に高速です。即座に開き、巨大なコードベースを問題なく処理し、システムリソースをほとんど使用しません。

**ZedとClaude Codeが素晴らしい組み合わせである理由:**

- **速度** - Rustベースのパフォーマンスは、Claudeが急速にファイルを編集しているときでもラグがないことを意味します。エディタが追いつきます
- **エージェントパネル統合** - ZedのClaude統合により、Claudeが編集するときにリアルタイムでファイルの変更を追跡できます。エディタを離れることなく、Claudeが参照するファイル間をジャンプ
- **CMD+Shift+Rコマンドパレット** - すべてのカスタムスラッシュコマンド、デバッガー、ビルドスクリプトへの検索可能なUIでのクイックアクセス
- **最小限のリソース使用** - 重い操作中にClaudeとRAM/CPUを競合しません。Opusを実行しているときに重要
- **Vimモード** - それがあなたのスタイルなら、完全なvimキーバインディング

![カスタムコマンドを持つZedエディタ](../../assets/images/shortform/09-zed-editor.jpeg)
*CMD+Shift+Rを使用したカスタムコマンドドロップダウンを持つZedエディタ。右下の照準でFollowingモードが表示されます。*

**エディタに依存しないヒント:**

1. **画面を分割** - 一方にClaude Codeのターミナル、他方にエディタ
2. **Ctrl + G** - Claudeが現在作業中のファイルをZedで素早く開く
3. **自動保存** - Claudeのファイル読み取りが常に最新になるように自動保存を有効にする
4. **Git統合** - コミット前にClaudeの変更をレビューするためにエディタのgit機能を使用
5. **ファイルウォッチャー** - ほとんどのエディタは変更されたファイルを自動的に再読み込みします、これが有効になっていることを確認

### VSCode / Cursor

これも実行可能な選択肢で、Claude Codeとうまく機能します。`\ide`を使用してLSP機能を有効にする自動同期を備えたターミナル形式のいずれかで使用できます（プラグインで今はやや冗長）。または、エディタとより統合され、UIが一致する拡張機能を選択できます。

![VS Code Claude Code拡張機能](../../assets/images/shortform/10-vscode-extension.jpeg)
*VS Code拡張機能は、IDEに直接統合されたClaude Codeのネイティブグラフィカルインターフェースを提供します。*

---

## 私のセットアップ

### プラグイン

**インストール済み:** (通常、これらのうち4〜5つのみを一度に有効にしています)

```markdown
ralph-wiggum@claude-code-plugins       # ループ自動化
frontend-design@claude-code-plugins    # UI/UXパターン
commit-commands@claude-code-plugins    # Gitワークフロー
security-guidance@claude-code-plugins  # セキュリティチェック
pr-review-toolkit@claude-code-plugins  # PR自動化
typescript-lsp@claude-plugins-official # TSインテリジェンス
hookify@claude-plugins-official        # フック作成
code-simplifier@claude-plugins-official
feature-dev@claude-code-plugins
explanatory-output-style@claude-code-plugins
code-review@claude-code-plugins
context7@claude-plugins-official       # ライブドキュメント
pyright-lsp@claude-plugins-official    # Python型
mgrep@Mixedbread-Grep                  # より良い検索
```

### MCPサーバー

**設定済み（ユーザーレベル）:**

```json
{
  "github": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-github"] },
  "firecrawl": { "command": "npx", "args": ["-y", "firecrawl-mcp"] },
  "supabase": {
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref=YOUR_REF"]
  },
  "memory": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-memory"] },
  "sequential-thinking": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
  },
  "vercel": { "type": "http", "url": "https://mcp.vercel.com" },
  "railway": { "command": "npx", "args": ["-y", "@railway/mcp-server"] },
  "cloudflare-docs": { "type": "http", "url": "https://docs.mcp.cloudflare.com/mcp" },
  "cloudflare-workers-bindings": {
    "type": "http",
    "url": "https://bindings.mcp.cloudflare.com/mcp"
  },
  "clickhouse": { "type": "http", "url": "https://mcp.clickhouse.cloud/mcp" },
  "AbletonMCP": { "command": "uvx", "args": ["ableton-mcp"] },
  "magic": { "command": "npx", "args": ["-y", "@magicuidesign/mcp@latest"] }
}
```

これが鍵です - 14のMCPを設定していますが、プロジェクトごとに約5〜6つしか有効にしていません。コンテキストウィンドウを健全に保ちます。

### 主要なフック

```json
{
  "PreToolUse": [
    { "matcher": "npm|pnpm|yarn|cargo|pytest", "hooks": ["tmux reminder"] },
    { "matcher": "Write && .md file", "hooks": ["block unless README/CLAUDE"] },
    { "matcher": "git push", "hooks": ["open editor for review"] }
  ],
  "PostToolUse": [
    { "matcher": "Edit && .ts/.tsx/.js/.jsx", "hooks": ["prettier --write"] },
    { "matcher": "Edit && .ts/.tsx", "hooks": ["tsc --noEmit"] },
    { "matcher": "Edit", "hooks": ["grep console.log warning"] }
  ],
  "Stop": [
    { "matcher": "*", "hooks": ["check modified files for console.log"] }
  ]
}
```

### カスタムステータスライン

ユーザー、ディレクトリ、ダーティインジケーター付きgitブランチ、残りのコンテキスト%、モデル、時間、TODO数を表示:

![カスタムステータスライン](../../assets/images/shortform/11-statusline.jpeg)
*Macルートディレクトリの私のステータスラインの例*

```
affoon:~ ctx:65% Opus 4.5 19:52
▌▌ plan mode on (shift+tab to cycle)
```

### ルール構造

```
~/.claude/rules/
  security.md      # 必須セキュリティチェック
  coding-style.md  # イミュータビリティ、ファイルサイズ制限
  testing.md       # TDD、80%カバレッジ
  git-workflow.md  # 従来のコミット
  agents.md        # サブエージェント委任ルール
  patterns.md      # APIレスポンス形式
  performance.md   # モデル選択（Haiku vs Sonnet vs Opus）
  hooks.md         # フックドキュメント
```

### サブエージェント

```
~/.claude/agents/
  planner.md           # 機能の分解
  architect.md         # システム設計
  tdd-guide.md         # テストを最初に書く
  code-reviewer.md     # 品質レビュー
  security-reviewer.md # 脆弱性スキャン
  build-error-resolver.md
  e2e-runner.md        # Playwrightテスト
  refactor-cleaner.md  # デッドコード削除
  doc-updater.md       # ドキュメントの同期を保つ
```

---

## 重要なポイント

1. **過度に複雑にしない** - 設定をファインチューニングとして扱い、アーキテクチャとして扱わない
2. **コンテキストウィンドウは貴重** - 未使用のMCPとプラグインを無効にする
3. **並列実行** - 会話をフォークし、gitワークツリーを使用
4. **繰り返しを自動化** - フォーマット、リント、リマインダー用のフック
5. **サブエージェントのスコープを設定** - 限定されたツール = 集中した実行

---

## 参考文献

- [プラグインリファレンス](https://code.claude.com/docs/en/plugins-reference)
- [フックドキュメント](https://code.claude.com/docs/en/hooks)
- [チェックポイント](https://code.claude.com/docs/en/checkpointing)
- [インタラクティブモード](https://code.claude.com/docs/en/interactive-mode)
- [メモリシステム](https://code.claude.com/docs/en/memory)
- [サブエージェント](https://code.claude.com/docs/en/sub-agents)
- [MCP概要](https://code.claude.com/docs/en/mcp-overview)

---

**注:** これは詳細のサブセットです。高度なパターンについては[詳細ガイド](./the-longform-guide.md)を参照してください。

---

*[@DRodriguezFX](https://x.com/DRodriguezFX)と一緒に[zenith.chat](https://zenith.chat)を構築し、NYCでAnthropic x Forum Venturesハッカソンに優勝*
