---
name: security-review
description: 認証追加、ユーザー入力処理、シークレット操作、APIエンドポイント作成、支払い/機密機能実装時に使用。包括的なセキュリティチェックリストとパターンを提供。
---

# セキュリティレビュースキル

このスキルは、すべてのコードがセキュリティベストプラクティスに従い、潜在的な脆弱性を特定することを保証します。

## 有効化タイミング

- 認証または認可の実装
- ユーザー入力またはファイルアップロードの処理
- 新しいAPIエンドポイントの作成
- シークレットまたは認証情報の操作
- 支払い機能の実装
- 機密データの保存または送信
- サードパーティAPIの統合

## セキュリティチェックリスト

### 1. シークレット管理

#### ❌ 絶対にしてはいけないこと
```typescript
const apiKey = "sk-proj-xxxxx"  // ハードコードされたシークレット
const dbPassword = "password123" // ソースコード内
```

#### ✅ 常に行うこと
```typescript
const apiKey = process.env.OPENAI_API_KEY
const dbUrl = process.env.DATABASE_URL

// シークレットの存在を確認
if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

#### 検証ステップ
- [ ] ハードコードされたAPIキー、トークン、パスワードなし
- [ ] すべてのシークレットを環境変数に
- [ ] `.env.local`を.gitignoreに
- [ ] gitヒストリにシークレットなし
- [ ] 本番シークレットはホスティングプラットフォームに（Vercel、Railway）

### 2. 入力バリデーション

#### 常にユーザー入力を検証

```typescript
import { z } from 'zod'

// バリデーションスキーマを定義
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
})

// 処理前に検証
export async function createUser(input: unknown) {
  try {
    const validated = CreateUserSchema.parse(input)
    return await db.users.create(validated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors }
    }
    throw error
  }
}
```

#### ファイルアップロードバリデーション
```typescript
function validateFileUpload(file: File) {
  // サイズチェック（最大5MB）
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large (max 5MB)')
  }

  // タイプチェック
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }

  // 拡張子チェック
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new Error('Invalid file extension')
  }

  return true
}
```

#### 検証ステップ
- [ ] すべてのユーザー入力をスキーマで検証
- [ ] ファイルアップロードを制限（サイズ、タイプ、拡張子）
- [ ] クエリでユーザー入力を直接使用しない
- [ ] ホワイトリスト検証（ブラックリストでない）
- [ ] エラーメッセージで機密情報を漏らさない

### 3. SQLインジェクション防止

#### ❌ 絶対にSQLを連結しない
```typescript
// 危険 - SQLインジェクション脆弱性
const query = `SELECT * FROM users WHERE email = '${userEmail}'`
await db.query(query)
```

#### ✅ 常にパラメータ化クエリを使用
```typescript
// 安全 - パラメータ化クエリ
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail)

// または生SQLで
await db.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
)
```

#### 検証ステップ
- [ ] すべてのデータベースクエリがパラメータ化クエリを使用
- [ ] SQLに文字列連結なし
- [ ] ORM/クエリビルダーを正しく使用
- [ ] Supabaseクエリが適切にサニタイズされている

### 4. 認証と認可

#### JWTトークン処理
```typescript
// ❌ 誤り: localStorage（XSSに脆弱）
localStorage.setItem('token', token)

// ✅ 正解: httpOnlyクッキー
res.setHeader('Set-Cookie',
  `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
```

#### 認可チェック
```typescript
export async function deleteUser(userId: string, requesterId: string) {
  // 常に最初に認可を検証
  const requester = await db.users.findUnique({
    where: { id: requesterId }
  })

  if (requester.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  // 削除を続行
  await db.users.delete({ where: { id: userId } })
}
```

#### Row Level Security (Supabase)
```sql
-- すべてのテーブルでRLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみ表示可能
CREATE POLICY "Users view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- ユーザーは自分のデータのみ更新可能
CREATE POLICY "Users update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

#### 検証ステップ
- [ ] トークンをhttpOnlyクッキーに保存（localStorageでない）
- [ ] 機密操作前の認可チェック
- [ ] SupabaseでRow Level Securityを有効化
- [ ] ロールベースアクセス制御を実装
- [ ] セッション管理が安全

### 5. XSS防止

#### HTMLをサニタイズ
```typescript
import DOMPurify from 'isomorphic-dompurify'

// 常にユーザー提供のHTMLをサニタイズ
function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

#### Content Security Policy
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://api.example.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

#### 検証ステップ
- [ ] ユーザー提供のHTMLをサニタイズ
- [ ] CSPヘッダーを設定
- [ ] 未検証の動的コンテンツレンダリングなし
- [ ] Reactの組み込みXSS保護を使用

### 6. CSRF保護

#### CSRFトークン
```typescript
import { csrf } from '@/lib/csrf'

export async function POST(request: Request) {
  const token = request.headers.get('X-CSRF-Token')

  if (!csrf.verify(token)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  // リクエストを処理
}
```

#### SameSiteクッキー
```typescript
res.setHeader('Set-Cookie',
  `session=${sessionId}; HttpOnly; Secure; SameSite=Strict`)
```

#### 検証ステップ
- [ ] 状態変更操作でCSRFトークン
- [ ] すべてのクッキーでSameSite=Strict
- [ ] ダブルサブミットクッキーパターンを実装

### 7. レート制限

#### APIレート制限
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // ウィンドウあたり100リクエスト
  message: 'Too many requests'
})

