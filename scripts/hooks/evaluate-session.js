#!/usr/bin/env node
/**
 * 継続的学習 - セッション評価器
 *
 * クロスプラットフォーム対応 (Windows, macOS, Linux)
 *
 * Stopフックで実行され、Claude Codeセッションから再利用可能なパターンを抽出します
 *
 * UserPromptSubmitではなくStopフックを使用する理由:
 * - Stopはセッション終了時に一度だけ実行される (軽量)
 * - UserPromptSubmitは毎メッセージ実行される (重く、レイテンシを追加)
 */

const path = require('path');
const fs = require('fs');
const {
  getLearnedSkillsDir,
  ensureDir,
  readFile,
  countInFile,
  log
} = require('../lib/utils');

async function main() {
  // 設定ファイルを見つけるためにスクリプトディレクトリを取得
  const scriptDir = __dirname;
  const configFile = path.join(scriptDir, '..', '..', 'skills', 'continuous-learning', 'config.json');

  // デフォルト設定
  let minSessionLength = 10;
  let learnedSkillsPath = getLearnedSkillsDir();

  // 設定ファイルが存在する場合は読み込む
  const configContent = readFile(configFile);
  if (configContent) {
    try {
      const config = JSON.parse(configContent);
      minSessionLength = config.min_session_length || 10;

      if (config.learned_skills_path) {
        // パス内の~を処理
        learnedSkillsPath = config.learned_skills_path.replace(/^~/, require('os').homedir());
      }
    } catch {
      // 不正な設定の場合、デフォルトを使用
    }
  }

  // 学習したスキルのディレクトリが存在することを確認
  ensureDir(learnedSkillsPath);

  // 環境変数からトランスクリプトパスを取得 (Claude Codeによって設定される)
  const transcriptPath = process.env.CLAUDE_TRANSCRIPT_PATH;

  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    process.exit(0);
  }

  // セッション内のユーザーメッセージ数をカウント
  const messageCount = countInFile(transcriptPath, /"type":"user"/g);

  // 短いセッションはスキップ
  if (messageCount < minSessionLength) {
    log(`[ContinuousLearning] Session too short (${messageCount} messages), skipping`);
    process.exit(0);
  }

  // 抽出可能なパターンのためにセッションを評価すべきことをClaudeに通知
  log(`[ContinuousLearning] Session has ${messageCount} messages - evaluate for extractable patterns`);
  log(`[ContinuousLearning] Save learned skills to: ${learnedSkillsPath}`);

  process.exit(0);
}

main().catch(err => {
  console.error('[ContinuousLearning] Error:', err.message);
  process.exit(0);
});
