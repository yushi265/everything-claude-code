---
description: Playwrightを使用してエンドツーエンドテストを生成・実行致します。テストジャーニーの作成、テスト実行、スクリーンショット/動画/トレースのキャプチャ、成果物のアップロードを行います。
---

# E2Eコマンド

本コマンドは **e2e-runner** エージェントを呼び出し、Playwrightを用いたエンドツーエンドテストの生成、保守、実行を行います。

## 本コマンドの役割

1. **テストジャーニーの生成** - ユーザーフローのためのPlaywrightテストを作成
2. **E2Eテストの実行** - 複数ブラウザでテストを実行
3. **成果物のキャプチャ** - 失敗時のスクリーンショット、動画、トレース
4. **結果のアップロード** - HTMLレポートとJUnit XML
5. **不安定なテストの特定** - 不安定なテストを隔離

## 使用時機

以下の場合に `/e2e` を使用致します:
- 重要なユーザージャーニーのテスト (ログイン、取引、決済)
- 複数ステップのフローがエンドツーエンドで動作することの検証
- UIインタラクションとナビゲーションのテスト
- フロントエンドとバックエンド間の統合の検証
- 本番環境デプロイメントの準備

## 動作原理

e2e-runnerエージェントは以下を実行致します:

1. **ユーザーフローを分析**し、テストシナリオを特定
2. **Page Object Modelパターンを使用してPlaywrightテストを生成**
3. **複数のブラウザ (Chrome、Firefox、Safari) でテストを実行**
4. **スクリーンショット、動画、トレースで失敗をキャプチャ**
5. **結果と成果物を含むレポートを生成**
6. **不安定なテストを特定**し、修正方法を推奨

## 使用例

```
User: /e2e Test the market search and view flow

Agent (e2e-runner):
# E2E Test Generation: Market Search and View Flow

## Test Scenario Identified

**User Journey:** Market Search → View Results → Click Market → View Details

**Test Coverage:**
1. Navigate to markets page
2. Perform semantic search
3. Verify search results
4. Click on first result
5. Verify market details page loads
6. Verify chart renders

## Generated Test Code

```typescript
// tests/e2e/markets/search-and-view.spec.ts
import { test, expect } from '@playwright/test'
import { MarketsPage } from '../../pages/MarketsPage'
import { MarketDetailsPage } from '../../pages/MarketDetailsPage'

test.describe('Market Search and View Flow', () => {
  test('user can search markets and view details', async ({ page }) => {
    // 1. Navigate to markets page
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // Verify page loaded
    await expect(page).toHaveTitle(/Markets/)
    await expect(page.locator('h1')).toContainText('Markets')

    // 2. Perform semantic search
    await marketsPage.searchMarkets('election')

    // Wait for API response
    await page.waitForResponse(resp =>
      resp.url().includes('/api/markets/search') && resp.status() === 200
    )

    // 3. Verify search results
    const marketCards = marketsPage.marketCards
    await expect(marketCards.first()).toBeVisible()
    const resultCount = await marketCards.count()
    expect(resultCount).toBeGreaterThan(0)

    // Take screenshot of search results
    await page.screenshot({ path: 'artifacts/search-results.png' })

    // 4. Click on first result
    const firstMarketTitle = await marketCards.first().textContent()
    await marketCards.first().click()

    // 5. Verify market details page loads
    await expect(page).toHaveURL(/\/markets\/[a-z0-9-]+/)

    const detailsPage = new MarketDetailsPage(page)
    await expect(detailsPage.marketName).toBeVisible()
    await expect(detailsPage.marketDescription).toBeVisible()

    // 6. Verify chart renders
    await expect(detailsPage.priceChart).toBeVisible()

    // Verify market name matches
    const detailsTitle = await detailsPage.marketName.textContent()
    expect(detailsTitle?.toLowerCase()).toContain(
      firstMarketTitle?.toLowerCase().substring(0, 20) || ''
    )

    // Take screenshot of market details
    await page.screenshot({ path: 'artifacts/market-details.png' })
  })

  test('search with no results shows empty state', async ({ page }) => {
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // Search for non-existent market
    await marketsPage.searchMarkets('xyznonexistentmarket123456')

    // Verify empty state
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible()
    await expect(page.locator('[data-testid="no-results"]')).toContainText(
      /no.*results|no.*markets/i
    )

    const marketCount = await marketsPage.marketCards.count()
    expect(marketCount).toBe(0)
  })

  test('can clear search and see all markets again', async ({ page }) => {
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // Initial market count
    const initialCount = await marketsPage.marketCards.count()

    // Perform search
    await marketsPage.searchMarkets('trump')
    await page.waitForLoadState('networkidle')

    // Verify filtered results
    const filteredCount = await marketsPage.marketCards.count()
    expect(filteredCount).toBeLessThan(initialCount)

    // Clear search
    await marketsPage.searchInput.clear()
    await page.waitForLoadState('networkidle')

    // Verify all markets shown again
    const finalCount = await marketsPage.marketCards.count()
    expect(finalCount).toBe(initialCount)
  })
})
```

## Running Tests

```bash
# Run the generated test
npx playwright test tests/e2e/markets/search-and-view.spec.ts

Running 3 tests using 3 workers

  ✓  [chromium] › search-and-view.spec.ts:5:3 › user can search markets and view details (4.2s)
  ✓  [chromium] › search-and-view.spec.ts:52:3 › search with no results shows empty state (1.8s)
  ✓  [chromium] › search-and-view.spec.ts:67:3 › can clear search and see all markets again (2.9s)

  3 passed (9.1s)

