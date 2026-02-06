#!/bin/bash
# 戦略的コンパクト提案ツール
# PreToolUseまたは定期的に実行され、論理的な区切りで手動コンパクションを提案する
#
# 自動コンパクトではなく手動を使用する理由:
# - 自動コンパクトは任意のポイントで発生し、多くの場合タスクの途中
# - 戦略的コンパクションは論理的なフェーズを通じてコンテキストを保持
# - 探索後、実行前にコンパクト
# - マイルストーン完了後、次を開始する前にコンパクト
#
# フック設定 (~/.claude/settings.json 内):
# {
#   "hooks": {
#     "PreToolUse": [{
#       "matcher": "Edit|Write",
#       "hooks": [{
#         "type": "command",
#         "command": "~/.claude/skills/strategic-compact/suggest-compact.sh"
#       }]
#     }]
#   }
# }
#
# コンパクトを提案する基準:
# - セッションが長時間実行されている
# - 大量のツール呼び出しが行われた
# - 調査/探索から実装への移行
# - プランが確定した

# ツール呼び出し回数を追跡 (一時ファイルでインクリメント)
COUNTER_FILE="/tmp/claude-tool-count-$$"
THRESHOLD=${COMPACT_THRESHOLD:-50}

# カウンターを初期化または増加
if [ -f "$COUNTER_FILE" ]; then
  count=$(cat "$COUNTER_FILE")
  count=$((count + 1))
  echo "$count" > "$COUNTER_FILE"
else
  echo "1" > "$COUNTER_FILE"
  count=1
fi

# しきい値のツール呼び出し後にコンパクトを提案
if [ "$count" -eq "$THRESHOLD" ]; then
  echo "[StrategicCompact] $THRESHOLD 回のツール呼び出しに達しました - フェーズ移行時は /compact を検討してください" >&2
fi

# しきい値後は定期的に提案
if [ "$count" -gt "$THRESHOLD" ] && [ $((count % 25)) -eq 0 ]; then
  echo "[StrategicCompact] $count 回のツール呼び出し - コンテキストが古い場合は /compact の良いチェックポイントです" >&2
fi
