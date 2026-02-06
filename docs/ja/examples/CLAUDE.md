# プロジェクトレベル CLAUDE.md の例

これはプロジェクトレベルの CLAUDE.md ファイルの例です。プロジェクトルートに配置してください。

## プロジェクト概要

[プロジェクトの簡単な説明 - 何をするか、技術スタック]

## 重要なルール

### 1. コード組織

- 少数の大きなファイルよりも多数の小さなファイル
- 高凝集、低結合
- 通常 200-400 行、最大 800 行/ファイル
- タイプ別ではなく、機能/ドメイン別に整理

### 2. コードスタイル

- コード、コメント、ドキュメントに絵文字を使用しない
- 常に不変性 - オブジェクトや配列を変更しない
- 本番コードに console.log を使用しない
- try/catch で適切なエラーハンドリング
- Zod などで入力バリデーション

### 3. テスト

- TDD: テストを先に書く
- 最低 80% のカバレッジ
- ユーティリティのユニットテスト
- API のインテグレーションテスト
- 重要なフローの E2E テスト

### 4. セキュリティ

- シークレットをハードコードしない
- 機密データは環境変数で管理
- すべてのユーザー入力を検証
- パラメータ化されたクエリのみ使用
- CSRF 保護を有効化

## ファイル構造

```
src/
|-- app/              # Next.js app router
|-- components/       # Reusable UI components
|-- hooks/            # Custom React hooks
|-- lib/              # Utility libraries
|-- types/            # TypeScript definitions
```

## 主要なパターン

### API レスポンスフォーマット

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

### エラーハンドリング

```typescript
try {
  const result = await operation()
  return { success: true, data: result }
} catch (error) {
  console.error('Operation failed:', error)
  return { success: false, error: 'User-friendly message' }
}
```

## 環境変数

```bash
# Required
DATABASE_URL=
API_KEY=

# Optional
DEBUG=false
```

## 利用可能なコマンド

- `/tdd` - テスト駆動開発ワークフロー
- `/plan` - 実装計画の作成
- `/code-review` - コード品質レビュー
- `/build-fix` - ビルドエラーの修正

## Git ワークフロー

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- main に直接コミットしない
- PR にはレビューが必要
- マージ前にすべてのテストが通過する必要がある
