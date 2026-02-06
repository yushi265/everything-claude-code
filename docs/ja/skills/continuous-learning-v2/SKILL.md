---
name: continuous-learning-v2
description: フックを介してセッションを観察し、信頼度スコア付きアトミック本能を作成し、スキル/コマンド/エージェントに進化させる本能ベースの学習システム
version: 2.0.0
---

# 継続学習 v2 - 本能ベースアーキテクチャ

Claude Codeセッションをアトミックな「本能」(信頼度スコア付き小さな学習済み行動)を通じて再利用可能な知識に変換する高度な学習システム。

## v2の新機能

| 機能 | v1 | v2 |
|---------|----|----|
| 観察 | Stopフック(セッション終了) | PreToolUse/PostToolUse(100%信頼性) |
| 分析 | メインコンテキスト | バックグラウンドエージェント(Haiku) |
| 粒度 | 完全なスキル | アトミックな「本能」 |
| 信頼度 | なし | 0.3-0.9の重み付け |
| 進化 | 直接スキルへ | 本能 → クラスター → スキル/コマンド/エージェント |
| 共有 | なし | 本能のエクスポート/インポート |

## 本能モデル

本能は小さな学習済み行動です:

```yaml
---
id: prefer-functional-style
trigger: "when writing new functions"
confidence: 0.7
domain: "code-style"
source: "session-observation"
---

# 関数型スタイルを優先

## アクション
適切な場合、クラスよりも関数型パターンを使用します。

## 証拠
- 5つの関数型パターン優先のインスタンスを観察
- 2025-01-15にクラスベースアプローチから関数型へのユーザー修正
```

**特性:**
- **アトミック** — 1つのトリガー、1つのアクション
- **信頼度重み付け** — 0.3 = 暫定的、0.9 = ほぼ確実
- **ドメインタグ付け** — code-style、testing、git、debugging、workflowなど
- **証拠裏付け** — 何の観察がそれを作成したか追跡

## 仕組み

```
セッションアクティビティ
      │
      │ フックがプロンプト + ツール使用をキャプチャ(100%信頼性)
      ▼
┌─────────────────────────────────────────┐
│         observations.jsonl              │
│   (プロンプト、ツール呼び出し、結果)       │
└─────────────────────────────────────────┘
      │
      │ オブザーバーエージェントが読み取り(バックグラウンド、Haiku)
      ▼
┌─────────────────────────────────────────┐
│          パターン検出                    │
│   • ユーザー修正 → 本能                  │
│   • エラー解決 → 本能                    │
│   • 繰り返しワークフロー → 本能          │
└─────────────────────────────────────────┘
      │
      │ 作成/更新
      ▼
┌─────────────────────────────────────────┐
│         instincts/personal/             │
│   • prefer-functional.md (0.7)          │
│   • always-test-first.md (0.9)          │
│   • use-zod-validation.md (0.6)         │
└─────────────────────────────────────────┘
      │
      │ /evolveでクラスター化
      ▼
┌─────────────────────────────────────────┐
│              evolved/                   │
│   • commands/new-feature.md             │
│   • skills/testing-workflow.md          │
│   • agents/refactor-specialist.md       │
└─────────────────────────────────────────┘
```

## クイックスタート

### 1. 観察フックを有効化

`~/.claude/settings.json`に追加。

**プラグインとしてインストールした場合**(推奨):

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/hooks/observe.sh pre"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/hooks/observe.sh post"
      }]
    }]
  }
}
```

**`~/.claude/skills`に手動インストールした場合**:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh pre"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh post"
      }]
    }]
  }
}
```

### 2. ディレクトリ構造を初期化

Python CLIが自動的に作成しますが、手動でも作成できます:

```bash
mkdir -p ~/.claude/homunculus/{instincts/{personal,inherited},evolved/{agents,skills,commands}}
touch ~/.claude/homunculus/observations.jsonl
```

### 3. 本能コマンドを使用

```bash
/instinct-status     # 信頼度スコア付きで学習済み本能を表示
/evolve              # 関連する本能をスキル/コマンドにクラスター化
/instinct-export     # 共有用に本能をエクスポート
/instinct-import     # 他者からの本能をインポート
```

