---
name: django-verification
description: Djangoプロジェクトの検証ループ：マイグレーション、リンティング、カバレッジ付きテスト、セキュリティスキャン、リリースまたはPR前のデプロイ準備チェック。
---

# Django検証ループ

PR前、大きな変更後、デプロイ前に実行して、Djangoアプリケーションの品質とセキュリティを確保します。

## フェーズ1: 環境チェック

```bash
# Verify Python version
python --version  # Should match project requirements

# Check virtual environment
which python
pip list --outdated

# Verify environment variables
python -c "import os; import environ; print('DJANGO_SECRET_KEY set' if os.environ.get('DJANGO_SECRET_KEY') else 'MISSING: DJANGO_SECRET_KEY')"
```

環境が誤って設定されている場合は、停止して修正します。

## フェーズ2: コード品質とフォーマット

```bash
# Type checking
mypy . --config-file pyproject.toml

# Linting with ruff
ruff check . --fix

# Formatting with black
black . --check
black .  # Auto-fix

# Import sorting
isort . --check-only
isort .  # Auto-fix

# Django-specific checks
python manage.py check --deploy
```

よくある問題:
- 公開関数に型ヒントがない
- PEP 8フォーマット違反
- インポートがソートされていない
- 本番設定にデバッグ設定が残っている

## フェーズ3: マイグレーション

```bash
# Check for unapplied migrations
python manage.py showmigrations

# Create missing migrations
python manage.py makemigrations --check

# Dry-run migration application
python manage.py migrate --plan

# Apply migrations (test environment)
python manage.py migrate

# Check for migration conflicts
python manage.py makemigrations --merge  # Only if conflicts exist
```

レポート:
- 保留中のマイグレーション数
- マイグレーションの競合
- マイグレーションのないモデル変更

## フェーズ4: テスト + カバレッジ

```bash
# Run all tests with pytest
pytest --cov=apps --cov-report=html --cov-report=term-missing --reuse-db

# Run specific app tests
pytest apps/users/tests/

# Run with markers
pytest -m "not slow"  # Skip slow tests
pytest -m integration  # Only integration tests

# Coverage report
open htmlcov/index.html
```

レポート:
- 総テスト数: X合格、Y失敗、Zスキップ
- 全体カバレッジ: XX%
- アプリごとのカバレッジ内訳

カバレッジ目標:

| コンポーネント | 目標 |
|-----------|--------|
| Models | 90%以上 |
| Serializers | 85%以上 |
| Views | 80%以上 |
| Services | 90%以上 |
| 全体 | 80%以上 |

## フェーズ5: セキュリティスキャン

```bash
# Dependency vulnerabilities
pip-audit
safety check --full-report

# Django security checks
python manage.py check --deploy

# Bandit security linter
bandit -r . -f json -o bandit-report.json

# Secret scanning (if gitleaks is installed)
gitleaks detect --source . --verbose

# Environment variable check
python -c "from django.core.exceptions import ImproperlyConfigured; from django.conf import settings; settings.DEBUG"
```

レポート:
- 発見された脆弱な依存関係
- セキュリティ設定の問題
- 検出されたハードコードされたシークレット
- DEBUGモードの状態（本番環境ではFalseであるべき）

## フェーズ6: Django管理コマンド

```bash
# Check for model issues
python manage.py check

# Collect static files
python manage.py collectstatic --noinput --clear

# Create superuser (if needed for tests)
echo "from apps.users.models import User; User.objects.create_superuser('admin@example.com', 'admin')" | python manage.py shell

# Database integrity
python manage.py check --database default

# Cache verification (if using Redis)
python -c "from django.core.cache import cache; cache.set('test', 'value', 10); print(cache.get('test'))"
```

## フェーズ7: パフォーマンスチェック

