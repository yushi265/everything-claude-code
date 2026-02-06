# Pythonパターン

> このファイルは [common/patterns.md](../common/patterns.md) をPython固有のコンテンツで拡張します。

## プロトコル（ダックタイピング）

```python
from typing import Protocol

class Repository(Protocol):
    def find_by_id(self, id: str) -> dict | None: ...
    def save(self, entity: dict) -> dict: ...
```

## DTOとしてのデータクラス

```python
from dataclasses import dataclass

@dataclass
class CreateUserRequest:
    name: str
    email: str
    age: int | None = None
```

## コンテキストマネージャとジェネレータ

- リソース管理には コンテキストマネージャ（`with` ステートメント）を使用
- 遅延評価とメモリ効率的な反復処理にはジェネレータを使用

## リファレンス

スキルを参照：デコレータ、並行性、パッケージ構成を含む包括的なパターンについては `python-patterns` を参照してください。
