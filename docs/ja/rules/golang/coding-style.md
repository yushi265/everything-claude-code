# Goコーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) をGo固有のコンテンツで拡張します。

## フォーマット

- **gofmt** と **goimports** は必須 — スタイル論争は不要

## 設計原則

- インターフェースを受け取り、構造体を返す
- インターフェースは小さく保つ（1〜3メソッド）

## エラーハンドリング

常にコンテキスト付きでエラーをラップします：

```go
if err != nil {
    return fmt.Errorf("failed to create user: %w", err)
}
```

## リファレンス

スキルを参照：包括的なGoイディオムとパターンについては `golang-patterns` を参照してください。