```bash
# Django Debug Toolbar output (check for N+1 queries)
# Run in dev mode with DEBUG=True and access a page
# Look for duplicate queries in SQL panel

# Query count analysis
django-admin debugsqlshell  # If django-debug-sqlshell installed

# Check for missing indexes
python manage.py shell << EOF
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("SELECT table_name, index_name FROM information_schema.statistics WHERE table_schema = 'public'")
    print(cursor.fetchall())
EOF
```

レポート:
- ページあたりのクエリ数（通常のページでは50未満が望ましい）
- 不足しているデータベースインデックス
- 検出された重複クエリ

## フェーズ8: 静的アセット

```bash
# Check for npm dependencies (if using npm)
npm audit
npm audit fix

# Build static files (if using webpack/vite)
npm run build

# Verify static files
ls -la staticfiles/
python manage.py findstatic css/style.css
```

## フェーズ9: 設定レビュー

```python
# Run in Python shell to verify settings
python manage.py shell << EOF
from django.conf import settings
import os

# Critical checks
checks = {
    'DEBUG is False': not settings.DEBUG,
    'SECRET_KEY set': bool(settings.SECRET_KEY and len(settings.SECRET_KEY) > 30),
    'ALLOWED_HOSTS set': len(settings.ALLOWED_HOSTS) > 0,
    'HTTPS enabled': getattr(settings, 'SECURE_SSL_REDIRECT', False),
    'HSTS enabled': getattr(settings, 'SECURE_HSTS_SECONDS', 0) > 0,
    'Database configured': settings.DATABASES['default']['ENGINE'] != 'django.db.backends.sqlite3',
}

for check, result in checks.items():
    status = '✓' if result else '✗'
    print(f"{status} {check}")
EOF
```

## フェーズ10: ロギング設定

```bash
# Test logging output
python manage.py shell << EOF
import logging
logger = logging.getLogger('django')
logger.warning('Test warning message')
logger.error('Test error message')
EOF

# Check log files (if configured)
tail -f /var/log/django/django.log
```

## フェーズ11: APIドキュメント（DRFの場合）

```bash
# Generate schema
python manage.py generateschema --format openapi-json > schema.json

# Validate schema
# Check if schema.json is valid JSON
python -c "import json; json.load(open('schema.json'))"

# Access Swagger UI (if using drf-yasg)
# Visit http://localhost:8000/swagger/ in browser
```

## フェーズ12: 差分レビュー

```bash
# Show diff statistics
git diff --stat

# Show actual changes
git diff

# Show changed files
git diff --name-only

# Check for common issues
git diff | grep -i "todo\|fixme\|hack\|xxx"
git diff | grep "print("  # Debug statements
git diff | grep "DEBUG = True"  # Debug mode
git diff | grep "import pdb"  # Debugger
```

チェックリスト:
- デバッグステートメントがない（print、pdb、breakpoint()）
- 重要なコードにTODO/FIXMEコメントがない
- ハードコードされたシークレットや認証情報がない
- モデル変更にデータベースマイグレーションが含まれている
- 設定変更が文書化されている
- 外部呼び出しにエラーハンドリングがある
- 必要な場所にトランザクション管理がある

## 出力テンプレート

