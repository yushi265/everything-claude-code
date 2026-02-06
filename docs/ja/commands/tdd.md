---
description: テスト駆動開発ワークフローを強制します。インターフェースをスキャフォールドし、まずテストを生成し、次に合格するための最小限のコードを実装します。80%以上のカバレッジを確保します。
---

# TDDコマンド

このコマンドは、テスト駆動開発手法を強制する**tdd-guide**エージェントを起動します。

## このコマンドが行うこと

1. **インターフェースのスキャフォールド** - まず型/インターフェースを定義
2. **まずテストを生成** - 失敗するテストを書く（RED）
3. **最小限のコード実装** - テストに合格するのに十分なコードのみを書く（GREEN）
4. **リファクタリング** - テストをグリーンに保ちながらコードを改善（REFACTOR）
5. **カバレッジ検証** - 80%以上のテストカバレッジを確保

## 使用するタイミング

以下の場合に`/tdd`を使用します:
- 新機能の実装時
- 新しい関数/コンポーネントの追加時
- バグ修正時（まずバグを再現するテストを書く）
- 既存コードのリファクタリング時
- 重要なビジネスロジックの構築時

## 動作方法

tdd-guideエージェントは以下を実行します:

1. 入出力の**インターフェースを定義**
2. **失敗するテストを書く**（コードがまだ存在しないため）
3. **テストを実行**し、正しい理由で失敗することを確認
4. **最小限の実装を書く**ことでテストを合格させる
5. **テストを実行**し、合格することを確認
6. テストをグリーンに保ちながら**コードをリファクタリング**
7. **カバレッジをチェック**し、80%未満の場合はテストを追加

## TDDサイクル

```
RED → GREEN → REFACTOR → REPEAT

RED:      失敗するテストを書く
GREEN:    合格するための最小限のコードを書く
REFACTOR: テストを合格させたままコードを改善
REPEAT:   次の機能/シナリオへ
```

## 使用例

```
User: /tdd 市場流動性スコアを計算する関数が必要です

Agent (tdd-guide):
# TDDセッション: 市場流動性スコア計算機

## ステップ1: インターフェース定義（SCAFFOLD）

```typescript
// lib/liquidity.ts
export interface MarketData {
  totalVolume: number
  bidAskSpread: number
  activeTraders: number
  lastTradeTime: Date
}

export function calculateLiquidityScore(market: MarketData): number {
  // TODO: Implementation
  throw new Error('Not implemented')
}
```

## ステップ2: 失敗するテストを書く（RED）

```typescript
// lib/liquidity.test.ts
import { calculateLiquidityScore } from './liquidity'