Artifacts generated:
- artifacts/search-results.png
- artifacts/market-details.png
- playwright-report/index.html
```

## Test Report

```
╔══════════════════════════════════════════════════════════════╗
║                    E2E Test Results                          ║
╠══════════════════════════════════════════════════════════════╣
║ Status:     ✅ ALL TESTS PASSED                              ║
║ Total:      3 tests                                          ║
║ Passed:     3 (100%)                                         ║
║ Failed:     0                                                ║
║ Flaky:      0                                                ║
║ Duration:   9.1s                                             ║
╚══════════════════════════════════════════════════════════════╝

Artifacts:
📸 Screenshots: 2 files
📹 Videos: 0 files (only on failure)
🔍 Traces: 0 files (only on failure)
📊 HTML Report: playwright-report/index.html

View report: npx playwright show-report
```

✅ E2Eテストスイートの準備が整い、CI/CDへの統合が可能でございます。
```

## テスト成果物

テスト実行時、以下の成果物がキャプチャされます:

**全てのテスト:**
- タイムラインと結果を含むHTMLレポート
- CI統合用のJUnit XML

**失敗時のみ:**
- 失敗状態のスクリーンショット
- テストの動画記録
- デバッグ用のトレースファイル (ステップごとの再生)
- ネットワークログ
- コンソールログ

## 成果物の確認

```bash
# ブラウザでHTMLレポートを表示
npx playwright show-report

# 特定のトレースファイルを表示
npx playwright show-trace artifacts/trace-abc123.zip

# スクリーンショットはartifacts/ディレクトリに保存
open artifacts/search-results.png
```

## 不安定なテストの検出

テストが断続的に失敗する場合:

```
⚠️  FLAKY TEST DETECTED: tests/e2e/markets/trade.spec.ts

Test passed 7/10 runs (70% pass rate)

Common failure:
"Timeout waiting for element '[data-testid="confirm-btn"]'"

Recommended fixes:
1. Add explicit wait: await page.waitForSelector('[data-testid="confirm-btn"]')
2. Increase timeout: { timeout: 10000 }
3. Check for race conditions in component
4. Verify element is not hidden by animation

Quarantine recommendation: Mark as test.fixme() until fixed
```

## ブラウザ設定

デフォルトで複数のブラウザでテストを実行致します:
- ✅ Chromium (デスクトップChrome)
- ✅ Firefox (デスクトップ)
- ✅ WebKit (デスクトップSafari)
- ✅ Mobile Chrome (オプション)

ブラウザを調整するには `playwright.config.ts` で設定を変更致します。

## CI/CD統合

CIパイプラインに追加:

```yaml
# .github/workflows/e2e.yml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npx playwright test

- name: Upload artifacts
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## PMX固有の重要なフロー

PMXにおいては、以下のE2Eテストを優先致します:

**🔴 重大 (常に合格必須)**:
1. ウォレット接続が可能
2. マーケット閲覧が可能
3. マーケット検索が可能 (セマンティック検索)
4. マーケット詳細表示が可能
5. トレード実行が可能 (テスト資金使用)
6. マーケットが正しく解決
7. 資金引き出しが可能

**🟡 重要**:
1. マーケット作成フロー
2. ユーザープロフィール更新
3. リアルタイム価格更新
4. チャート描画
5. マーケットのフィルタとソート
6. モバイルレスポンシブレイアウト

## ベストプラクティス

**すべきこと**:
- ✅ 保守性のためPage Object Modelを使用
- ✅ セレクタにdata-testid属性を使用
- ✅ 任意のタイムアウトではなくAPI応答を待機
- ✅ 重要なユーザージャーニーをエンドツーエンドでテスト
- ✅ mainにマージする前にテストを実行
- ✅ テスト失敗時は成果物を確認

**してはならぬこと**:
- ❌ 脆弱なセレクタを使用 (CSSクラスは変更される可能性がある)
- ❌ 実装詳細をテスト
- ❌ 本番環境に対してテストを実行
- ❌ 不安定なテストを無視
- ❌ 失敗時の成果物確認をスキップ
- ❌ あらゆるエッジケースをE2Eでテスト (ユニットテストを使用)

## 重要な注意事項

**PMXにとって重大**:
- 実際の資金が関わるE2Eテストは、テストネット/ステージング環境でのみ実行すること
- 本番環境に対してトレーディングテストを実行してはならぬ
- 金融テストには `test.skip(process.env.NODE_ENV === 'production')` を設定
- 少額のテスト資金を持つテストウォレットのみを使用

## 他のコマンドとの統合

- `/plan` でテストすべき重要なジャーニーを特定
- `/tdd` でユニットテスト (より高速、より細粒度)
- `/e2e` で統合とユーザージャーニーのテスト
- `/code-review` でテスト品質の検証

## 関連エージェント

本コマンドは以下に配置された `e2e-runner` エージェントを呼び出します:
`~/.claude/agents/e2e-runner.md`

## クイックコマンド

```bash
# 全E2Eテストを実行
npx playwright test

# 特定のテストファイルを実行
npx playwright test tests/e2e/markets/search.spec.ts

# ヘッドモードで実行 (ブラウザを表示)
npx playwright test --headed

# テストをデバッグ
npx playwright test --debug

# テストコードを生成
npx playwright codegen http://localhost:3000

# レポートを表示
npx playwright show-report
```