```
DJANGO検証レポート
==========================

フェーズ1: 環境チェック
  ✓ Python 3.11.5
  ✓ 仮想環境がアクティブ
  ✓ すべての環境変数が設定済み

フェーズ2: コード品質
  ✓ mypy: 型エラーなし
  ✗ ruff: 3件の問題を発見（自動修正済み）
  ✓ black: フォーマットの問題なし
  ✓ isort: インポートが適切にソート済み
  ✓ manage.py check: 問題なし

フェーズ3: マイグレーション
  ✓ 未適用のマイグレーションなし
  ✓ マイグレーションの競合なし
  ✓ すべてのモデルにマイグレーションあり

フェーズ4: テスト + カバレッジ
  テスト: 247合格、0失敗、5スキップ
  カバレッジ:
    全体: 87%
    users: 92%
    products: 89%
    orders: 85%
    payments: 91%

フェーズ5: セキュリティスキャン
  ✗ pip-audit: 2件の脆弱性を発見（修正が必要）
  ✓ safety check: 問題なし
  ✓ bandit: セキュリティ問題なし
  ✓ シークレットが検出されず
  ✓ DEBUG = False

フェーズ6: Djangoコマンド
  ✓ collectstatic完了
  ✓ データベース整合性OK
  ✓ キャッシュバックエンドに到達可能

フェーズ7: パフォーマンス
  ✓ N+1クエリが検出されず
  ✓ データベースインデックスが設定済み
  ✓ クエリ数が許容範囲内

フェーズ8: 静的アセット
  ✓ npm audit: 脆弱性なし
  ✓ アセットのビルド成功
  ✓ 静的ファイルの収集完了

フェーズ9: 設定
  ✓ DEBUG = False
  ✓ SECRET_KEYが設定済み
  ✓ ALLOWED_HOSTSが設定済み
  ✓ HTTPSが有効
  ✓ HSTSが有効
  ✓ データベースが設定済み

フェーズ10: ロギング
  ✓ ロギングが設定済み
  ✓ ログファイルが書き込み可能

フェーズ11: APIドキュメント
  ✓ スキーマが生成済み
  ✓ Swagger UIにアクセス可能

フェーズ12: 差分レビュー
  変更されたファイル: 12
  +450、-120行
  ✓ デバッグステートメントなし
  ✓ ハードコードされたシークレットなし
  ✓ マイグレーションが含まれる

推奨事項: ⚠️ デプロイ前にpip-auditの脆弱性を修正してください

次のステップ:
1. 脆弱な依存関係を更新
2. セキュリティスキャンを再実行
3. 最終テストのためステージングにデプロイ
```

## デプロイ前チェックリスト

- [ ] すべてのテストが合格
- [ ] カバレッジ ≥ 80%
- [ ] セキュリティ脆弱性なし
- [ ] 未適用のマイグレーションなし
- [ ] 本番設定でDEBUG = False
- [ ] SECRET_KEYが適切に設定されている
- [ ] ALLOWED_HOSTSが正しく設定されている
- [ ] データベースバックアップが有効
- [ ] 静的ファイルが収集され提供されている
- [ ] ロギングが設定され動作している
- [ ] エラー監視（Sentryなど）が設定されている
- [ ] CDNが設定されている（該当する場合）
- [ ] Redis/キャッシュバックエンドが設定されている
- [ ] Celeryワーカーが実行中（該当する場合）
- [ ] HTTPS/SSLが設定されている
- [ ] 環境変数が文書化されている

## 継続的インテグレーション

### GitHub Actionsの例

```yaml
# .github/workflows/django-verification.yml
name: Django Verification

on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Cache pip
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install ruff black mypy pytest pytest-django pytest-cov bandit safety pip-audit

      - name: Code quality checks
        run: |
          ruff check .
          black . --check
          isort . --check-only
          mypy .

      - name: Security scan
        run: |
          bandit -r . -f json -o bandit-report.json
          safety check --full-report
          pip-audit

      - name: Run tests
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test
          DJANGO_SECRET_KEY: test-secret-key
        run: |
          pytest --cov=apps --cov-report=xml --cov-report=term-missing

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## クイックリファレンス

| チェック項目 | コマンド |
|-------|---------|
| 環境 | `python --version` |
| 型チェック | `mypy .` |
| リンティング | `ruff check .` |
| フォーマット | `black . --check` |
| マイグレーション | `python manage.py makemigrations --check` |
| テスト | `pytest --cov=apps` |
| セキュリティ | `pip-audit && bandit -r .` |
| Djangoチェック | `python manage.py check --deploy` |
| 静的ファイル収集 | `python manage.py collectstatic --noinput` |
| 差分統計 | `git diff --stat` |

注意: 自動検証は一般的な問題を検出しますが、手動コードレビューとステージング環境でのテストの代わりにはなりません。
