#!/bin/bash
# Continuous Learning - セッション評価ツール
# Stopフックで実行され、Claude Codeセッションから再利用可能なパターンを抽出する
#
# UserPromptSubmitの代わりにStopフックを使用する理由:
# - Stopはセッション終了時に一度だけ実行される（軽量）
# - UserPromptSubmitは毎メッセージ実行される（重い、レイテンシを追加）
#
# フック設定 (~/.claude/settings.json 内):
# {
#   "hooks": {
#     "Stop": [{
#       "matcher": "*",
#       "hooks": [{
#         "type": "command",
#         "command": "~/.claude/skills/continuous-learning/evaluate-session.sh"
#       }]
#     }]
#   }
# }
#
# 検出するパターン: error_resolution, debugging_techniques, workarounds, project_specific
# 無視するパターン: simple_typos, one_time_fixes, external_api_issues
# 抽出したスキルの保存先: ~/.claude/skills/learned/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/config.json"
LEARNED_SKILLS_PATH="${HOME}/.claude/skills/learned"
MIN_SESSION_LENGTH=10

# 設定ファイルが存在する場合は読み込む
if [ -f "$CONFIG_FILE" ]; then
  MIN_SESSION_LENGTH=$(jq -r '.min_session_length // 10' "$CONFIG_FILE")
  LEARNED_SKILLS_PATH=$(jq -r '.learned_skills_path // "~/.claude/skills/learned/"' "$CONFIG_FILE" | sed "s|~|$HOME|")
fi

# 学習したスキルのディレクトリが存在することを確認
mkdir -p "$LEARNED_SKILLS_PATH"

# 環境変数からトランスクリプトパスを取得 (Claude Codeによって設定される)
transcript_path="${CLAUDE_TRANSCRIPT_PATH:-}"

if [ -z "$transcript_path" ] || [ ! -f "$transcript_path" ]; then
  exit 0
fi

# セッション内のメッセージ数をカウント
message_count=$(grep -c '"type":"user"' "$transcript_path" 2>/dev/null || echo "0")

# 短いセッションはスキップ
if [ "$message_count" -lt "$MIN_SESSION_LENGTH" ]; then
  echo "[ContinuousLearning] セッションが短すぎます ($message_count メッセージ)、スキップします" >&2
  exit 0
fi

# Claudeにセッションを抽出可能なパターンとして評価すべきことを通知
echo "[ContinuousLearning] セッションには $message_count メッセージがあります - 抽出可能なパターンを評価します" >&2
echo "[ContinuousLearning] 学習したスキルの保存先: $LEARNED_SKILLS_PATH" >&2
