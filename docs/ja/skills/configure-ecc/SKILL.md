---
name: configure-ecc
description: Everything Claude Codeのインタラクティブインストーラー — ユーザーがスキルとルールを選択してユーザーレベルまたはプロジェクトレベルのディレクトリにインストールし、パスを検証し、オプションでインストールされたファイルを最適化します。
---

# Everything Claude Code (ECC)の設定

Everything Claude Codeプロジェクト用のインタラクティブなステップバイステップインストールウィザード。`AskUserQuestion`を使用してユーザーをスキルとルールの選択的インストールに導き、正確性を検証し、最適化を提供します。

## 有効化のタイミング

- ユーザーが「configure ecc」、「install ecc」、「setup everything claude code」などと言ったとき
- ユーザーがこのプロジェクトからスキルまたはルールを選択的にインストールしたいとき
- ユーザーが既存のECCインストールを検証または修正したいとき
- ユーザーがプロジェクト用にインストールされたスキルまたはルールを最適化したいとき

## 前提条件

このスキルは、有効化前にClaude Codeからアクセス可能である必要があります。ブートストラップの2つの方法:
1. **プラグイン経由**: `/plugin install everything-claude-code` — プラグインがこのスキルを自動的にロード
2. **手動**: このスキルのみを`~/.claude/skills/configure-ecc/SKILL.md`にコピーし、「configure ecc」と言って有効化

---

## ステップ0: ECCリポジトリのクローン

インストールの前に、最新のECCソースを`/tmp`にクローンします:

```bash
rm -rf /tmp/everything-claude-code
git clone https://github.com/affaan-m/everything-claude-code.git /tmp/everything-claude-code
```

`ECC_ROOT=/tmp/everything-claude-code`を後続のすべてのコピー操作のソースとして設定します。

クローンが失敗した場合（ネットワークの問題など）、`AskUserQuestion`を使用してユーザーに既存のECCクローンへのローカルパスを提供するよう依頼します。

---

## ステップ1: インストールレベルの選択

`AskUserQuestion`を使用してユーザーにインストール場所を尋ねます:

```
質問: "ECCコンポーネントをどこにインストールしますか？"
オプション:
  - "ユーザーレベル (~/.claude/)" — "すべてのClaude Codeプロジェクトに適用"
  - "プロジェクトレベル (.claude/)" — "現在のプロジェクトのみに適用"
  - "両方" — "共通/共有アイテムはユーザーレベル、プロジェクト固有アイテムはプロジェクトレベル"
```

選択を`INSTALL_LEVEL`として保存します。ターゲットディレクトリを設定:
- ユーザーレベル: `TARGET=~/.claude`
- プロジェクトレベル: `TARGET=.claude` (現在のプロジェクトルートからの相対パス)
- 両方: `TARGET_USER=~/.claude`, `TARGET_PROJECT=.claude`

ターゲットディレクトリが存在しない場合は作成:
```bash
mkdir -p $TARGET/skills $TARGET/rules
```

---

## ステップ2: スキルの選択とインストール

### 2a: スキルカテゴリの選択

27のスキルが4つのカテゴリに整理されています。`multiSelect: true`で`AskUserQuestion`を使用:

```
質問: "どのスキルカテゴリをインストールしますか？"
オプション:
  - "フレームワークと言語" — "Django、Spring Boot、Go、Python、Java、フロントエンド、バックエンドパターン"
  - "データベース" — "PostgreSQL、ClickHouse、JPA/Hibernateパターン"
  - "ワークフローと品質" — "TDD、検証、学習、セキュリティレビュー、圧縮"
  - "すべてのスキル" — "利用可能なすべてのスキルをインストール"
```

### 2b: 個別スキルの確認

選択された各カテゴリについて、下記のスキルの完全なリストを印刷し、ユーザーに確認または特定のものの選択解除を依頼します。リストが4項目を超える場合、リストをテキストとして印刷し、リストされたすべてをインストールするオプションと、ユーザーが特定の名前を貼り付けるための「その他」オプションを持つ`AskUserQuestion`を使用します。

**カテゴリ: フレームワークと言語（16スキル）**

