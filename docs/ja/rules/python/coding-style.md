# Pythonコーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) をPython固有のコンテンツで拡張します。

## 標準

- **PEP 8** 規約に従う
- すべての関数シグネチャに **型アノテーション** を使用

## 不変性

不変データ構造を優先します：

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class User:
    name: str
    email: str

from typing import NamedTuple

class Point(NamedTuple):
    x: float
    y: float
```

## フォーマット

- コードフォーマットには **black**
- インポート並び替えには **isort**
- リントには **ruff**

## リファレンス

スキルを参照：包括的なPythonイディオムとパターンについては `python-patterns` を参照してください。
