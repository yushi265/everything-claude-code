#!/usr/bin/env node

/**
 * Stopフック: 変更されたファイルのconsole.log文をチェック
 *
 * このフックは各レスポンス後に実行され、変更された
 * JavaScript/TypeScriptファイルにconsole.log文が含まれているかチェックする。
 * 開発者がコミット前にデバッグ文を削除することを忘れないように
 * 警告を提供する。
 */

const { execSync } = require('child_process');
const fs = require('fs');

let data = '';

// 標準入力を読み込む
process.stdin.on('data', chunk => {
  data += chunk;
});

process.stdin.on('end', () => {
  try {
    // Gitリポジトリ内かチェック
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    } catch {
      // Gitリポジトリでない場合、データをそのまま渡す
      console.log(data);
      process.exit(0);
    }

    // 変更されたファイルのリストを取得
    const files = execSync('git diff --name-only HEAD', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    })
      .split('\n')
      .filter(f => /\.(ts|tsx|js|jsx)$/.test(f) && fs.existsSync(f));

    let hasConsole = false;

    // 各ファイルでconsole.logをチェック
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('console.log')) {
        console.error(`[Hook] 警告: ${file} にconsole.logが見つかりました`);
        hasConsole = true;
      }
    }

    if (hasConsole) {
      console.error('[Hook] コミット前にconsole.log文を削除してください');
    }
  } catch (_error) {
    // エラーを静かに無視（gitが利用できない場合など）
  }

  // 常に元のデータを出力
  console.log(data);
});
