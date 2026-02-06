---
name: springboot-security
description: Java Spring Bootサービスにおける認証/認可、バリデーション、CSRF、シークレット、ヘッダー、レート制限、依存関係セキュリティのためのSpring Securityベストプラクティス。
---

# Spring Bootセキュリティレビュー

認証の追加、入力処理、エンドポイント作成、シークレット処理時に使用。

## 認証

- ステートレスJWTまたは取り消しリスト付きの不透明トークンを優先
- セッションには`httpOnly`、`Secure`、`SameSite=Strict`クッキーを使用
- `OncePerRequestFilter`またはリソースサーバーでトークンを検証

```java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
  private final JwtService jwtService;

  public JwtAuthFilter(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain chain) throws ServletException, IOException {
    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (header != null && header.startsWith("Bearer ")) {
      String token = header.substring(7);
      Authentication auth = jwtService.authenticate(token);
      SecurityContextHolder.getContext().setAuthentication(auth);
    }
    chain.doFilter(request, response);
  }
}
```

## 認可

- メソッドセキュリティを有効化: `@EnableMethodSecurity`
- `@PreAuthorize("hasRole('ADMIN')")`または`@PreAuthorize("@authz.canEdit(#id)")`を使用
- デフォルトで拒否; 必要なスコープのみを公開

## 入力バリデーション

- コントローラーで`@Valid`を使用したBean Validationを使用
- DTOに制約を適用: `@NotBlank`、`@Email`、`@Size`、カスタムバリデーター
- レンダリング前にホワイトリストでHTMLをサニタイズ

## SQLインジェクション防止

- Spring Dataリポジトリまたはパラメータ化クエリを使用
- ネイティブクエリには`:param`バインディングを使用; 文字列を連結しない

## CSRF保護

- ブラウザセッションアプリの場合、CSRFを有効のままにする; フォーム/ヘッダーにトークンを含める
- Bearerトークンを使用する純粋なAPIの場合、CSRFを無効化しステートレス認証に依存

```java
http
  .csrf(csrf -> csrf.disable())
  .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
```

## シークレット管理

- ソースにシークレットなし; envまたはvaultから読み込み
- `application.yml`を認証情報なしに保つ; プレースホルダーを使用
- トークンとDB認証情報を定期的にローテーション

## セキュリティヘッダー

```java
http
  .headers(headers -> headers
    .contentSecurityPolicy(csp -> csp
      .policyDirectives("default-src 'self'"))
    .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
    .xssProtection(Customizer.withDefaults())
    .referrerPolicy(rp -> rp.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER)));
```

## レート制限

- 高コストなエンドポイントにBucket4jまたはゲートウェイレベルの制限を適用
- バーストをログして警告; リトライヒント付きで429を返す

## 依存関係セキュリティ

- CIでOWASP Dependency Check / Snykを実行
- Spring BootとSpring Securityをサポートされているバージョンに保つ
- 既知のCVEでビルドを失敗させる

## ログとPII

- シークレット、トークン、パスワード、完全なPANデータをログしない
- 機密フィールドを編集; 構造化JSONログを使用

## ファイルアップロード

- サイズ、コンテンツタイプ、拡張子を検証
- Webルート外に保存; 必要に応じてスキャン

## リリース前チェックリスト

- [ ] 認証トークンが正しく検証され期限切れになる
- [ ] すべての機密パスに認可ガードがある
- [ ] すべての入力が検証およびサニタイズされている
- [ ] 文字列連結されたSQLがない
- [ ] アプリタイプに対してCSRF態勢が正しい
- [ ] シークレットが外部化されている; コミットされていない
- [ ] セキュリティヘッダーが設定されている
- [ ] APIにレート制限がある
- [ ] 依存関係がスキャンされ最新である
- [ ] ログに機密データがない

**覚えておくこと**: デフォルトで拒否、入力を検証、最小権限、まず設定によるセキュリティ。
