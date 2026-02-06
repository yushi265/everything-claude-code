/**
 * Claude Code用セッションマネージャーライブラリ
 * セッションの一覧表示、読み込み、管理のためのコアCRUD操作を提供
 *
 * セッションは ~/.claude/sessions/ にマークダウンファイルとして保存され、形式は:
 * - YYYY-MM-DD-session.tmp (旧形式)
 * - YYYY-MM-DD-<short-id>-session.tmp (新形式)
 */

const fs = require('fs');
const path = require('path');

const {
  getSessionsDir,
  readFile,
  log
} = require('./utils');

// セッションファイル名パターン: YYYY-MM-DD-[short-id]-session.tmp
// short-idはオプション（旧形式）で、8文字以上の英数字
// マッチ: "2026-02-01-session.tmp" または "2026-02-01-a1b2c3d4-session.tmp"
const SESSION_FILENAME_REGEX = /^(\d{4}-\d{2}-\d{2})(?:-([a-z0-9]{8,}))?-session\.tmp$/;

/**
 * セッションファイル名を解析してメタデータを抽出する
 * @param {string} filename - セッションファイル名（例: "2026-01-17-abc123-session.tmp" または "2026-01-17-session.tmp"）
 * @returns {object|null} 解析されたメタデータまたは無効な場合はnull
 */
function parseSessionFilename(filename) {
  const match = filename.match(SESSION_FILENAME_REGEX);
  if (!match) return null;

  const dateStr = match[1];
  // match[2]は旧形式（IDなし）の場合undefined
  const shortId = match[2] || 'no-id';

  return {
    filename,
    shortId,
    date: dateStr,
    // 日付文字列をDateオブジェクトに変換
    datetime: new Date(dateStr)
  };
}

/**
 * セッションファイルへのフルパスを取得する
 * @param {string} filename - セッションファイル名
 * @returns {string} セッションファイルへのフルパス
 */
function getSessionPath(filename) {
  return path.join(getSessionsDir(), filename);
}

/**
 * セッションのマークダウンコンテンツを読み込んで解析する
 * @param {string} sessionPath - セッションファイルへのフルパス
 * @returns {string|null} セッションコンテンツまたは見つからない場合はnull
 */
function getSessionContent(sessionPath) {
  if (!fs.existsSync(sessionPath)) {
    return null;
  }

  return readFile(sessionPath);
}

/**
 * マークダウンコンテンツからセッションメタデータを解析する
 * @param {string} content - セッションのマークダウンコンテンツ
 * @returns {object} 解析されたメタデータ
 */
