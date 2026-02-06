---
name: instinct-import
description: チームメイト、Skill Creator、その他のソースからinstinctsをインポート
command: true
---

# Instinct Importコマンド

## 実装

プラグインのルートパスを使用してinstinct CLIを実行：

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" import <file-or-url> [--dry-run] [--force] [--min-confidence 0.7]
```

または`CLAUDE_PLUGIN_ROOT`が設定されていない場合（手動インストール）：

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py import <file-or-url>
```

以下からinstinctsをインポート：
- チームメイトのエクスポート
- Skill Creator（リポジトリ分析）
- コミュニティコレクション
- 以前のマシンのバックアップ

## 使用方法

```
/instinct-import team-instincts.yaml
/instinct-import https://github.com/org/repo/instincts.yaml
/instinct-import --from-skill-creator acme/webapp
```

## 実行内容

1. instinctファイルを取得（ローカルパスまたはURL）
2. 形式を解析して検証
3. 既存のinstinctsとの重複をチェック
4. 新しいinstinctsをマージまたは追加
5. `~/.claude/homunculus/instincts/inherited/`に保存

## インポートプロセス

```
📥 instinctsをインポート中: team-instincts.yaml
================================================

12のinstinctsがインポート対象として見つかりました。

競合を分析中...

## 新しいInstincts（8）
以下が追加されます：
  ✓ use-zod-validation（信頼度：0.7）
  ✓ prefer-named-exports（信頼度：0.65）
  ✓ test-async-functions（信頼度：0.8）
  ...

## 重複するInstincts（3）
すでに類似のinstinctsがあります：
  ⚠️ prefer-functional-style
     ローカル：0.8信頼度、12観測
     インポート：0.7信頼度
     → ローカルを保持（信頼度が高い）

  ⚠️ test-first-workflow
     ローカル：0.75信頼度
     インポート：0.9信頼度
     → インポートに更新（信頼度が高い）

## 競合するInstincts（1）
以下はローカルのinstinctsと矛盾します：
  ❌ use-classes-for-services
     競合先：avoid-classes
     → スキップ（手動解決が必要）

---
8を新規インポート、1を更新、3をスキップしますか？
```

## マージ戦略

### 重複の場合
既存のものと一致するinstinctをインポートする場合：
- **信頼度が高い方を採用**：信頼度の高い方を保持
- **証拠をマージ**：観測数を結合
- **タイムスタンプを更新**：最近検証されたものとしてマーク

### 競合の場合
既存のものと矛盾するinstinctをインポートする場合：
- **デフォルトでスキップ**：競合するinstinctsはインポートしない
- **レビュー用にフラグ**：両方を要注意としてマーク
- **手動解決**：ユーザーがどちらを保持するか決定

## ソース追跡

インポートされたinstinctsは以下でマーク：
```yaml
source: "inherited"
imported_from: "team-instincts.yaml"
imported_at: "2025-01-22T10:30:00Z"
original_source: "session-observation"  # または"repo-analysis"
```

## Skill Creator統合

Skill Creatorからインポートする場合：

```
/instinct-import --from-skill-creator acme/webapp
```

これはリポジトリ分析から生成されたinstinctsを取得：
- ソース：`repo-analysis`
- 初期信頼度が高い（0.7以上）
- ソースリポジトリにリンク

## フラグ

- `--dry-run`: インポートせずにプレビュー
- `--force`: 競合があってもインポート
- `--merge-strategy <higher|local|import>`: 重複の処理方法
- `--from-skill-creator <owner/repo>`: Skill Creator分析からインポート
- `--min-confidence <n>`: 閾値を超えるinstinctsのみをインポート

## 出力

インポート後：
```
✅ インポート完了！

追加：8 instincts
更新：1 instinct
スキップ：3 instincts（2重複、1競合）

新しいinstinctsの保存先：~/.claude/homunculus/instincts/inherited/

すべてのinstinctsを表示するには/instinct-statusを実行してください。
```
