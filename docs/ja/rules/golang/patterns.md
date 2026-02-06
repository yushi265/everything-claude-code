# Goパターン

> このファイルは [common/patterns.md](../common/patterns.md) をGo固有のコンテンツで拡張します。

## 関数オプション

```go
type Option func(*Server)

func WithPort(port int) Option {
    return func(s *Server) { s.port = port }
}

func NewServer(opts ...Option) *Server {
    s := &Server{port: 8080}
    for _, opt := range opts {
        opt(s)
    }
    return s
}
```

## 小さなインターフェース

インターフェースは実装される場所ではなく、使用される場所で定義します。

## 依存性注入

コンストラクタ関数を使用して依存関係を注入します：

```go
func NewUserService(repo UserRepository, logger Logger) *UserService {
    return &UserService{repo: repo, logger: logger}
}
```

## リファレンス

スキルを参照：並行性、エラーハンドリング、パッケージ構成を含む包括的なGoパターンについては `golang-patterns` を参照してください。
