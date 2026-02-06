# Goフック

> このファイルは [common/hooks.md](../common/hooks.md) をGo固有のコンテンツで拡張します。

## PostToolUseフック

`~/.claude/settings.json` で設定：

- **gofmt/goimports**: 編集後に `.go` ファイルを自動フォーマット
- **go vet**: `.go` ファイル編集後に静的解析を実行
- **staticcheck**: 修正されたパッケージで拡張静的チェックを実行
