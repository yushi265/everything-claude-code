/**
 * Claude Code用セッションエイリアスライブラリ
 * ~/.claude/session-aliases.json に保存されたセッションエイリアスを管理します
 */

const fs = require('fs');
const path = require('path');

const {
  getClaudeDir,
  ensureDir,
  readFile,
  writeFile,
  log
} = require('./utils');

// エイリアスファイルパス
function getAliasesPath() {
  return path.join(getClaudeDir(), 'session-aliases.json');
}

// 現在のエイリアスストレージフォーマットバージョン
const ALIAS_VERSION = '1.0';

/**
 * デフォルトのエイリアスファイル構造
 */
function getDefaultAliases() {
  return {
    version: ALIAS_VERSION,
    aliases: {},
    metadata: {
      totalCount: 0,
      lastUpdated: new Date().toISOString()
    }
  };
}

/**
 * ファイルからエイリアスを読み込む
 * @returns {object} エイリアスオブジェクト
 */
function loadAliases() {
  const aliasesPath = getAliasesPath();

  if (!fs.existsSync(aliasesPath)) {
    return getDefaultAliases();
  }

  const content = readFile(aliasesPath);
  if (!content) {
    return getDefaultAliases();
  }

  try {
    const data = JSON.parse(content);

    // 構造を検証
    if (!data.aliases || typeof data.aliases !== 'object') {
      log('[Aliases] Invalid aliases file structure, resetting');
      return getDefaultAliases();
    }

    // versionフィールドを確保
    if (!data.version) {
      data.version = ALIAS_VERSION;
    }

    // メタデータを確保
    if (!data.metadata) {
      data.metadata = {
        totalCount: Object.keys(data.aliases).length,
        lastUpdated: new Date().toISOString()
      };
    }

    return data;
  } catch (err) {
    log(`[Aliases] Error parsing aliases file: ${err.message}`);
    return getDefaultAliases();
  }
}

/**
 * アトミックライトでエイリアスをファイルに保存
 * @param {object} aliases - 保存するエイリアスオブジェクト
 * @returns {boolean} 成功ステータス
 */
function saveAliases(aliases) {
  const aliasesPath = getAliasesPath();
  const tempPath = aliasesPath + '.tmp';
  const backupPath = aliasesPath + '.bak';

  try {
    // メタデータを更新
    aliases.metadata = {
      totalCount: Object.keys(aliases.aliases).length,
      lastUpdated: new Date().toISOString()
    };

    const content = JSON.stringify(aliases, null, 2);

    // ディレクトリの存在を確認
    ensureDir(path.dirname(aliasesPath));

    // ファイルが存在する場合はバックアップを作成
    if (fs.existsSync(aliasesPath)) {
      fs.copyFileSync(aliasesPath, backupPath);
    }

    // アトミックライト: 一時ファイルに書き込み、その後リネーム
    fs.writeFileSync(tempPath, content, 'utf8');

    // Windowsでは、リネーム前にターゲットファイルを削除する必要がある
    if (fs.existsSync(aliasesPath)) {
      fs.unlinkSync(aliasesPath);
    }
    fs.renameSync(tempPath, aliasesPath);

    // 成功時にバックアップを削除
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }

    return true;
  } catch (err) {
    log(`[Aliases] Error saving aliases: ${err.message}`);

    // バックアップが存在する場合は復元
    if (fs.existsSync(backupPath)) {
      try {
        fs.copyFileSync(backupPath, aliasesPath);
        log('[Aliases] Restored from backup');
      } catch (restoreErr) {
        log(`[Aliases] Failed to restore backup: ${restoreErr.message}`);
      }
    }

    // 一時ファイルをクリーンアップ
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    return false;
  }
}

/**
 * エイリアスを解決してセッションパスを取得
 * @param {string} alias - 解決するエイリアス名
 * @returns {object|null} エイリアスデータ、見つからない場合はnull
 */
function resolveAlias(alias) {
  // エイリアス名を検証 (英数字、ダッシュ、アンダースコア)
  if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
    return null;
  }

  const data = loadAliases();
  const aliasData = data.aliases[alias];

  if (!aliasData) {
    return null;
  }

  return {
    alias,
    sessionPath: aliasData.sessionPath,
    createdAt: aliasData.createdAt,
    title: aliasData.title || null
  };
}

/**
 * セッションのエイリアスを設定または更新
 * @param {string} alias - エイリアス名 (英数字、ダッシュ、アンダースコア)
 * @param {string} sessionPath - セッションディレクトリパス
 * @param {string} title - エイリアスのオプションタイトル
 * @returns {object} 成功ステータスとメッセージを含む結果
 */
