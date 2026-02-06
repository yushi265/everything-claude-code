---
description: Goで TDD ワークフローを強制します。テーブル駆動テストを先に書き、その後実装します。go test -cover で 80%+ のカバレッジを検証します。
---

# Go TDD コマンド

このコマンドは、Go の慣用的なテストパターンを使用してテスト駆動開発の方法論を強制します。

## このコマンドの機能

1. **型/インターフェースの定義**: 最初に関数シグネチャをスキャフォールド
2. **テーブル駆動テストを記述**: 包括的なテストケースを作成（RED）
3. **テストを実行**: 正しい理由でテストが失敗することを確認
4. **コードを実装**: 通過するための最小限のコードを記述（GREEN）
5. **リファクタリング**: テストをグリーンに保ちながら改善
6. **カバレッジチェック**: 80%+ のカバレッジを確保

## いつ使うか

次の場合に `/go-test` を使用します：
- 新しい Go 関数を実装する場合
- 既存のコードにテストカバレッジを追加する場合
- バグを修正する場合（最初に失敗するテストを書く）
- 重要なビジネスロジックを構築する場合
- Go で TDD ワークフローを学ぶ場合

## TDD サイクル

```
RED     → 失敗するテーブル駆動テストを書く
GREEN   → 通過するための最小限のコードを実装
REFACTOR → コードを改善、テストはグリーンのまま
REPEAT  → 次のテストケース
```

## セッションの例

````
User: /go-test メールアドレスを検証する関数が必要です

Agent:
# TDD セッション: メール検証器

## ステップ 1: インターフェースの定義

```go
// validator/email.go
package validator

// ValidateEmail は指定された文字列が有効なメールアドレスかどうかをチェックします。
// 有効な場合は nil、そうでない場合は問題を説明するエラーを返します。
func ValidateEmail(email string) error {
    panic("not implemented")
}
```

## ステップ 2: テーブル駆動テストを記述（RED）

```go
// validator/email_test.go
package validator

import (
    "testing"
)

func TestValidateEmail(t *testing.T) {
    tests := []struct {
        name    string
        email   string
        wantErr bool
    }{
        // 有効なメール
        {"simple email", "user@example.com", false},
        {"with subdomain", "user@mail.example.com", false},
        {"with plus", "user+tag@example.com", false},
        {"with dots", "first.last@example.com", false},

        // 無効なメール
        {"empty string", "", true},
        {"no at sign", "userexample.com", true},
        {"no domain", "user@", true},
        {"no local part", "@example.com", true},
        {"double at", "user@@example.com", true},
        {"spaces", "user @example.com", true},
        {"no tld", "user@example", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateEmail(tt.email)
            if tt.wantErr && err == nil {
                t.Errorf("ValidateEmail(%q) = nil; want error", tt.email)
            }
            if !tt.wantErr && err != nil {
                t.Errorf("ValidateEmail(%q) = %v; want nil", tt.email, err)
            }
        })
    }
}
```

## ステップ 3: テストを実行 - FAIL を確認

```bash
$ go test ./validator/...

--- FAIL: TestValidateEmail (0.00s)
    --- FAIL: TestValidateEmail/simple_email (0.00s)
        panic: not implemented

FAIL
```

✓ 期待通りにテストが失敗（panic）。

## ステップ 4: 最小限のコードを実装（GREEN）

```go
// validator/email.go
package validator

import (
    "errors"
    "regexp"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

var (
    ErrEmailEmpty   = errors.New("email cannot be empty")
    ErrEmailInvalid = errors.New("email format is invalid")
)

func ValidateEmail(email string) error {
    if email == "" {
        return ErrEmailEmpty
    }
    if !emailRegex.MatchString(email) {
        return ErrEmailInvalid
    }
    return nil
}
```

## ステップ 5: テストを実行 - PASS を確認

```bash
$ go test ./validator/...

PASS
ok      project/validator    0.003s
```

✓ すべてのテストが通過！

## ステップ 6: カバレッジをチェック

```bash
$ go test -cover ./validator/...

PASS
coverage: 100.0% of statements
ok      project/validator    0.003s
```

✓ カバレッジ: 100%

## TDD 完了！
````

## テストパターン

### テーブル駆動テスト
```go
tests := []struct {
    name     string
    input    InputType
    want     OutputType
    wantErr  bool
}{
    {"case 1", input1, want1, false},
    {"case 2", input2, want2, true},
}

for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        got, err := Function(tt.input)
        // assertions
    })
}
```

### 並列テスト
```go
for _, tt := range tests {
    tt := tt // Capture
    t.Run(tt.name, func(t *testing.T) {
        t.Parallel()
        // test body
    })
}
```

### テストヘルパー
```go
func setupTestDB(t *testing.T) *sql.DB {
    t.Helper()
    db := createDB()
    t.Cleanup(func() { db.Close() })
    return db
}
```

## カバレッジコマンド

```bash
# 基本カバレッジ
go test -cover ./...

# カバレッジプロファイル
go test -coverprofile=coverage.out ./...

# ブラウザで表示
go tool cover -html=coverage.out

# 関数別カバレッジ
go tool cover -func=coverage.out

# レース検出付き
go test -race -cover ./...
```

## カバレッジ目標

| コードタイプ | 目標 |
|-----------|--------|
| 重要なビジネスロジック | 100% |
| パブリック API | 90%+ |
| 一般的なコード | 80%+ |
| 生成されたコード | 除外 |

## TDD ベストプラクティス

**すべきこと:**
- 実装の前にテストを最初に書く
- 各変更後にテストを実行
- 包括的なカバレッジのためにテーブル駆動テストを使用
- 実装の詳細ではなく、振る舞いをテスト
- エッジケースを含める（空、nil、最大値）

**してはいけないこと:**
- テストの前に実装を書く
- RED フェーズをスキップ
- private 関数を直接テスト
- テストで `time.Sleep` を使用
- フレーキーなテストを無視

## 関連コマンド

- `/go-build` - ビルドエラーを修正
- `/go-review` - 実装後にコードをレビュー
- `/verify` - 完全な検証ループを実行

## 関連情報

- スキル: `skills/golang-testing/`
- スキル: `skills/tdd-workflow/`
