---
name: backend-patterns
description: Node.js、Express、Next.js API routesのためのバックエンドアーキテクチャパターン、API設計、データベース最適化、サーバーサイドベストプラクティス
---

# バックエンド開発パターン

スケーラブルなサーバーサイドアプリケーションのためのバックエンドアーキテクチャパターンとベストプラクティスです。

## API設計パターン

### RESTful API構造

```typescript
// ✅ リソースベースのURL
GET    /api/markets                 # リソースの一覧取得
GET    /api/markets/:id             # 単一リソースの取得
POST   /api/markets                 # リソースの作成
PUT    /api/markets/:id             # リソースの置換
PATCH  /api/markets/:id             # リソースの更新
DELETE /api/markets/:id             # リソースの削除

// ✅ フィルタリング、ソート、ページネーションにはクエリパラメータを使用
GET /api/markets?status=active&sort=volume&limit=20&offset=0
```

**覚えておきましょう**：バックエンドパターンは、スケーラブルで保守可能なサーバーサイドアプリケーションを可能にします。複雑さのレベルに合ったパターンを選択してください。