function setAlias(alias, sessionPath, title = null) {
  // エイリアス名を検証
  if (!alias || alias.length === 0) {
    return { success: false, error: 'Alias name cannot be empty' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
    return { success: false, error: 'Alias name must contain only letters, numbers, dashes, and underscores' };
  }

  // 予約されたエイリアス名
  const reserved = ['list', 'help', 'remove', 'delete', 'create', 'set'];
  if (reserved.includes(alias.toLowerCase())) {
    return { success: false, error: `'${alias}' is a reserved alias name` };
  }

  const data = loadAliases();
  const existing = data.aliases[alias];
  const isNew = !existing;

  data.aliases[alias] = {
    sessionPath,
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: title || null
  };

  if (saveAliases(data)) {
    return {
      success: true,
      isNew,
      alias,
      sessionPath,
      title: data.aliases[alias].title
    };
  }

  return { success: false, error: 'Failed to save alias' };
}

/**
 * すべてのエイリアスをリスト表示
 * @param {object} options - オプションオブジェクト
 * @param {string} options.search - 名前でエイリアスをフィルタ (部分一致)
 * @param {number} options.limit - 返す最大エイリアス数
 * @returns {Array} エイリアスオブジェクトの配列
 */
function listAliases(options = {}) {
  const { search = null, limit = null } = options;
  const data = loadAliases();

  let aliases = Object.entries(data.aliases).map(([name, info]) => ({
    name,
    sessionPath: info.sessionPath,
    createdAt: info.createdAt,
    updatedAt: info.updatedAt,
    title: info.title
  }));

  // 更新時刻でソート (新しい順)
  aliases.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  // 検索フィルタを適用
  if (search) {
    const searchLower = search.toLowerCase();
    aliases = aliases.filter(a =>
      a.name.toLowerCase().includes(searchLower) ||
      (a.title && a.title.toLowerCase().includes(searchLower))
    );
  }

  // 上限を適用
  if (limit && limit > 0) {
    aliases = aliases.slice(0, limit);
  }

  return aliases;
}

/**
 * Delete an alias
 * @param {string} alias - Alias name to delete
 * @returns {object} Result with success status
 */
function deleteAlias(alias) {
  const data = loadAliases();

  if (!data.aliases[alias]) {
    return { success: false, error: `Alias '${alias}' not found` };
  }

  const deleted = data.aliases[alias];
  delete data.aliases[alias];

  if (saveAliases(data)) {
    return {
      success: true,
      alias,
      deletedSessionPath: deleted.sessionPath
    };
  }

  return { success: false, error: 'Failed to delete alias' };
}

/**
 * Rename an alias
 * @param {string} oldAlias - Current alias name
 * @param {string} newAlias - New alias name
 * @returns {object} Result with success status
 */
function renameAlias(oldAlias, newAlias) {
  const data = loadAliases();

  if (!data.aliases[oldAlias]) {
    return { success: false, error: `Alias '${oldAlias}' not found` };
  }

  if (data.aliases[newAlias]) {
    return { success: false, error: `Alias '${newAlias}' already exists` };
  }

  // Validate new alias name
  if (!/^[a-zA-Z0-9_-]+$/.test(newAlias)) {
    return { success: false, error: 'New alias name must contain only letters, numbers, dashes, and underscores' };
  }

  const aliasData = data.aliases[oldAlias];
  delete data.aliases[oldAlias];

  aliasData.updatedAt = new Date().toISOString();
  data.aliases[newAlias] = aliasData;

  if (saveAliases(data)) {
    return {
      success: true,
      oldAlias,
      newAlias,
      sessionPath: aliasData.sessionPath
    };
  }

  // Restore old alias on failure
  data.aliases[oldAlias] = aliasData;
  return { success: false, error: 'Failed to rename alias' };
}

/**
 * Get session path by alias (convenience function)
 * @param {string} aliasOrId - Alias name or session ID
 * @returns {string|null} Session path or null if not found
 */
function resolveSessionAlias(aliasOrId) {
  // First try to resolve as alias
  const resolved = resolveAlias(aliasOrId);
  if (resolved) {
    return resolved.sessionPath;
  }

  // If not an alias, return as-is (might be a session path)
  return aliasOrId;
}

/**
 * Update alias title
 * @param {string} alias - Alias name
 * @param {string} title - New title
 * @returns {object} Result with success status
 */
function updateAliasTitle(alias, title) {
  const data = loadAliases();

  if (!data.aliases[alias]) {
    return { success: false, error: `Alias '${alias}' not found` };
  }

  data.aliases[alias].title = title;
  data.aliases[alias].updatedAt = new Date().toISOString();

  if (saveAliases(data)) {
    return {
      success: true,
      alias,
      title
    };
  }

  return { success: false, error: 'Failed to update alias title' };
}

/**
 * Get all aliases for a specific session
 * @param {string} sessionPath - Session path to find aliases for
 * @returns {Array} Array of alias names
 */
function getAliasesForSession(sessionPath) {
  const data = loadAliases();
  const aliases = [];

  for (const [name, info] of Object.entries(data.aliases)) {
    if (info.sessionPath === sessionPath) {
      aliases.push({
        name,
        createdAt: info.createdAt,
        title: info.title
      });
    }
  }

  return aliases;
}

/**
 * Clean up aliases for non-existent sessions
 * @param {Function} sessionExists - Function to check if session exists
 * @returns {object} Cleanup result
 */
function cleanupAliases(sessionExists) {
  const data = loadAliases();
  const removed = [];

  for (const [name, info] of Object.entries(data.aliases)) {
    if (!sessionExists(info.sessionPath)) {
      removed.push({ name, sessionPath: info.sessionPath });
      delete data.aliases[name];
    }
  }

  if (removed.length > 0) {
    saveAliases(data);
  }

  return {
    totalChecked: Object.keys(data.aliases).length + removed.length,
    removed: removed.length,
    removedAliases: removed
  };
}

module.exports = {
  getAliasesPath,
  loadAliases,
  saveAliases,
  resolveAlias,
  setAlias,
  listAliases,
  deleteAlias,
  renameAlias,
  resolveSessionAlias,
  updateAliasTitle,
  getAliasesForSession,
  cleanupAliases
};
