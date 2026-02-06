# Orchestrateコマンド

複雑なタスクのための連続的なエージェントワークフロー。

## 使用方法

`/orchestrate [workflow-type] [task-description]`

## ワークフロータイプ

### feature
完全な機能実装ワークフロー：
```
planner -> tdd-guide -> code-reviewer -> security-reviewer
```

### bugfix
バグ調査と修正ワークフロー：
```
explorer -> tdd-guide -> code-reviewer
```

### refactor
安全なリファクタリングワークフロー：
```
architect -> code-reviewer -> tdd-guide
```

### security
セキュリティ重視のレビュー：
```
security-reviewer -> code-reviewer -> architect
```

## 実行パターン

ワークフロー内の各エージェントに対して：

1. **エージェントを呼び出し**、前のエージェントからのコンテキストを渡す
2. **出力を収集**、構造化された引き継ぎドキュメントとして
3. **次のエージェントに渡す**、チェーン内で
4. **結果を集約**、最終レポートに

## 引き継ぎドキュメント形式

エージェント間で、引き継ぎドキュメントを作成：

```markdown
## HANDOFF: [previous-agent] -> [next-agent]

### コンテキスト
[実行された内容の要約]

### 発見事項
[主要な発見または決定]

### 変更されたファイル
[触れたファイルのリスト]

### 未解決の質問
[次のエージェント向けの未解決項目]

### 推奨事項
[推奨される次のステップ]
```

## 例：機能ワークフロー

```
/orchestrate feature "ユーザー認証を追加"
```

実行内容：

1. **Plannerエージェント**
   - 要件を分析
   - 実装計画を作成
   - 依存関係を特定
   - 出力：`HANDOFF: planner -> tdd-guide`

2. **TDD Guideエージェント**
   - plannerの引き継ぎを読み取り
   - まずテストを記述
   - テストを合格させるように実装
   - 出力：`HANDOFF: tdd-guide -> code-reviewer`

3. **Code Reviewerエージェント**
   - 実装をレビュー
   - 問題をチェック
   - 改善を提案
   - 出力：`HANDOFF: code-reviewer -> security-reviewer`

4. **Security Reviewerエージェント**
   - セキュリティ監査
   - 脆弱性チェック
   - 最終承認
   - 出力：最終レポート

## 最終レポート形式

```
オーケストレーションレポート
====================
ワークフロー: feature
タスク: ユーザー認証を追加
エージェント: planner -> tdd-guide -> code-reviewer -> security-reviewer

サマリー
-------
[1段落の要約]

エージェント出力
-------------
Planner: [要約]
TDD Guide: [要約]
Code Reviewer: [要約]
Security Reviewer: [要約]

変更されたファイル
-------------
[変更されたすべてのファイルのリスト]

テスト結果
------------
[テスト合格/失敗の要約]

セキュリティステータス
---------------
[セキュリティの発見事項]

推奨事項
--------------
[SHIP / 作業が必要 / ブロック中]
```

## 並列実行

独立したチェックの場合、エージェントを並列実行：

```markdown
### 並列フェーズ
同時に実行：
- code-reviewer（品質）
- security-reviewer（セキュリティ）
- architect（設計）

### 結果をマージ
出力を単一のレポートに結合
```

## 引数

$ARGUMENTS:
- `feature <description>` - 完全な機能ワークフロー
- `bugfix <description>` - バグ修正ワークフロー
- `refactor <description>` - リファクタリングワークフロー
- `security <description>` - セキュリティレビューワークフロー
- `custom <agents> <description>` - カスタムエージェントシーケンス

## カスタムワークフローの例

```
/orchestrate custom "architect,tdd-guide,code-reviewer" "キャッシュレイヤーを再設計"
```

## ヒント

1. **複雑な機能にはplannerから開始**
2. **マージ前に必ずcode-reviewerを含める**
3. **認証/支払い/PIIにはsecurity-reviewerを使用**
4. **引き継ぎは簡潔に** - 次のエージェントが必要なものに焦点を当てる
5. **必要に応じてエージェント間で検証を実行**
