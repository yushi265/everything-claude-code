#!/usr/bin/env node
/**
 * 戦略的コンパクト提案ツール
 *
 * クロスプラットフォーム対応 (Windows, macOS, Linux)
 *
 * PreToolUseで実行されるか定期的に実行され、論理的な間隔で手動コンパクションを提案します
 *
 * 自動コンパクトではなく手動を使用する理由:
 * - 自動コンパクトは任意のポイントで発生し、しばしばタスクの途中
 * - 戦略的なコンパクションは論理的なフェーズを通してコンテキストを保持
 * - 探索後、実行前にコンパクト
 * - マイルストーン完了後、次のタスク開始前にコンパクト
 */

const path = require('path');
const {
  getTempDir,
  readFile,
  writeFile,
  log
} = require('../lib/utils');

async function main() {
  // ツール呼び出し回数を追跡 (一時ファイルでインクリメント)
  // 親プロセスのPIDまたは環境変数のセッションIDに基づいてセッション固有のカウンターファイルを使用
  const sessionId = process.env.CLAUDE_SESSION_ID || process.ppid || 'default';
  const counterFile = path.join(getTempDir(), `claude-tool-count-${sessionId}`);
  const threshold = parseInt(process.env.COMPACT_THRESHOLD || '50', 10);

  let count = 1;

  // 既存のカウントを読み取るか、1から開始
  const existing = readFile(counterFile);
  if (existing) {
    count = parseInt(existing.trim(), 10) + 1;
  }

  // 更新されたカウントを保存
  writeFile(counterFile, String(count));

  // 閾値のツール呼び出し後にコンパクトを提案
  if (count === threshold) {
    log(`[StrategicCompact] ${threshold} tool calls reached - consider /compact if transitioning phases`);
  }

  // 閾値後の定期的な間隔で提案
  if (count > threshold && count % 25 === 0) {
    log(`[StrategicCompact] ${count} tool calls - good checkpoint for /compact if context is stale`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[StrategicCompact] Error:', err.message);
  process.exit(0);
});