function parseSessionMetadata(content) {
  const metadata = {
    title: null,
    date: null,
    started: null,
    lastUpdated: null,
    completed: [],
    inProgress: [],
    notes: '',
    context: ''
  };

  if (!content) return metadata;

  // 最初の見出しからタイトルを抽出
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    metadata.title = titleMatch[1].trim();
  }

  // 日付を抽出
  const dateMatch = content.match(/\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    metadata.date = dateMatch[1];
  }

  // 開始時刻を抽出
  const startedMatch = content.match(/\*\*Started:\*\*\s*([\d:]+)/);
  if (startedMatch) {
    metadata.started = startedMatch[1];
  }

  // 最終更新時刻を抽出
  const updatedMatch = content.match(/\*\*Last Updated:\*\*\s*([\d:]+)/);
  if (updatedMatch) {
    metadata.lastUpdated = updatedMatch[1];
  }

  // 完了したアイテムを抽出
  const completedSection = content.match(/### Completed\s*\n([\s\S]*?)(?=###|\n\n|$)/);
  if (completedSection) {
    const items = completedSection[1].match(/- \[x\]\s*(.+)/g);
    if (items) {
      metadata.completed = items.map(item => item.replace(/- \[x\]\s*/, '').trim());
    }
  }

  // 進行中のアイテムを抽出
  const progressSection = content.match(/### In Progress\s*\n([\s\S]*?)(?=###|\n\n|$)/);
  if (progressSection) {
    const items = progressSection[1].match(/- \[ \]\s*(.+)/g);
    if (items) {
      metadata.inProgress = items.map(item => item.replace(/- \[ \]\s*/, '').trim());
    }
  }

  // ノートを抽出
  const notesSection = content.match(/### Notes for Next Session\s*\n([\s\S]*?)(?=###|\n\n|$)/);
  if (notesSection) {
    metadata.notes = notesSection[1].trim();
  }

  // ロードするコンテキストを抽出
  const contextSection = content.match(/### Context to Load\s*\n```\n([\s\S]*?)```/);
  if (contextSection) {
    metadata.context = contextSection[1].trim();
  }

  return metadata;
}

/**
 * セッションの統計を計算する
 * @param {string} sessionPath - セッションファイルへのフルパス
 * @returns {object} 統計オブジェクト
 */
function getSessionStats(sessionPath) {
  const content = getSessionContent(sessionPath);
  const metadata = parseSessionMetadata(content);

  return {
    totalItems: metadata.completed.length + metadata.inProgress.length,
    completedItems: metadata.completed.length,
    inProgressItems: metadata.inProgress.length,
    lineCount: content ? content.split('\n').length : 0,
    hasNotes: !!metadata.notes,
    hasContext: !!metadata.context
  };
}

/**
 * オプションのフィルタリングとページネーション付きですべてのセッションを取得する
 * @param {object} options - オプションオブジェクト
 * @param {number} options.limit - 返すセッションの最大数
 * @param {number} options.offset - スキップするセッションの数
 * @param {string} options.date - 日付でフィルタ（YYYY-MM-DD形式）
 * @param {string} options.search - ショートIDで検索
 * @returns {object} セッション配列とページネーション情報を含むオブジェクト
 */
function getAllSessions(options = {}) {
  const {
    limit = 50,
    offset = 0,
    date = null,
    search = null
  } = options;

  const sessionsDir = getSessionsDir();

  if (!fs.existsSync(sessionsDir)) {
    return { sessions: [], total: 0, offset, limit, hasMore: false };
  }

  const entries = fs.readdirSync(sessionsDir, { withFileTypes: true });
  const sessions = [];

  for (const entry of entries) {
    // ファイル以外はスキップ（.tmpファイルのみ処理）
    if (!entry.isFile() || !entry.name.endsWith('.tmp')) continue;

    const filename = entry.name;
    const metadata = parseSessionFilename(filename);

    if (!metadata) continue;

    // 日付フィルタを適用
    if (date && metadata.date !== date) {
      continue;
    }

    // 検索フィルタを適用（ショートIDで検索）
    if (search && !metadata.shortId.includes(search)) {
      continue;
    }

    const sessionPath = path.join(sessionsDir, filename);

    // ファイル統計を取得
    const stats = fs.statSync(sessionPath);

    sessions.push({
      ...metadata,
      sessionPath,
      hasContent: stats.size > 0,
      size: stats.size,
      modifiedTime: stats.mtime,
      createdTime: stats.birthtime
    });
  }

  // 変更時刻でソート（新しい順）
  sessions.sort((a, b) => b.modifiedTime - a.modifiedTime);

  // ページネーションを適用
  const paginatedSessions = sessions.slice(offset, offset + limit);

  return {
    sessions: paginatedSessions,
    total: sessions.length,
    offset,
    limit,
    hasMore: offset + limit < sessions.length
  };
}

/**
 * IDでセッションを1つ取得する（ショートIDまたはフルパス）
 * @param {string} sessionId - ショートIDまたはセッションファイル名
 * @param {boolean} includeContent - セッションコンテンツを含めるか
 * @returns {object|null} セッションオブジェクトまたは見つからない場合はnull
 */
function getSessionById(sessionId, includeContent = false) {
  const sessionsDir = getSessionsDir();

  if (!fs.existsSync(sessionsDir)) {
    return null;
  }

  const entries = fs.readdirSync(sessionsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.tmp')) continue;

    const filename = entry.name;
    const metadata = parseSessionFilename(filename);

    if (!metadata) continue;

    // セッションIDがマッチするかチェック（ショートIDまたは.tmpなしのフルファイル名）
    const shortIdMatch = metadata.shortId !== 'no-id' && metadata.shortId.startsWith(sessionId);
    const filenameMatch = filename === sessionId || filename === `${sessionId}.tmp`;
    const noIdMatch = metadata.shortId === 'no-id' && filename === `${sessionId}-session.tmp`;

    if (!shortIdMatch && !filenameMatch && !noIdMatch) {
      continue;
    }

    const sessionPath = path.join(sessionsDir, filename);
    const stats = fs.statSync(sessionPath);

    const session = {
      ...metadata,
      sessionPath,
      size: stats.size,
      modifiedTime: stats.mtime,
      createdTime: stats.birthtime
    };

    if (includeContent) {
      session.content = getSessionContent(sessionPath);
      session.metadata = parseSessionMetadata(session.content);
      session.stats = getSessionStats(sessionPath);
    }

    return session;
  }

  return null;
}

/**
 * コンテンツからセッションタイトルを取得する
 * @param {string} sessionPath - セッションファイルへのフルパス
 * @returns {string} タイトルまたはデフォルトテキスト
 */
function getSessionTitle(sessionPath) {
  const content = getSessionContent(sessionPath);
  const metadata = parseSessionMetadata(content);

  return metadata.title || 'Untitled Session';
}

/**
 * セッションサイズを人間が読める形式でフォーマットする
 * @param {string} sessionPath - セッションファイルへのフルパス
 * @returns {string} フォーマットされたサイズ（例: "1.2 KB"）
 */
function getSessionSize(sessionPath) {
  if (!fs.existsSync(sessionPath)) {
    return '0 B';
  }

  const stats = fs.statSync(sessionPath);
  const size = stats.size;

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * セッションコンテンツをファイルに書き込む
 * @param {string} sessionPath - セッションファイルへのフルパス
 * @param {string} content - 書き込むマークダウンコンテンツ
 * @returns {boolean} 成功状態
 */
function writeSessionContent(sessionPath, content) {
  try {
    fs.writeFileSync(sessionPath, content, 'utf8');
    return true;
  } catch (err) {
    log(`[SessionManager] Error writing session: ${err.message}`);
    return false;
  }
}

/**
 * セッションにコンテンツを追記する
 * @param {string} sessionPath - セッションファイルへのフルパス
 * @param {string} content - 追記するコンテンツ
 * @returns {boolean} 成功状態
 */
function appendSessionContent(sessionPath, content) {
  try {
    fs.appendFileSync(sessionPath, content, 'utf8');
    return true;
  } catch (err) {
    log(`[SessionManager] Error appending to session: ${err.message}`);
    return false;
  }
}

/**
 * セッションファイルを削除する
 * @param {string} sessionPath - セッションファイルへのフルパス
 * @returns {boolean} 成功状態
 */
function deleteSession(sessionPath) {
  try {
    if (fs.existsSync(sessionPath)) {
      fs.unlinkSync(sessionPath);
      return true;
    }
    return false;
  } catch (err) {
    log(`[SessionManager] Error deleting session: ${err.message}`);
    return false;
  }
}

/**
 * セッションが存在するかチェックする
 * @param {string} sessionPath - セッションファイルへのフルパス
 * @returns {boolean} セッションが存在する場合true
 */
function sessionExists(sessionPath) {
  return fs.existsSync(sessionPath) && fs.statSync(sessionPath).isFile();
}

module.exports = {
  parseSessionFilename,
  getSessionPath,
  getSessionContent,
  parseSessionMetadata,
  getSessionStats,
  getSessionTitle,
  getSessionSize,
  getAllSessions,
  getSessionById,
  writeSessionContent,
  appendSessionContent,
  deleteSession,
  sessionExists
};
