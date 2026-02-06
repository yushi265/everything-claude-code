---
name: python-testing
description: pytest、TDD方法論、フィクスチャ、モック、パラメータ化、カバレッジ要件を使用したPythonテスト戦略。
---

# Pythonテストパターン

pytest、TDD方法論、ベストプラクティスを使用したPythonアプリケーションの包括的なテスト戦略。

## 有効化タイミング

- 新しいPythonコードの作成（TDDに従う: red, green, refactor）
- Pythonプロジェクトのテストスイート設計
- Pythonテストカバレッジのレビュー
- テストインフラの設定

## コアテスト哲学

### テスト駆動開発 (TDD)

常にTDDサイクルに従う:

1. **RED**: 望ましい動作のための失敗するテストを書く
2. **GREEN**: テストを通す最小限のコードを書く
3. **REFACTOR**: テストをグリーンに保ちながらコードを改善

```python
# ステップ1: 失敗するテストを書く（RED）
def test_add_numbers():
    result = add(2, 3)
    assert result == 5

# ステップ2: 最小実装を書く（GREEN）
def add(a, b):
    return a + b

# ステップ3: 必要に応じてリファクタリング（REFACTOR）
```

### カバレッジ要件

- **目標**: 80%+コードカバレッジ
- **重要パス**: 100%カバレッジ必須
- `pytest --cov`を使用してカバレッジを測定

```bash
pytest --cov=mypackage --cov-report=term-missing --cov-report=html
```

## pytest基礎

### 基本テスト構造

```python
import pytest

def test_addition():
    """基本的な加算をテスト。"""
    assert 2 + 2 == 4

def test_string_uppercase():
    """文字列の大文字化をテスト。"""
    text = "hello"
    assert text.upper() == "HELLO"

def test_list_append():
    """リストのappendをテスト。"""
    items = [1, 2, 3]
    items.append(4)
    assert 4 in items
    assert len(items) == 4
```

### アサーション

```python
# 等価性
assert result == expected

# 不等価
assert result != unexpected

# 真偽値
assert result  # Truthy
assert not result  # Falsy
assert result is True  # 正確にTrue
assert result is False  # 正確にFalse
assert result is None  # 正確にNone

# メンバーシップ
assert item in collection
assert item not in collection

# 比較
assert result > 0
assert 0 <= result <= 100

# 型チェック
assert isinstance(result, str)

# 例外テスト（推奨アプローチ）
with pytest.raises(ValueError):
    raise ValueError("error message")

# 例外メッセージをチェック
with pytest.raises(ValueError, match="invalid input"):
    raise ValueError("invalid input provided")

# 例外属性をチェック
with pytest.raises(ValueError) as exc_info:
    raise ValueError("error message")
assert str(exc_info.value) == "error message"
```

## フィクスチャ

### 基本フィクスチャ使用法

```python
import pytest

@pytest.fixture
def sample_data():
    """サンプルデータを提供するフィクスチャ。"""
    return {"name": "Alice", "age": 30}

def test_sample_data(sample_data):
    """フィクスチャを使用したテスト。"""
    assert sample_data["name"] == "Alice"
    assert sample_data["age"] == 30
```

### Setup/Teardown付きフィクスチャ

```python
@pytest.fixture
def database():
    """セットアップとティアダウン付きフィクスチャ。"""
    # セットアップ
    db = Database(":memory:")
    db.create_tables()
    db.insert_test_data()

    yield db  # テストに提供

    # ティアダウン
    db.close()

def test_database_query(database):
    """データベース操作をテスト。"""
    result = database.query("SELECT * FROM users")
    assert len(result) > 0
```

### フィクスチャスコープ

```python
# 関数スコープ（デフォルト）- 各テストで実行
@pytest.fixture
def temp_file():
    with open("temp.txt", "w") as f:
        yield f
    os.remove("temp.txt")

# モジュールスコープ - モジュールごとに1回実行
@pytest.fixture(scope="module")
def module_db():
    db = Database(":memory:")
    db.create_tables()
    yield db
    db.close()

# セッションスコープ - テストセッションごとに1回実行
@pytest.fixture(scope="session")
def shared_resource():
    resource = ExpensiveResource()
    yield resource
    resource.cleanup()
```

## パラメータ化

### 基本パラメータ化

```python
@pytest.mark.parametrize("input,expected", [
    ("hello", "HELLO"),
    ("world", "WORLD"),
    ("PyThOn", "PYTHON"),
])
def test_uppercase(input, expected):
    """異なる入力で3回実行されるテスト。"""
    assert input.upper() == expected
```

### 複数パラメータ

```python
@pytest.mark.parametrize("a,b,expected", [
    (2, 3, 5),
    (0, 0, 0),
    (-1, 1, 0),
    (100, 200, 300),
])
def test_add(a, b, expected):
    """複数の入力で加算をテスト。"""
    assert add(a, b) == expected
```

## モックとパッチング

### 関数のモック

```python
from unittest.mock import patch, Mock

@patch("mypackage.external_api_call")
def test_with_mock(api_call_mock):
    """外部APIをモックしてテスト。"""
    api_call_mock.return_value = {"status": "success"}

    result = my_function()

    api_call_mock.assert_called_once()
    assert result["status"] == "success"
```

### 戻り値のモック

```python
@patch("mypackage.Database.connect")
def test_database_connection(connect_mock):
    """データベース接続をモックしてテスト。"""
    connect_mock.return_value = MockConnection()

    db = Database()
    db.connect()

    connect_mock.assert_called_once_with("localhost")
```

