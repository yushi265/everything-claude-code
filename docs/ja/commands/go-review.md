---
description: 慣用的なパターン、並行処理の安全性、エラー処理、セキュリティのための包括的なGoコードレビュー。go-reviewerエージェントを呼び出します。
---

# Goコードレビュー

このコマンドは**go-reviewer**エージェントを呼び出し、Go固有の包括的なコードレビューを実行します。

## このコマンドができること

1. **Goの変更を特定**：`git diff`で変更された`.go`ファイルを検出
2. **静的解析の実行**：`go vet`、`staticcheck`、`golangci-lint`を実行
3. **セキュリティスキャン**：SQLインジェクション、コマンドインジェクション、競合状態をチェック
4. **並行処理レビュー**：goroutineの安全性、チャネル使用、mutexパターンを分析
5. **慣用的なGoチェック**：コードがGoの規約とベストプラクティスに従っているか検証
6. **レポート生成**：重要度別に問題を分類

## 使用タイミング

以下の場合に`/go-review`を使用：
- Goコードを書いたまたは変更した後
- Goの変更をコミットする前
- Goコードを含むプルリクエストのレビュー時
- 新しいGoコードベースへのオンボーディング時
- 慣用的なGoパターンを学習する時

## レビューカテゴリー

### CRITICAL（必ず修正）
- SQL/コマンドインジェクションの脆弱性
- 同期化なしの競合状態
- Goroutineリーク
- ハードコードされた認証情報
- 安全でないポインタ使用
- 重要なパスでのエラー無視

### HIGH（修正すべき）
- コンテキストを伴うエラーラッピングの欠如
- エラー返却の代わりのpanic
- Contextが伝播されていない
- デッドロックを引き起こすバッファなしチャネル
- Interface満たさないエラー
- Mutex保護の欠如

### MEDIUM（検討すべき）
- 慣用的でないコードパターン
- エクスポートへのgodocコメントの欠如
- 非効率な文字列連結
- スライスの事前割り当てなし
- テーブル駆動テストが使用されていない

## 実行される自動チェック

```bash
# 静的解析
go vet ./...

# 高度なチェック（インストール済みの場合）
staticcheck ./...
golangci-lint run

# 競合検出
go build -race ./...

# セキュリティ脆弱性
govulncheck ./...
```

## 使用例

```text
ユーザー: /go-review

エージェント:
# Goコードレビューレポート

## レビューされたファイル
- internal/handler/user.go（変更済み）
- internal/service/auth.go（変更済み）

## 静的解析結果
✓ go vet: 問題なし
✓ staticcheck: 問題なし

## 検出された問題

[CRITICAL] 競合状態
ファイル: internal/service/auth.go:45
問題: 同期化なしで共有マップにアクセス
```go
var cache = map[string]*Session{}  // 並行アクセス！

func GetSession(id string) *Session {
    return cache[id]  // 競合状態
}
```
修正: sync.RWMutexまたはsync.Mapを使用
```go
var (
    cache   = map[string]*Session{}
    cacheMu sync.RWMutex
)

func GetSession(id string) *Session {
    cacheMu.RLock()
    defer cacheMu.RUnlock()
    return cache[id]
}
```

[HIGH] エラーコンテキストの欠如
ファイル: internal/handler/user.go:28
問題: コンテキストなしでエラーを返却
```go
return err  // コンテキストなし
```
修正: コンテキストでラップ
```go
return fmt.Errorf("get user %s: %w", userID, err)
```

## サマリー
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

推奨事項: ❌ CRITICAL問題が修正されるまでマージをブロック
```

## 承認基準

| ステータス | 条件 |
|--------|-----------|
| ✅ 承認 | CRITICALまたはHIGH問題なし |
| ⚠️ 警告 | MEDIUM問題のみ（注意してマージ） |
| ❌ ブロック | CRITICALまたはHIGH問題を検出 |

## 他のコマンドとの統合

- まず`/go-test`でテストが合格することを確認
- ビルドエラーが発生した場合は`/go-build`を使用
- コミット前に`/go-review`を使用
- Go固有でない懸念事項には`/code-review`を使用

## 関連

- エージェント: `agents/go-reviewer.md`
- スキル: `skills/golang-patterns/`、`skills/golang-testing/`
