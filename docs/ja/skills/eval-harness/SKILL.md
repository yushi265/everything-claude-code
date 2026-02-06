---
name: eval-harness
description: Claude Codeセッションのための正式な評価フレームワークで、評価駆動開発(EDD)の原則を実装
tools: Read, Write, Edit, Bash, Grep, Glob
---

# Eval Harnessスキル

Claude Codeセッションのための正式な評価フレームワークで、評価駆動開発(EDD)の原則を実装します。

## 理念

評価駆動開発はevalを「AI開発のユニットテスト」として扱います:
- 実装前に期待される動作を定義
- 開発中にevalを継続的に実行
- 変更ごとのリグレッションを追跡
- 信頼性測定のためのpass@kメトリクスを使用

## Evalの種類

### Capability Evals
Claudeが以前できなかったことができるようになったかをテスト:
```markdown
[CAPABILITY EVAL: feature-name]
Task: Claudeが達成すべきことの説明
Success Criteria:
  - [ ] 基準 1
  - [ ] 基準 2
  - [ ] 基準 3
Expected Output: 期待される結果の説明
```

### Regression Evals
変更が既存の機能を壊していないことを確認:
```markdown
[REGRESSION EVAL: feature-name]
Baseline: SHAまたはチェックポイント名
Tests:
  - existing-test-1: PASS/FAIL
  - existing-test-2: PASS/FAIL
  - existing-test-3: PASS/FAIL
Result: X/Y passed (previously Y/Y)
```

## Graderの種類

### 1. Code-Based Grader
コードを使用した決定論的チェック:
```bash
# Check if file contains expected pattern
grep -q "export function handleAuth" src/auth.ts && echo "PASS" || echo "FAIL"

# Check if tests pass
npm test -- --testPathPattern="auth" && echo "PASS" || echo "FAIL"

# Check if build succeeds
npm run build && echo "PASS" || echo "FAIL"
```

### 2. Model-Based Grader
Claudeを使用してオープンエンドな出力を評価:
```markdown
[MODEL GRADER PROMPT]
Evaluate the following code change:
1. Does it solve the stated problem?
2. Is it well-structured?
3. Are edge cases handled?
4. Is error handling appropriate?

Score: 1-5 (1=poor, 5=excellent)
Reasoning: [explanation]
```

### 3. Human Grader
手動レビューのためのフラグ:
```markdown
[HUMAN REVIEW REQUIRED]
Change: 何が変更されたかの説明
Reason: 人間によるレビューが必要な理由
Risk Level: LOW/MEDIUM/HIGH
```

## メトリクス

### pass@k
「k回の試行で少なくとも1回成功」
- pass@1: 初回試行の成功率
- pass@3: 3回以内の成功
- 典型的な目標: pass@3 > 90%

### pass^k
「k回の試行すべてが成功」
- 信頼性のより高い基準
- pass^3: 3回連続成功
- クリティカルパスに使用

## Evalワークフロー

### 1. Define (コーディング前)
```markdown
## EVAL DEFINITION: feature-xyz

### Capability Evals
1. Can create new user account
2. Can validate email format
3. Can hash password securely

### Regression Evals
1. Existing login still works
2. Session management unchanged
3. Logout flow intact

### Success Metrics
- pass@3 > 90% for capability evals
- pass^3 = 100% for regression evals
```

### 2. Implement
定義されたevalをパスするコードを書く。

### 3. Evaluate
```bash
# Run capability evals
[Run each capability eval, record PASS/FAIL]

# Run regression evals
npm test -- --testPathPattern="existing"

# Generate report
```

### 4. Report
```markdown
EVAL REPORT: feature-xyz
========================

Capability Evals:
  create-user:     PASS (pass@1)
  validate-email:  PASS (pass@2)
  hash-password:   PASS (pass@1)
  Overall:         3/3 passed

Regression Evals:
  login-flow:      PASS
  session-mgmt:    PASS
  logout-flow:     PASS
  Overall:         3/3 passed

Metrics:
  pass@1: 67% (2/3)
  pass@3: 100% (3/3)

Status: READY FOR REVIEW
```

## 統合パターン

### 実装前
```
/eval define feature-name
```
`.claude/evals/feature-name.md`にeval定義ファイルを作成

### 実装中
```
/eval check feature-name
```
現在のevalを実行してステータスを報告

### 実装後
```
/eval report feature-name
```
完全なevalレポートを生成

## Evalの保存

プロジェクトにevalを保存:
```
.claude/
  evals/
    feature-xyz.md      # Eval定義
    feature-xyz.log     # Eval実行履歴
    baseline.json       # リグレッションベースライン
```

## ベストプラクティス

1. **コーディング前にevalを定義** - 成功基準について明確に考えることを強制
2. **evalを頻繁に実行** - リグレッションを早期に発見
3. **pass@kを経時的に追跡** - 信頼性トレンドを監視
4. **可能な限りコードgraderを使用** - 決定論的 > 確率論的
5. **セキュリティには人間によるレビュー** - セキュリティチェックを完全に自動化しない
6. **evalを高速に保つ** - 遅いevalは実行されない
7. **evalをコードとバージョン管理** - Evalは第一級の成果物

## 例: 認証の追加

```markdown
## EVAL: add-authentication

### Phase 1: Define (10 min)
Capability Evals:
- [ ] User can register with email/password
- [ ] User can login with valid credentials
- [ ] Invalid credentials rejected with proper error
- [ ] Sessions persist across page reloads
- [ ] Logout clears session

Regression Evals:
- [ ] Public routes still accessible
- [ ] API responses unchanged
- [ ] Database schema compatible

### Phase 2: Implement (varies)
[Write code]

### Phase 3: Evaluate
Run: /eval check add-authentication

### Phase 4: Report
EVAL REPORT: add-authentication
==============================
Capability: 5/5 passed (pass@3: 100%)
Regression: 3/3 passed (pass^3: 100%)
Status: SHIP IT
```
