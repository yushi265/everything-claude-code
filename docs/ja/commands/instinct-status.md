---
name: instinct-status
description: 信頼度レベルとともに学習したすべてのinstinctsを表示
command: true
---

# Instinct Statusコマンド

信頼度スコアとともに学習したすべてのinstinctsを、ドメインごとにグループ化して表示します。

## 実装

プラグインのルートパスを使用してinstinct CLIを実行：

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" status
```

または`CLAUDE_PLUGIN_ROOT`が設定されていない場合（手動インストール）、以下を使用：

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py status
```

## 使用方法

```
/instinct-status
/instinct-status --domain code-style
/instinct-status --low-confidence
```

## 実行内容

1. `~/.claude/homunculus/instincts/personal/`からすべてのinstinctファイルを読み取り
2. `~/.claude/homunculus/instincts/inherited/`から継承されたinstinctsを読み取り
3. ドメインごとにグループ化して信頼度バーとともに表示

## 出力形式

```
📊 Instinctステータス
==================

## コードスタイル（4 instincts）

### prefer-functional-style
トリガー: when writing new functions
アクション: Use functional patterns over classes
信頼度: ████████░░ 80%
ソース: session-observation | 最終更新: 2025-01-22

### use-path-aliases
トリガー: when importing modules
アクション: Use @/ path aliases instead of relative imports
信頼度: ██████░░░░ 60%
ソース: repo-analysis (github.com/acme/webapp)

## テスティング（2 instincts）

### test-first-workflow
トリガー: when adding new functionality
アクション: Write test first, then implementation
信頼度: █████████░ 90%
ソース: session-observation

## ワークフロー（3 instincts）

### grep-before-edit
トリガー: when modifying code
アクション: Search with Grep, confirm with Read, then Edit
信頼度: ███████░░░ 70%
ソース: session-observation

---
合計: 9 instincts（4個人、5継承）
オブザーバー: 実行中（最終分析：5分前）
```

## フラグ

- `--domain <name>`: ドメインでフィルタリング（code-style、testing、gitなど）
- `--low-confidence`: 信頼度 < 0.5のinstinctsのみを表示
- `--high-confidence`: 信頼度 >= 0.7のinstinctsのみを表示
- `--source <type>`: ソースでフィルタリング（session-observation、repo-analysis、inherited）
- `--json`: プログラム使用のためにJSON形式で出力
