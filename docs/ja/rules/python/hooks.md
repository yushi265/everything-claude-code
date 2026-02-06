# Pythonフック

> このファイルは [common/hooks.md](../common/hooks.md) をPython固有のコンテンツで拡張します。

## PostToolUseフック

`~/.claude/settings.json` で設定：

- **black/ruff**: 編集後に `.py` ファイルを自動フォーマット
- **mypy/pyright**: `.py` ファイル編集後に型チェックを実行

## 警告

- 編集されたファイル内の `print()` ステートメントについて警告（代わりに `logging` モジュールを使用）