| スキル | 説明 |
|-------|-------------|
| `backend-patterns` | バックエンドアーキテクチャ、API設計、Node.js/Express/Next.jsのサーバーサイドベストプラクティス |
| `coding-standards` | TypeScript、JavaScript、React、Node.jsのユニバーサルコーディング標準 |
| `django-patterns` | Djangoアーキテクチャ、DRFでのREST API、ORM、キャッシング、シグナル、ミドルウェア |
| `django-security` | Djangoセキュリティ: 認証、CSRF、SQLインジェクション、XSS防止 |
| `django-tdd` | pytest-django、factory_boy、モッキング、カバレッジを使用したDjangoテスト |
| `django-verification` | Django検証ループ: マイグレーション、リント、テスト、セキュリティスキャン |
| `frontend-patterns` | React、Next.js、状態管理、パフォーマンス、UIパターン |
| `golang-patterns` | 堅牢なGoアプリケーション向けの慣用的なGoパターン、規則 |
| `golang-testing` | Goテスト: テーブル駆動テスト、サブテスト、ベンチマーク、ファジング |
| `java-coding-standards` | Spring Boot用のJavaコーディング標準: 命名、イミュータビリティ、Optional、ストリーム |
| `python-patterns` | Pythonic慣用句、PEP 8、型ヒント、ベストプラクティス |
| `python-testing` | pytest、TDD、フィクスチャ、モッキング、パラメトライゼーションを使用したPythonテスト |
| `springboot-patterns` | Spring Bootアーキテクチャ、REST API、レイヤードサービス、キャッシング、非同期 |
| `springboot-security` | Spring Security: 認証/認可、バリデーション、CSRF、シークレット、レート制限 |
| `springboot-tdd` | JUnit 5、Mockito、MockMvc、TestcontainersでのSpring Boot TDD |
| `springboot-verification` | Spring Boot検証: ビルド、静的解析、テスト、セキュリティスキャン |

**カテゴリ: データベース（3スキル）**

| スキル | 説明 |
|-------|-------------|
| `clickhouse-io` | ClickHouseパターン、クエリ最適化、分析、データエンジニアリング |
| `jpa-patterns` | JPA/Hibernateエンティティ設計、リレーションシップ、クエリ最適化、トランザクション |
| `postgres-patterns` | PostgreSQLクエリ最適化、スキーマ設計、インデックス作成、セキュリティ |

**カテゴリ: ワークフローと品質（8スキル）**

| スキル | 説明 |
|-------|-------------|
| `continuous-learning` | セッションから再利用可能なパターンを学習済みスキルとして自動抽出 |
| `continuous-learning-v2` | 信頼度スコアリングを使用した本能ベースの学習、スキル/コマンド/エージェントに進化 |
| `eval-harness` | Eval駆動開発（EDD）用の正式な評価フレームワーク |
| `iterative-retrieval` | サブエージェントコンテキスト問題のための漸進的コンテキスト改善 |
| `security-review` | セキュリティチェックリスト: 認証、入力、シークレット、API、支払い機能 |
| `strategic-compact` | 論理的な間隔で手動コンテキスト圧縮を提案 |
| `tdd-workflow` | 80%以上のカバレッジでTDDを強制: 単体、統合、E2E |
| `verification-loop` | 検証と品質ループパターン |

**スタンドアロン**

| スキル | 説明 |
|-------|-------------|
| `project-guidelines-example` | プロジェクト固有のスキルを作成するためのテンプレート |

### 2c: インストールの実行

選択された各スキルについて、スキルディレクトリ全体をコピー:
```bash
cp -r $ECC_ROOT/skills/<skill-name> $TARGET/skills/
```

注: `continuous-learning`と`continuous-learning-v2`には追加ファイル（config.json、フック、スクリプト）があります - SKILL.mdだけでなく、ディレクトリ全体がコピーされることを確認してください。

---

## ステップ3: ルールの選択とインストール

`multiSelect: true`で`AskUserQuestion`を使用:

```
質問: "どのルールセットをインストールしますか？"
オプション:
  - "共通ルール（推奨）" — "言語に依存しない原則: コーディングスタイル、gitワークフロー、テスト、セキュリティなど（8ファイル）"
  - "TypeScript/JavaScript" — "TS/JSパターン、フック、Playwrightでのテスト（5ファイル）"
  - "Python" — "Pythonパターン、pytest、black/ruffフォーマット（5ファイル）"
  - "Go" — "Goパターン、テーブル駆動テスト、gofmt/staticcheck（5ファイル）"
```

インストールを実行:
```bash
# 共通ルール（rules/にフラットコピー）
cp -r $ECC_ROOT/rules/common/* $TARGET/rules/

# 言語固有のルール（rules/にフラットコピー）
cp -r $ECC_ROOT/rules/typescript/* $TARGET/rules/   # 選択された場合
cp -r $ECC_ROOT/rules/python/* $TARGET/rules/        # 選択された場合
cp -r $ECC_ROOT/rules/golang/* $TARGET/rules/        # 選択された場合
```

**重要**: ユーザーが言語固有のルールを選択したが、共通ルールを選択しなかった場合、警告します:
> "言語固有のルールは共通ルールを拡張します。共通ルールなしでインストールすると、不完全なカバレッジになる可能性があります。共通ルールもインストールしますか？"

---

## ステップ4: インストール後の検証

インストール後、これらの自動チェックを実行します:

### 4a: ファイルの存在確認

インストールされたすべてのファイルをリストし、ターゲットの場所に存在することを確認:
```bash
ls -la $TARGET/skills/
ls -la $TARGET/rules/
```

### 4b: パス参照のチェック

