# TypeScript/JavaScriptコーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) をTypeScript/JavaScript固有のコンテンツで拡張します。

## 不変性

不変な更新にはスプレッド演算子を使用します：

```typescript
// 間違い：ミューテーション
function updateUser(user, name) {
  user.name = name  // ミューテーション！
  return user
}

// 正しい：不変性
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

## エラーハンドリング

try-catch付きでasync/awaitを使用します：

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('Detailed user-friendly message')
}
```

## 入力検証

スキーマベースの検証にはZodを使用します：

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

## Console.log

- 本番コードに `console.log` ステートメントを含めない
- 代わりに適切なロギングライブラリを使用
- 自動検出についてはフックを参照
