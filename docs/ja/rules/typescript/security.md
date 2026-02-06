# TypeScript/JavaScriptセキュリティ

> このファイルは [common/security.md](../common/security.md) をTypeScript/JavaScript固有のコンテンツで拡張します。

## 秘密情報管理

```typescript
// 決してしない：ハードコードされた秘密情報
const apiKey = "sk-proj-xxxxx"

// 常に：環境変数
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

## エージェントサポート

- 包括的なセキュリティ監査には **security-reviewer** スキルを使用