インストールされたすべての`.md`ファイルのパス参照をスキャン:
```bash
grep -rn "~/.claude/" $TARGET/skills/ $TARGET/rules/
grep -rn "../common/" $TARGET/rules/
grep -rn "skills/" $TARGET/skills/
```

**プロジェクトレベルのインストールの場合**、`~/.claude/`パスへの参照をフラグ:
- スキルが`~/.claude/settings.json`を参照している場合 — これは通常問題ありません（設定は常にユーザーレベル）
- スキルが`~/.claude/skills/`または`~/.claude/rules/`を参照している場合 — これはプロジェクトレベルのみにインストールされている場合に壊れている可能性があります
- スキルが別のスキルを名前で参照している場合 — 参照されたスキルもインストールされていることを確認

### 4c: スキル間の相互参照のチェック

一部のスキルは他のスキルを参照しています。これらの依存関係を検証:
- `django-tdd`は`django-patterns`を参照する可能性があります
- `springboot-tdd`は`springboot-patterns`を参照する可能性があります
- `continuous-learning-v2`は`~/.claude/homunculus/`ディレクトリを参照します
- `python-testing`は`python-patterns`を参照する可能性があります
- `golang-testing`は`golang-patterns`を参照する可能性があります
- 言語固有のルールは`common/`対応物を参照します

### 4d: 問題の報告

見つかった各問題について、報告:
1. **ファイル**: 問題のある参照を含むファイル
2. **行**: 行番号
3. **問題**: 何が問題か（例: 「~/.claude/skills/python-patternsを参照していますが、python-patternsはインストールされていません」）
4. **修正案**: 何をすべきか（例: 「python-patternsスキルをインストール」または「パスを.claude/skills/に更新」）

---

## ステップ5: インストールされたファイルの最適化（オプション）

`AskUserQuestion`を使用:

```
質問: "プロジェクト用にインストールされたファイルを最適化しますか？"
オプション:
  - "スキルを最適化" — "無関係なセクションを削除、パスを調整、技術スタックに合わせる"
  - "ルールを最適化" — "カバレッジターゲットを調整、プロジェクト固有のパターンを追加、ツール設定をカスタマイズ"
  - "両方を最適化" — "インストールされたすべてのファイルの完全な最適化"
  - "スキップ" — "すべてをそのまま保持"
```

### スキルを最適化する場合:
1. 各インストールされたSKILL.mdを読む
2. ユーザーにプロジェクトの技術スタックを尋ねる（まだ知られていない場合）
3. 各スキルについて、無関係なセクションの削除を提案
4. インストールターゲット（ソースリポジトリではなく）でSKILL.mdファイルをその場で編集
5. ステップ4で見つかったパスの問題を修正

### ルールを最適化する場合:
1. 各インストールされたルール.mdファイルを読む
2. ユーザーに好みについて尋ねる:
   - テストカバレッジターゲット（デフォルト80%）
   - 好みのフォーマットツール
   - Gitワークフローの規則
   - セキュリティ要件
3. インストールターゲットでルールファイルをその場で編集

**重要**: インストールターゲット（`$TARGET/`）のファイルのみを変更し、ソースECCリポジトリ（`$ECC_ROOT/`）のファイルは決して変更しないでください。

---

## ステップ6: インストールサマリー

`/tmp`からクローンされたリポジトリをクリーンアップ:

```bash
rm -rf /tmp/everything-claude-code
```

次に、サマリーレポートを印刷:

```
## ECCインストール完了

### インストールターゲット
- レベル: [ユーザーレベル / プロジェクトレベル / 両方]
- パス: [ターゲットパス]

### インストールされたスキル（[カウント]）
- skill-1, skill-2, skill-3, ...

### インストールされたルール（[カウント]）
- common（8ファイル）
- typescript（5ファイル）
- ...

### 検証結果
- [カウント]の問題が見つかり、[カウント]を修正
- [残りの問題をリスト]

### 適用された最適化
- [行われた変更をリスト、または「なし」]
```

---

## トラブルシューティング

### 「スキルがClaude Codeに認識されない」
- スキルディレクトリに`SKILL.md`ファイルが含まれていることを確認（単なる緩い.mdファイルではなく）
- ユーザーレベルの場合: `~/.claude/skills/<skill-name>/SKILL.md`が存在することを確認
- プロジェクトレベルの場合: `.claude/skills/<skill-name>/SKILL.md`が存在することを確認

### 「ルールが機能しない」
- ルールはサブディレクトリではなくフラットファイルです: `$TARGET/rules/coding-style.md`（正しい）vs `$TARGET/rules/common/coding-style.md`（フラットインストールには不正）
- ルールインストール後にClaude Codeを再起動

### 「プロジェクトレベルのインストール後のパス参照エラー」
- 一部のスキルは`~/.claude/`パスを前提としています。ステップ4の検証を実行してこれらを見つけて修正します。
- `continuous-learning-v2`の場合、`~/.claude/homunculus/`ディレクトリは常にユーザーレベルです — これは予想され、エラーではありません。
