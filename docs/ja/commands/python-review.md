---
description: PEP 8準拠、型ヒント、セキュリティ、Pythonic慣用句に関する包括的なPythonコードレビュー。python-reviewerエージェントを起動します。
---

# Pythonコードレビュー

このコマンドは、Python特化の包括的なコードレビューを行う**python-reviewer**エージェントを起動します。

## このコマンドが行うこと

1. **Python変更の特定**: `git diff`で変更された`.py`ファイルを検出
2. **静的解析の実行**: `ruff`、`mypy`、`pylint`、`black --check`を実行
3. **セキュリティスキャン**: SQLインジェクション、コマンドインジェクション、安全でないデシリアライゼーションをチェック
4. **型安全性レビュー**: 型ヒントとmypyエラーを分析
5. **Pythonicコードチェック**: PEP 8とPythonベストプラクティスへの準拠を確認
6. **レポート生成**: 重要度別に問題を分類

## 使用するタイミング

以下の場合に`/python-review`を使用します:
- Pythonコードを書いたり変更した後
- Python変更をコミットする前
- Pythonコードを含むプルリクエストのレビュー時
- 新しいPythonコードベースへのオンボーディング時
- Pythonicパターンと慣用句を学ぶ時

## レビューカテゴリ

### CRITICAL (必須修正)
- SQL/コマンドインジェクション脆弱性
- 安全でないeval/exec使用
- Pickleの安全でないデシリアライゼーション
- ハードコードされた認証情報
- YAMLの安全でないload
- エラーを隠す裸のexcept句

### HIGH (修正推奨)
- パブリック関数の型ヒント欠落
- ミュータブルなデフォルト引数
- 例外の静かな握りつぶし
- リソースに対するコンテキストマネージャー未使用
- 内包表記の代わりにCスタイルループ
- isinstance()の代わりにtype()使用
- ロックなしの競合状態

### MEDIUM (検討推奨)
- PEP 8フォーマット違反
- パブリック関数のdocstring欠落
- loggingの代わりにprint文使用
- 非効率な文字列操作
- 名前付き定数なしのマジックナンバー
- フォーマットにf-string未使用
- 不要なリスト生成

## 実行される自動チェック

```bash
# 型チェック
mypy .

# リントとフォーマット
ruff check .
black --check .
isort --check-only .

# セキュリティスキャン
bandit -r .

# 依存関係監査
pip-audit
safety check

# テスト
pytest --cov=app --cov-report=term-missing
```

## 使用例

```text
User: /python-review

Agent:
# Pythonコードレビューレポート

## レビューファイル
- app/routes/user.py (変更)
- app/services/auth.py (変更)

## 静的解析結果
✓ ruff: 問題なし
✓ mypy: エラーなし
⚠️ black: 2ファイルの再フォーマット必要
✓ bandit: セキュリティ問題なし

## 検出された問題

[CRITICAL] SQLインジェクション脆弱性
File: app/routes/user.py:42
Issue: ユーザー入力がSQLクエリに直接補間されています
```python
query = f"SELECT * FROM users WHERE id = {user_id}"  # Bad
```
Fix: パラメータ化クエリを使用
```python
query = "SELECT * FROM users WHERE id = %s"  # Good
cursor.execute(query, (user_id,))
```

[HIGH] ミュータブルなデフォルト引数
File: app/services/auth.py:18
Issue: ミュータブルなデフォルト引数が共有状態を引き起こします
```python
def process_items(items=[]):  # Bad
    items.append("new")
    return items
```
Fix: デフォルトにNoneを使用
```python
def process_items(items=None):  # Good
    if items is None:
        items = []
    items.append("new")
    return items
```

[MEDIUM] 型ヒント欠落
File: app/services/auth.py:25
Issue: 型アノテーションのないパブリック関数
```python
def get_user(user_id):  # Bad
    return db.find(user_id)
