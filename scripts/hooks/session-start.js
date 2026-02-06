#!/usr/bin/env node
/**
 * SessionStartフック - 新しいセッションで以前のコンテキストを読み込む
 *
 * クロスプラットフォーム（Windows、macOS、Linux）
 *
 * 新しいClaudeセッションが開始されたときに実行される。最近のセッション
 * ファイルをチェックし、読み込み可能なコンテキストをClaudeに通知する。
 */

const {
  getSessionsDir,
  getLearnedSkillsDir,
  findFiles,
  ensureDir,
  log
} = require('../lib/utils');
const { getPackageManager, getSelectionPrompt } = require('../lib/package-manager');
const { listAliases } = require('../lib/session-aliases');

async function main() {
  const sessionsDir = getSessionsDir();
  const learnedDir = getLearnedSkillsDir();

  // ディレクトリが存在することを確認
  ensureDir(sessionsDir);
  ensureDir(learnedDir);

  // 最近のセッションファイルをチェック（過去7日間）
  // 旧形式（YYYY-MM-DD-session.tmp）と新形式（YYYY-MM-DD-shortid-session.tmp）の両方にマッチ
  const recentSessions = findFiles(sessionsDir, '*-session.tmp', { maxAge: 7 });

  if (recentSessions.length > 0) {
    const latest = recentSessions[0];
    log(`[SessionStart] Found ${recentSessions.length} recent session(s)`);
    log(`[SessionStart] Latest: ${latest.path}`);
  }

  // 学習したスキルをチェック
  const learnedSkills = findFiles(learnedDir, '*.md');

  if (learnedSkills.length > 0) {
    log(`[SessionStart] ${learnedSkills.length} 個の学習したスキルが ${learnedDir} にあります`);
  }

  // 利用可能なセッションエイリアスをチェック
  const aliases = listAliases({ limit: 5 });

  if (aliases.length > 0) {
    const aliasNames = aliases.map(a => a.name).join(', ');
    log(`[SessionStart] ${aliases.length} 個のセッションエイリアスが利用可能: ${aliasNames}`);
    log(`[SessionStart] /sessions load <alias> を使用して以前のセッションを継続できます`);
  }

  // パッケージマネージャーを検出して報告
  const pm = getPackageManager();
  log(`[SessionStart] パッケージマネージャー: ${pm.name} (${pm.source})`);

  // フォールバック経由で検出された場合、選択プロンプトを表示
  if (pm.source === 'fallback' || pm.source === 'default') {
    log('[SessionStart] パッケージマネージャーの設定が見つかりません。');
    log(getSelectionPrompt());
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[SessionStart] エラー:', err.message);
  process.exit(0); // エラー時もブロックしない
});
