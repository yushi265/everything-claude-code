# Pythonテスト

> このファイルは [common/testing.md](../common/testing.md) をPython固有のコンテンツで拡張します。

## フレームワーク

テストフレームワークとして **pytest** を使用します。

## カバレッジ

```bash
pytest --cov=src --cov-report=term-missing
```

## テスト構成

テストの分類には `pytest.mark` を使用します：

```python
import pytest

@pytest.mark.unit
def test_calculate_total():
    ...

@pytest.mark.integration
def test_database_connection():
    ...
```

## リファレンス

スキルを参照：詳細なpytestパターンとフィクスチャについては `python-testing` を参照してください。
