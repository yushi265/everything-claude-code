---
name: jpa-patterns
description: Spring Bootにおけるエンティティ設計、リレーションシップ、クエリ最適化、トランザクション、監査、インデックス、ページネーション、プーリングのためのJPA/Hibernateパターン。
---

# JPA/Hibernateパターン

Spring Bootでのデータモデリング、リポジトリ、パフォーマンスチューニングに使用します。

## エンティティ設計

```java
@Entity
@Table(name = "markets", indexes = {
  @Index(name = "idx_markets_slug", columnList = "slug", unique = true)
})
@EntityListeners(AuditingEntityListener.class)
public class MarketEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 200)
  private String name;

  @Column(nullable = false, unique = true, length = 120)
  private String slug;

  @Enumerated(EnumType.STRING)
  private MarketStatus status = MarketStatus.ACTIVE;

  @CreatedDate private Instant createdAt;
  @LastModifiedDate private Instant updatedAt;
}
```

監査を有効化:
```java
@Configuration
@EnableJpaAuditing
class JpaConfig {}
```

## リレーションシップとN+1問題の防止

```java
@OneToMany(mappedBy = "market", cascade = CascadeType.ALL, orphanRemoval = true)
private List<PositionEntity> positions = new ArrayList<>();
```

- デフォルトはlazy loading; 必要に応じてクエリで`JOIN FETCH`を使用
- コレクションに`EAGER`を使用しない; 読み取りパスにはDTOプロジェクションを使用

```java
@Query("select m from MarketEntity m left join fetch m.positions where m.id = :id")
Optional<MarketEntity> findWithPositions(@Param("id") Long id);
```

## リポジトリパターン

```java
public interface MarketRepository extends JpaRepository<MarketEntity, Long> {
  Optional<MarketEntity> findBySlug(String slug);

  @Query("select m from MarketEntity m where m.status = :status")
  Page<MarketEntity> findByStatus(@Param("status") MarketStatus status, Pageable pageable);
}
```

- 軽量なクエリにはプロジェクションを使用:
```java
public interface MarketSummary {
  Long getId();
  String getName();
  MarketStatus getStatus();
}
Page<MarketSummary> findAllBy(Pageable pageable);
```

## トランザクション

- サービスメソッドに`@Transactional`を付与
- 読み取りパスには`@Transactional(readOnly = true)`を使用して最適化
- 伝播方式を慎重に選択; 長時間実行されるトランザクションを避ける

```java
@Transactional
public Market updateStatus(Long id, MarketStatus status) {
  MarketEntity entity = repo.findById(id)
      .orElseThrow(() -> new EntityNotFoundException("Market"));
  entity.setStatus(status);
  return Market.from(entity);
}
```

## ページネーション

```java
PageRequest page = PageRequest.of(pageNumber, pageSize, Sort.by("createdAt").descending());
Page<MarketEntity> markets = repo.findByStatus(MarketStatus.ACTIVE, page);
```

カーソル的なページネーションには、JPQLで`id > :lastId`を含め、順序付けを行います。

## インデックスとパフォーマンス

- 共通のフィルタ（`status`、`slug`、外部キー）にインデックスを追加
- クエリパターンに合わせた複合インデックスを使用（`status, created_at`）
- `select *`を避ける; 必要なカラムのみをプロジェクション
- `saveAll`と`hibernate.jdbc.batch_size`でバッチ書き込み

## コネクションプーリング (HikariCP)

推奨プロパティ:
```
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.validation-timeout=5000
```

PostgreSQL LOB処理のため、以下を追加:
```
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true
```

## キャッシング

- 1次キャッシュはEntityManagerごと; トランザクション間でエンティティを保持しない
- 読み取りが多いエンティティには2次キャッシュを慎重に検討; 削除戦略を検証

## マイグレーション

- FlywayまたはLiquibaseを使用; 本番環境でHibernate自動DDLに依存しない
- マイグレーションを冪等性があり追加的に保つ; 計画なしにカラムを削除しない

## データアクセステスト

- Testcontainersで`@DataJpaTest`を使用して本番環境をミラー
- ログを使用してSQL効率性をアサート: `logging.level.org.hibernate.SQL=DEBUG`および`logging.level.org.hibernate.orm.jdbc.bind=TRACE`でパラメータ値を確認

**覚えておくこと**: エンティティは軽量に、クエリは意図的に、トランザクションは短く保つ。フェッチ戦略とプロジェクションでN+1を防止し、読み取り/書き込みパスにインデックスを付ける。