// ルートに適用
app.use('/api/', limiter)
```

#### 高コスト操作
```typescript
// 検索の積極的なレート制限
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分
  max: 10, // 1分あたり10リクエスト
  message: 'Too many search requests'
})

app.use('/api/search', searchLimiter)
```

#### 検証ステップ
- [ ] すべてのAPIエンドポイントでレート制限
- [ ] 高コスト操作でより厳しい制限
- [ ] IPベースのレート制限
- [ ] ユーザーベースのレート制限（認証済み）

### 8. 機密データ露出

#### ログ記録
```typescript
// ❌ 誤り: 機密データのログ記録
console.log('User login:', { email, password })
console.log('Payment:', { cardNumber, cvv })

// ✅ 正解: 機密データを編集
console.log('User login:', { email, userId })
console.log('Payment:', { last4: card.last4, userId })
```

#### エラーメッセージ
```typescript
// ❌ 誤り: 内部詳細を露出
catch (error) {
  return NextResponse.json(
    { error: error.message, stack: error.stack },
    { status: 500 }
  )
}

// ✅ 正解: 一般的なエラーメッセージ
catch (error) {
  console.error('Internal error:', error)
  return NextResponse.json(
    { error: 'An error occurred. Please try again.' },
    { status: 500 }
  )
}
```

#### 検証ステップ
- [ ] ログにパスワード、トークン、シークレットなし
- [ ] ユーザー向けエラーメッセージは一般的
- [ ] 詳細なエラーはサーバーログのみ
- [ ] ユーザーにスタックトレースを露出しない

### 9. 依存関係セキュリティ

#### 定期的な更新
```bash
# 脆弱性をチェック
npm audit

# 自動修正可能な問題を修正
npm audit fix

# 依存関係を更新
npm update

# 古いパッケージをチェック
npm outdated
```

#### ロックファイル
```bash
# 常にロックファイルをコミット
git add package-lock.json

# 再現可能なビルドのためにCI/CDで使用
npm ci  # npm installの代わりに
```

#### 検証ステップ
- [ ] 依存関係が最新
- [ ] 既知の脆弱性なし（npm audit clean）
- [ ] ロックファイルをコミット
- [ ] GitHubでDependabotを有効化
- [ ] 定期的なセキュリティ更新

## デプロイ前セキュリティチェックリスト

本番デプロイ前に必ず:

- [ ] **シークレット**: ハードコードされたシークレットなし、すべて環境変数に
- [ ] **入力バリデーション**: すべてのユーザー入力を検証
- [ ] **SQLインジェクション**: すべてのクエリをパラメータ化
- [ ] **XSS**: ユーザーコンテンツをサニタイズ
- [ ] **CSRF**: 保護を有効化
- [ ] **認証**: 適切なトークン処理
- [ ] **認可**: ロールチェックを実施
- [ ] **レート制限**: すべてのエンドポイントで有効化
- [ ] **HTTPS**: 本番環境で強制
- [ ] **セキュリティヘッダー**: CSP、X-Frame-Optionsを設定
- [ ] **エラーハンドリング**: エラーに機密データなし
- [ ] **ログ記録**: ログに機密データなし
- [ ] **依存関係**: 最新、脆弱性なし
- [ ] **Row Level Security**: Supabaseで有効化
- [ ] **CORS**: 適切に設定
- [ ] **ファイルアップロード**: 検証済み（サイズ、タイプ）

## リソース

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/security)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [Web Security Academy](https://portswigger.net/web-security)

---

**覚えておくこと**: セキュリティはオプションではありません。1つの脆弱性がプラットフォーム全体を危険にさらす可能性があります。疑わしい場合は、慎重に行動してください。
