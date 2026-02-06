# Goテスト

> このファイルは [common/testing.md](../common/testing.md) をGo固有のコンテンツで拡張します。

## フレームワーク

標準の `go test` を **テーブル駆動テスト** と共に使用します。

## 競合検出

常に `-race` フラグ付きで実行します：

```bash
go test -race ./...
```

## カバレッジ

```bash
go test -cover ./...
```

## リファレンス

スキルを参照：詳細なGoテストパターンとヘルパーについては `golang-testing` を参照してください。
