# Update Codemaps

コードベース構造を分析し、アーキテクチャドキュメントを更新します:

1. インポート、エクスポート、依存関係について全ソースファイルをスキャン
2. 以下の形式でトークン効率的なコードマップを生成:
   - codemaps/architecture.md - 全体的なアーキテクチャ
   - codemaps/backend.md - バックエンド構造
   - codemaps/frontend.md - フロントエンド構造
   - codemaps/data.md - データモデルとスキーマ

3. 前バージョンからの差分パーセンテージを計算
4. 変更が30%を超える場合、更新前にユーザー承認を要求
5. 各コードマップに新鮮度タイムスタンプを追加
6. レポートを.reports/codemap-diff.txtに保存

TypeScript/Node.jsを使用して分析します。実装詳細ではなく、高レベルの構造に焦点を当てます。
