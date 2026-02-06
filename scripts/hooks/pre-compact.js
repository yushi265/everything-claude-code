#!/usr/bin/env node
/**
 * PreCompactフック - コンテキスト圧縮前に状態を保存する
 *
 * クロスプラットフォーム（Windows、macOS、Linux）
 *
 * Claudeがコンテキストを圧縮する前に実行され、要約で失われる可能性のある
 * 重要な状態を保持する機会を提供する。
 */

const path = require('path');
const {
  getSessionsDir,
  getDateTimeString,
  getTimeString,
  findFiles,
  ensureDir,
  appendFile,
  log
} = require('../lib/utils');

async function main() {
  const sessionsDir = getSessionsDir();
  const compactionLog = path.join(sessionsDir, 'compaction-log.txt');

  ensureDir(sessionsDir);

  // タイムスタンプ付きで圧縮イベントをログに記録
  const timestamp = getDateTimeString();
  appendFile(compactionLog, `[${timestamp}] コンテキスト圧縮が開始されました\n`);

  // アクティブなセッションファイルがある場合、圧縮を記録
  const sessions = findFiles(sessionsDir, '*.tmp');

  if (sessions.length > 0) {
    const activeSession = sessions[0].path;
    const timeStr = getTimeString();
    appendFile(activeSession, `\n---\n**[${timeStr}に圧縮が発生しました]** - コンテキストが要約されました\n`);
  }

  log('[PreCompact] 圧縮前に状態を保存しました');
  process.exit(0);
}

main().catch(err => {
  console.error('[PreCompact] エラー:', err.message);
  process.exit(0);
});
