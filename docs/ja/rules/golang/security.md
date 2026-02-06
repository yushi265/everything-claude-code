# Goセキュリティ

> このファイルは [common/security.md](../common/security.md) をGo固有のコンテンツで拡張します。

## 秘密情報管理

```go
apiKey := os.Getenv("OPENAI_API_KEY")
if apiKey == "" {
    log.Fatal("OPENAI_API_KEY not configured")
}
```

## セキュリティスキャン

- 静的セキュリティ分析には **gosec** を使用：
  ```bash
  gosec ./...
  ```

## コンテキストとタイムアウト

タイムアウト制御には常に `context.Context` を使用します：

```go
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
```