### 例外のモック

```python
@patch("mypackage.api_call")
def test_api_error_handling(api_call_mock):
    """モックされた例外でエラーハンドリングをテスト。"""
    api_call_mock.side_effect = ConnectionError("Network error")

    with pytest.raises(ConnectionError):
        api_call()

    api_call_mock.assert_called_once()
```

## 非同期コードのテスト

### pytest-asyncioによる非同期テスト

```python
import pytest

@pytest.mark.asyncio
async def test_async_function():
    """非同期関数をテスト。"""
    result = await async_add(2, 3)
    assert result == 5

@pytest.mark.asyncio
async def test_async_with_fixture(async_client):
    """非同期フィクスチャを使った非同期テスト。"""
    response = await async_client.get("/api/users")
    assert response.status_code == 200
```

### 非同期フィクスチャ

```python
@pytest.fixture
async def async_client():
    """非同期テストクライアントを提供する非同期フィクスチャ。"""
    app = create_app()
    async with app.test_client() as client:
        yield client

@pytest.mark.asyncio
async def test_api_endpoint(async_client):
    """非同期フィクスチャを使用したテスト。"""
    response = await async_client.get("/api/data")
    assert response.status_code == 200
```

## 例外のテスト

### 期待される例外のテスト

```python
def test_divide_by_zero():
    """ゼロ除算がZeroDivisionErrorを発生させることをテスト。"""
    with pytest.raises(ZeroDivisionError):
        divide(10, 0)

def test_custom_exception():
    """メッセージ付きカスタム例外をテスト。"""
    with pytest.raises(ValueError, match="invalid input"):
        validate_input("invalid")
```

### 例外属性のテスト

```python
def test_exception_with_details():
    """カスタム属性付き例外をテスト。"""
    with pytest.raises(CustomError) as exc_info:
        raise CustomError("error", code=400)

    assert exc_info.value.code == 400
    assert "error" in str(exc_info.value)
```

## テスト構成

### ディレクトリ構造

```
tests/
├── conftest.py                 # 共有フィクスチャ
├── __init__.py
├── unit/                       # ユニットテスト
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_utils.py
│   └── test_services.py
├── integration/                # インテグレーションテスト
│   ├── __init__.py
│   ├── test_api.py
│   └── test_database.py
└── e2e/                        # エンドツーエンドテスト
    ├── __init__.py
    └── test_user_flow.py
```

## ベストプラクティス

### 行うべきこと

- **TDDに従う**: コード前にテストを書く（red-green-refactor）
- **1つのことをテスト**: 各テストは単一の動作を検証すべき
- **説明的な名前を使用**: `test_user_login_with_invalid_credentials_fails`
- **フィクスチャを使用**: フィクスチャで重複を排除
- **外部依存関係をモック**: 外部サービスに依存しない
- **エッジケースをテスト**: 空の入力、None値、境界条件
- **80%+カバレッジを目指す**: 重要パスに焦点
- **テストを高速に保つ**: マークを使用して遅いテストを分離

### 行わないこと

- **実装をテストしない**: 内部ではなく動作をテスト
- **テストで複雑な条件を使わない**: テストをシンプルに保つ
- **テスト失敗を無視しない**: すべてのテストが通る必要がある
- **サードパーティコードをテストしない**: ライブラリが動作することを信頼
- **テスト間で状態を共有しない**: テストは独立すべき
- **テストで例外をキャッチしない**: `pytest.raises`を使用
- **printステートメントを使わない**: アサーションとpytest出力を使用
- **脆すぎるテストを書かない**: 過度に特定のモックを避ける

## pytest設定

### pytest.ini

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    --strict-markers
    --disable-warnings
    --cov=mypackage
    --cov-report=term-missing
    --cov-report=html
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
    unit: marks tests as unit tests
```

### pyproject.toml

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = [
    "--strict-markers",
    "--cov=mypackage",
    "--cov-report=term-missing",
    "--cov-report=html",
]
markers = [
    "slow: marks tests as slow",
    "integration: marks tests as integration tests",
    "unit: marks tests as unit tests",
]
```

## テスト実行

```bash
# 全テスト実行
pytest

# 特定ファイルを実行
pytest tests/test_utils.py

# 特定テストを実行
pytest tests/test_utils.py::test_function

# 詳細出力で実行
pytest -v

# カバレッジ付きで実行
pytest --cov=mypackage --cov-report=html

# 高速テストのみ実行
pytest -m "not slow"

# 最初の失敗まで実行
pytest -x

# N回失敗で停止
pytest --maxfail=3

# 最後に失敗したテストを実行
pytest --lf

# パターンでテストを実行
pytest -k "test_user"

# 失敗時にデバッガで実行
pytest --pdb
```

## クイックリファレンス

| パターン | 使用法 |
|---------|-------|
| `pytest.raises()` | 期待される例外をテスト |
| `@pytest.fixture()` | 再利用可能なテストフィクスチャを作成 |
| `@pytest.mark.parametrize()` | 複数の入力でテストを実行 |
| `@pytest.mark.slow` | 遅いテストをマーク |
| `pytest -m "not slow"` | 遅いテストをスキップ |
| `@patch()` | 関数とクラスをモック |
| `tmp_path` fixture | 自動一時ディレクトリ |
| `pytest --cov` | カバレッジレポート生成 |
| `assert` | シンプルで読みやすいアサーション |

**覚えておくこと**: テストもコードです。クリーンで、読みやすく、保守可能に保ちましょう。良いテストはバグをキャッチし、素晴らしいテストはバグを防ぎます。
