# TypeScript/JavaScriptフック

> このファイルは [common/hooks.md](../common/hooks.md) をTypeScript/JavaScript固有のコンテンツで拡張します。

## PostToolUseフック

`~/.claude/settings.json` で設定：

- **Prettier**: 編集後にJS/TSファイルを自動フォーマット
- **TypeScriptチェック**: `.ts`/`.tsx` ファイル編集後に `tsc` を実行
- **console.log警告**: 編集されたファイル内の `console.log` について警告

## Stopフック

- **console.log監査**: セッション終了前に修正されたすべてのファイルで `console.log` をチェック