## コマンド

| コマンド | 説明 |
|---------|-------------|
| `/instinct-status` | 信頼度付きですべての学習済み本能を表示 |
| `/evolve` | 関連する本能をスキル/コマンドにクラスター化 |
| `/instinct-export` | 共有用に本能をエクスポート |
| `/instinct-import <file>` | 他者からの本能をインポート |

## 設定

`config.json`を編集:

```json
{
  "version": "2.0",
  "observation": {
    "enabled": true,
    "store_path": "~/.claude/homunculus/observations.jsonl",
    "max_file_size_mb": 10,
    "archive_after_days": 7
  },
  "instincts": {
    "personal_path": "~/.claude/homunculus/instincts/personal/",
    "inherited_path": "~/.claude/homunculus/instincts/inherited/",
    "min_confidence": 0.3,
    "auto_approve_threshold": 0.7,
    "confidence_decay_rate": 0.05
  },
  "observer": {
    "enabled": true,
    "model": "haiku",
    "run_interval_minutes": 5,
    "patterns_to_detect": [
      "user_corrections",
      "error_resolutions",
      "repeated_workflows",
      "tool_preferences"
    ]
  },
  "evolution": {
    "cluster_threshold": 3,
    "evolved_path": "~/.claude/homunculus/evolved/"
  }
}
```

## ファイル構造

```
~/.claude/homunculus/
├── identity.json           # プロフィール、技術レベル
├── observations.jsonl      # 現在のセッション観察
├── observations.archive/   # 処理済み観察
├── instincts/
│   ├── personal/           # 自動学習済み本能
│   └── inherited/          # 他者からインポート
└── evolved/
    ├── agents/             # 生成された専門エージェント
    ├── skills/             # 生成されたスキル
    └── commands/           # 生成されたコマンド
```

## Skill Creatorとの統合

[Skill Creator GitHub App](https://skill-creator.app)を使用すると、**両方**が生成されます:
- 従来のSKILL.mdファイル(後方互換性のため)
- 本能コレクション(v2学習システム用)

リポジトリ分析からの本能には`source: "repo-analysis"`とソースリポジトリURLが含まれます。

## 信頼度スコアリング

信頼度は時間とともに進化:

| スコア | 意味 | 動作 |
|-------|---------|----------|
| 0.3 | 暫定的 | 提案されるが強制されない |
| 0.5 | 中程度 | 関連する場合に適用 |
| 0.7 | 強い | 適用に自動承認 |
| 0.9 | ほぼ確実 | コア行動 |

**信頼度が増加**するとき:
- パターンが繰り返し観察される
- ユーザーが提案された行動を修正しない
- 他のソースからの類似本能が一致

**信頼度が減少**するとき:
- ユーザーが行動を明示的に修正
- 長期間パターンが観察されない
- 矛盾する証拠が現れる

## なぜ観察にスキルではなくフック?

> "v1はスキルに観察を依存していました。スキルは確率的で、Claudeの判断に基づいて約50-80%の確率で発火します。"

フックは**100%の確率**で、決定的に発火します。これは:
- すべてのツール呼び出しが観察される
- パターンが見逃されない
- 学習が包括的

## 後方互換性

v2はv1と完全に互換性があります:
- 既存の`~/.claude/skills/learned/`スキルは引き続き機能
- Stopフックも引き続き実行(ただし、v2にもフィード)
- 段階的な移行パス: 両方を並行して実行

## プライバシー

- 観察はマシンで**ローカル**に保持
- **本能**(パターン)のみエクスポート可能
- 実際のコードや会話内容は共有されない
- エクスポート内容を制御

## 関連

- [Skill Creator](https://skill-creator.app) - リポジトリ履歴から本能を生成
- [Homunculus](https://github.com/humanplane/homunculus) - v2アーキテクチャのインスピレーション
- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) - 継続学習セクション

---

*本能ベースの学習: 一度に一つの観察から、Claudeにあなたのパターンを教える。*