```
Fix: 型ヒントを追加
```python
def get_user(user_id: str) -> Optional[User]:  # Good
    return db.find(user_id)
```

[MEDIUM] コンテキストマネージャー未使用
File: app/routes/user.py:55
Issue: 例外発生時にファイルがクローズされません
```python
f = open("config.json")  # Bad
data = f.read()
f.close()
```
Fix: コンテキストマネージャーを使用
```python
with open("config.json") as f:  # Good
    data = f.read()
```

## 概要
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 2

推奨: ❌ CRITICAL問題が修正されるまでマージをブロック

## フォーマット必要
実行: `black app/routes/user.py app/services/auth.py`
```

## 承認基準

| ステータス | 条件 |
|--------|-----------|
| ✅ 承認 | CRITICALまたはHIGH問題なし |
| ⚠️ 警告 | MEDIUM問題のみ（慎重にマージ） |
| ❌ ブロック | CRITICALまたはHIGH問題あり |

## 他のコマンドとの統合

- テストが通ることを確認するため、まず`/python-test`を使用
- Python以外の懸念事項には`/code-review`を使用
- コミット前に`/python-review`を使用
- 静的解析ツールが失敗した場合は`/build-fix`を使用

## フレームワーク固有のレビュー

### Djangoプロジェクト
レビューアは以下をチェックします:
- N+1クエリ問題（`select_related`と`prefetch_related`を使用）
- モデル変更に対する移行の欠落
- ORMで対応可能な箇所での生SQL使用
- 複数ステップ操作での`transaction.atomic()`欠落

### FastAPIプロジェクト
レビューアは以下をチェックします:
- CORS設定ミス
- リクエスト検証のためのPydanticモデル
- レスポンスモデルの正確性
- 適切なasync/await使用
- 依存性注入パターン

### Flaskプロジェクト
レビューアは以下をチェックします:
- コンテキスト管理（appコンテキスト、requestコンテキスト）
- 適切なエラーハンドリング
- Blueprint構成
- 設定管理

## 関連

- エージェント: `agents/python-reviewer.md`
- スキル: `skills/python-patterns/`、`skills/python-testing/`

## よくある修正

### 型ヒントの追加
```python
# Before
def calculate(x, y):
    return x + y

# After
from typing import Union

def calculate(x: Union[int, float], y: Union[int, float]) -> Union[int, float]:
    return x + y
```

### コンテキストマネージャーの使用
```python
# Before
f = open("file.txt")
data = f.read()
f.close()

# After
with open("file.txt") as f:
    data = f.read()
```

### リスト内包表記の使用
```python
# Before
result = []
for item in items:
    if item.active:
        result.append(item.name)

# After
result = [item.name for item in items if item.active]
```

### ミュータブルデフォルトの修正
```python
# Before
def append(value, items=[]):
    items.append(value)
    return items

# After
def append(value, items=None):
    if items is None:
        items = []
    items.append(value)
    return items
```

### f-stringの使用（Python 3.6+）
```python
# Before
name = "Alice"
greeting = "Hello, " + name + "!"
greeting2 = "Hello, {}".format(name)

# After
greeting = f"Hello, {name}!"
```

### ループ内の文字列連結の修正
```python
# Before
result = ""
for item in items:
    result += str(item)

# After
result = "".join(str(item) for item in items)
```

## Pythonバージョン互換性

レビューアは、新しいPythonバージョンの機能を使用している場合に注記します:

| 機能 | 最小Pythonバージョン |
|---------|----------------|
| 型ヒント | 3.5+ |
| f-strings | 3.6+ |
| セイウチ演算子（`:=`） | 3.8+ |
| 位置専用パラメータ | 3.8+ |
| Match文 | 3.10+ |
| 型ユニオン（&#96;x &#124; None&#96;） | 3.10+ |

プロジェクトの`pyproject.toml`または`setup.py`で正しい最小Pythonバージョンを指定してください。
