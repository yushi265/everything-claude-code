---
name: springboot-verification
description: Spring Bootプロジェクトの検証ループ: ビルド、静的解析、カバレッジ付きテスト、セキュリティスキャン、リリースまたはPR前の差分レビュー。
---

# Spring Boot検証ループ

PR前、大きな変更後、デプロイ前に実行。

## フェーズ1: ビルド

```bash
mvn -T 4 clean verify -DskipTests
# または
./gradlew clean assemble -x test
```

ビルドが失敗したら、停止して修正。

## フェーズ2: 静的解析

Maven（一般的なプラグイン）:
```bash
mvn -T 4 spotbugs:check pmd:check checkstyle:check
```

Gradle（設定されている場合）:
```bash
./gradlew checkstyleMain pmdMain spotbugsMain
```

## フェーズ3: テスト + カバレッジ

```bash
mvn -T 4 test
mvn jacoco:report   # 80%+カバレッジを確認
# または
./gradlew test jacocoTestReport
```

レポート:
- 総テスト数、成功/失敗
- カバレッジ %（行/ブランチ）

## フェーズ4: セキュリティスキャン

```bash
# 依存関係のCVE
mvn org.owasp:dependency-check-maven:check
# または
./gradlew dependencyCheckAnalyze

# シークレット（git）
git secrets --scan  # 設定されている場合
```

## フェーズ5: Lint/Format（オプショナルゲート）

```bash
mvn spotless:apply   # Spotlessプラグインを使用している場合
./gradlew spotlessApply
```

## フェーズ6: 差分レビュー

```bash
git diff --stat
git diff
```

チェックリスト:
- デバッグログが残っていない（`System.out`、ガードなしの`log.debug`）
- 意味のあるエラーとHTTPステータス
- 必要な場所にトランザクションとバリデーションが存在
- 設定変更がドキュメント化されている

## 出力テンプレート

```
検証レポート
===================
ビルド:     [成功/失敗]
静的解析:   [成功/失敗] (spotbugs/pmd/checkstyle)
テスト:     [成功/失敗] (X/Y成功、Z%カバレッジ)
セキュリティ: [成功/失敗] (CVE検出: N)
差分:      [Xファイル変更]

総合:      [準備完了 / 未完了]

修正する問題:
1. ...
2. ...
```

## 連続モード

- 重要な変更時または長いセッションで30〜60分ごとにフェーズを再実行
- 短いループを保つ: `mvn -T 4 test` + spotbugsで迅速なフィードバック

**覚えておくこと**: 迅速なフィードバックは遅い驚きに勝る。ゲートを厳格に保つ。本番システムでは警告を欠陥として扱う。
