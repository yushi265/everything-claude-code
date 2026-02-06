---
name: evolve
description: 関連するinstinctsをスキル、コマンド、エージェントにクラスタリングします
command: true
---

# Evolveコマンド

## 実装

プラグインのルートパスを使用してinstinct CLIを実行：

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" evolve [--generate]
```

または`CLAUDE_PLUGIN_ROOT`が設定されていない場合（手動インストール）：

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py evolve [--generate]
```

instinctsを分析し、関連するものをより高レベルの構造にクラスタリング：
- **コマンド**：instinctsがユーザー起動のアクションを記述している場合
- **スキル**：instinctsが自動トリガーの動作を記述している場合
- **エージェント**：instinctsが複雑な複数ステップのプロセスを記述している場合

## 使用方法

```
/evolve                    # すべてのinstinctsを分析して進化を提案
/evolve --domain testing   # testingドメインのinstinctsのみを進化
/evolve --dry-run          # 作成せずに何が作成されるかを表示
/evolve --threshold 5      # クラスタリングに5以上の関連instinctsが必要
```

## 進化のルール

### → コマンド（ユーザー起動）
instinctsがユーザーが明示的に要求するアクションを記述している場合：
- 「ユーザーが...を求めたとき」についての複数のinstincts
- 「新しいXを作成するとき」のようなトリガーを持つinstincts
- 繰り返し可能なシーケンスに従うinstincts

例：
- `new-table-step1`: "データベーステーブルを追加するとき、マイグレーションを作成"
- `new-table-step2`: "データベーステーブルを追加するとき、スキーマを更新"
- `new-table-step3`: "データベーステーブルを追加するとき、型を再生成"

→ 作成: `/new-table`コマンド

### → スキル（自動トリガー）
instinctsが自動的に発生すべき動作を記述している場合：
- パターンマッチングトリガー
- エラー処理レスポンス
- コードスタイルの強制

例：
- `prefer-functional`: "関数を書くとき、関数型スタイルを優先"
- `use-immutable`: "状態を変更するとき、イミュータブルパターンを使用"
- `avoid-classes`: "モジュールを設計するとき、クラスベースの設計を避ける"

→ 作成: `functional-patterns`スキル

### → エージェント（深さ/分離が必要）
instinctsが分離の恩恵を受ける複雑な複数ステップのプロセスを記述している場合：
- デバッグワークフロー
- リファクタリングシーケンス
- リサーチタスク

例：
- `debug-step1`: "デバッグ時、まずログを確認"
- `debug-step2`: "デバッグ時、失敗しているコンポーネントを分離"
- `debug-step3`: "デバッグ時、最小限の再現を作成"
- `debug-step4`: "デバッグ時、テストで修正を検証"

→ 作成: `debugger`エージェント

## 実行内容

1. `~/.claude/homunculus/instincts/`からすべてのinstinctsを読み取り
2. 以下でinstinctsをグループ化：
   - ドメインの類似性
   - トリガーパターンの重複
   - アクションシーケンスの関係
3. 3以上の関連instinctsの各クラスターについて：
   - 進化タイプを決定（command/skill/agent）
   - 適切なファイルを生成
   - `~/.claude/homunculus/evolved/{commands,skills,agents}/`に保存
4. 進化した構造をソースinstinctsにリンク

## 出力形式

```
🧬 進化分析
==================

進化準備完了の3つのクラスターを検出：

## クラスター1：データベースマイグレーションワークフロー
Instincts: new-table-migration, update-schema, regenerate-types
タイプ: コマンド
信頼度: 85%（12の観測に基づく）

作成予定: /new-tableコマンド
ファイル:
  - ~/.claude/homunculus/evolved/commands/new-table.md

## クラスター2：関数型コードスタイル
Instincts: prefer-functional, use-immutable, avoid-classes, pure-functions
タイプ: スキル
信頼度: 78%（8の観測に基づく）

作成予定: functional-patternsスキル
ファイル:
  - ~/.claude/homunculus/evolved/skills/functional-patterns.md

## クラスター3：デバッグプロセス
Instincts: debug-check-logs, debug-isolate, debug-reproduce, debug-verify
タイプ: エージェント
信頼度: 72%（6の観測に基づく）

作成予定: debuggerエージェント
ファイル:
  - ~/.claude/homunculus/evolved/agents/debugger.md

---
これらのファイルを作成するには`/evolve --execute`を実行してください。
```

## フラグ

- `--execute`: 進化した構造を実際に作成（デフォルトはプレビュー）
- `--dry-run`: 作成せずにプレビュー
- `--domain <name>`: 指定されたドメインのinstinctsのみを進化
- `--threshold <n>`: クラスターを形成するために必要な最小instincts数（デフォルト：3）
- `--type <command|skill|agent>`: 指定されたタイプのみを作成

## 生成されるファイル形式

### コマンド
```markdown
---
name: new-table
description: マイグレーション、スキーマ更新、型生成を伴う新しいデータベーステーブルを作成
command: /new-table
evolved_from:
  - new-table-migration
  - update-schema
  - regenerate-types
---

# New Tableコマンド

[クラスタリングされたinstinctsに基づいて生成されたコンテンツ]

## ステップ
1. ...
2. ...
```

### スキル
```markdown
---
name: functional-patterns
description: 関数型プログラミングパターンを強制
evolved_from:
  - prefer-functional
  - use-immutable
  - avoid-classes
---

# Functional Patternsスキル

[クラスタリングされたinstinctsに基づいて生成されたコンテンツ]
```

### エージェント
```markdown
---
name: debugger
description: 体系的なデバッグエージェント
model: sonnet
evolved_from:
  - debug-check-logs
  - debug-isolate
  - debug-reproduce
---

# Debuggerエージェント

[クラスタリングされたinstinctsに基づいて生成されたコンテンツ]
```