describe('calculateLiquidityScore', () => {
  it('should return high score for liquid market', () => {
    const market = {
      totalVolume: 100000,
      bidAskSpread: 0.01,
      activeTraders: 500,
      lastTradeTime: new Date()
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBeGreaterThan(80)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('should return low score for illiquid market', () => {
    const market = {
      totalVolume: 100,
      bidAskSpread: 0.5,
      activeTraders: 2,
      lastTradeTime: new Date(Date.now() - 86400000) // 1 day ago
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBeLessThan(30)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('should handle edge case: zero volume', () => {
    const market = {
      totalVolume: 0,
      bidAskSpread: 0,
      activeTraders: 0,
      lastTradeTime: new Date()
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBe(0)
  })
})
```

## ステップ3: テスト実行 - 失敗を確認

```bash
npm test lib/liquidity.test.ts

FAIL lib/liquidity.test.ts
  ✕ should return high score for liquid market (2 ms)
    Error: Not implemented

1 test failed, 0 passed
```

✅ テストが期待通りに失敗しました。実装の準備完了。

## ステップ4: 最小限のコード実装（GREEN）

```typescript
// lib/liquidity.ts
export function calculateLiquidityScore(market: MarketData): number {
  // ゼロボリュームのエッジケースを処理
  if (market.totalVolume === 0) {
    return 0
  }

  // コンポーネントスコアを計算（0-100スケール）
  const volumeScore = Math.min(market.totalVolume / 1000, 100)
  const spreadScore = Math.max(100 - (market.bidAskSpread * 1000), 0)
  const traderScore = Math.min(market.activeTraders / 10, 100)

  // 最近のアクティビティボーナス
  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = Math.max(100 - (hoursSinceLastTrade * 10), 0)

  // 加重平均
  const score = (
    volumeScore * 0.4 +
    spreadScore * 0.3 +
    traderScore * 0.2 +
    recencyScore * 0.1
  )

  return Math.min(Math.max(score, 0), 100) // 0-100に制限
}
```

## ステップ5: テスト実行 - 合格を確認

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed
```

✅ 全テスト合格!

## ステップ6: リファクタリング（IMPROVE）

```typescript
// lib/liquidity.ts - 定数とより良い可読性でリファクタリング
const WEIGHTS = {
  VOLUME: 0.4,
  SPREAD: 0.3,
  TRADERS: 0.2,
  RECENCY: 0.1,
} as const

const SCALE_FACTORS = {
  VOLUME: 1000,
  SPREAD: 1000,
  TRADERS: 10,
  RECENCY_PENALTY: 10,
} as const

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function calculateLiquidityScore(market: MarketData): number {
  if (market.totalVolume === 0) return 0

  const volumeScore = Math.min(market.totalVolume / SCALE_FACTORS.VOLUME, 100)
  const spreadScore = clamp(100 - (market.bidAskSpread * SCALE_FACTORS.SPREAD), 0, 100)
  const traderScore = Math.min(market.activeTraders / SCALE_FACTORS.TRADERS, 100)

  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = clamp(100 - (hoursSinceLastTrade * SCALE_FACTORS.RECENCY_PENALTY), 0, 100)

  const weightedScore =
    volumeScore * WEIGHTS.VOLUME +
    spreadScore * WEIGHTS.SPREAD +
    traderScore * WEIGHTS.TRADERS +
    recencyScore * WEIGHTS.RECENCY

  return clamp(weightedScore, 0, 100)
}
```

## ステップ7: テストがまだ合格することを確認

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed
```

✅ リファクタリング完了、テストは依然合格!

## ステップ8: カバレッジチェック

```bash
npm test -- --coverage lib/liquidity.test.ts

File           | % Stmts | % Branch | % Funcs | % Lines
---------------|---------|----------|---------|--------
liquidity.ts   |   100   |   100    |   100   |   100

Coverage: 100% ✅ (Target: 80%)
```

✅ TDDセッション完了!
```

## TDDベストプラクティス

**推奨:**
- ✅ 実装前にまずテストを書く
- ✅ テストを実行し、実装前に失敗することを確認
- ✅ テストを合格させるための最小限のコードを書く
- ✅ テストがグリーンになった後にのみリファクタリング
- ✅ エッジケースとエラーシナリオを追加
- ✅ 80%以上のカバレッジを目指す（重要なコードは100%）

**非推奨:**
- ❌ テスト前に実装を書く
- ❌ 各変更後のテスト実行をスキップ
- ❌ 一度に大量のコードを書く
- ❌ 失敗するテストを無視
- ❌ 実装詳細をテスト（振る舞いをテスト）
- ❌ すべてをモック化（統合テストを優先）

## 含めるべきテストタイプ

**ユニットテスト**（関数レベル）:
- ハッピーパスシナリオ
- エッジケース（空、null、最大値）
- エラー条件
- 境界値

**統合テスト**（コンポーネントレベル）:
- APIエンドポイント
- データベース操作
- 外部サービス呼び出し
- フック付きReactコンポーネント

**E2Eテスト**（`/e2e`コマンドを使用）:
- 重要なユーザーフロー
- 複数ステップのプロセス
- フルスタック統合

## カバレッジ要件

- 全コードで**80%最小限**
- 以下については**100%必須**:
  - 財務計算
  - 認証ロジック
  - セキュリティクリティカルなコード
  - コアビジネスロジック

## 重要な注意事項

**必須**: テストは実装前に書く必要があります。TDDサイクルは:

1. **RED** - 失敗するテストを書く
2. **GREEN** - 合格するように実装
3. **REFACTOR** - コードを改善

REDフェーズをスキップしないでください。テスト前にコードを書かないでください。

## 他のコマンドとの統合

- 何を構築するかを理解するため、まず`/plan`を使用
- テスト付きで実装するため`/tdd`を使用
- ビルドエラーが発生した場合は`/build-and-fix`を使用
- 実装をレビューするため`/code-review`を使用
- カバレッジを検証するため`/test-coverage`を使用

## 関連エージェント

このコマンドは以下に配置された`tdd-guide`エージェントを起動します:
`~/.claude/agents/tdd-guide.md`

また、以下の`tdd-workflow`スキルを参照できます:
`~/.claude/skills/tdd-workflow/`
