#!/bin/bash
# Continuous Learning v2 - 観測フック
#
# パターン分析のためにツール使用イベントをキャプチャする。
# Claude Codeは標準入力経由でフックデータをJSONとして渡す。
#
# フック設定 (~/.claude/settings.json 内):
#
# プラグインとしてインストールした場合、${CLAUDE_PLUGIN_ROOT}を使用:
# {
#   "hooks": {
#     "PreToolUse": [{
#       "matcher": "*",
#       "hooks": [{ "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/hooks/observe.sh pre" }]
#     }],
#     "PostToolUse": [{
#       "matcher": "*",
#       "hooks": [{ "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/hooks/observe.sh post" }]
#     }]
#   }
# }
#
# ~/.claude/skillsに手動でインストールした場合:
# {
#   "hooks": {
#     "PreToolUse": [{
#       "matcher": "*",
#       "hooks": [{ "type": "command", "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh pre" }]
#     }],
#     "PostToolUse": [{
#       "matcher": "*",
#       "hooks": [{ "type": "command", "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh post" }]
#     }]
#   }
# }

set -e

CONFIG_DIR="${HOME}/.claude/homunculus"
OBSERVATIONS_FILE="${CONFIG_DIR}/observations.jsonl"
MAX_FILE_SIZE_MB=10

# ディレクトリが存在することを確認
mkdir -p "$CONFIG_DIR"

# 無効化されている場合はスキップ
if [ -f "$CONFIG_DIR/disabled" ]; then
  exit 0
fi

# 標準入力からJSONを読み込む (Claude Codeフック形式)
INPUT_JSON=$(cat)

# 入力がない場合は終了
if [ -z "$INPUT_JSON" ]; then
  exit 0
fi

# Pythonを使用して解析 (複雑なJSONにはjqより信頼性が高い)
PARSED=$(python3 << EOF
import json
import sys

try:
    data = json.loads('''$INPUT_JSON''')

    # フィールドを抽出 - Claude Codeフック形式
    hook_type = data.get('hook_type', 'unknown')  # PreToolUse または PostToolUse
    tool_name = data.get('tool_name', data.get('tool', 'unknown'))
    tool_input = data.get('tool_input', data.get('input', {}))
    tool_output = data.get('tool_output', data.get('output', ''))
    session_id = data.get('session_id', 'unknown')

    # 大きな入力/出力を切り詰める
    if isinstance(tool_input, dict):
        tool_input_str = json.dumps(tool_input)[:5000]
    else:
        tool_input_str = str(tool_input)[:5000]

    if isinstance(tool_output, dict):
        tool_output_str = json.dumps(tool_output)[:5000]
    else:
        tool_output_str = str(tool_output)[:5000]

    # イベントタイプを判定
    event = 'tool_start' if 'Pre' in hook_type else 'tool_complete'

    print(json.dumps({
        'parsed': True,
        'event': event,
        'tool': tool_name,
        'input': tool_input_str if event == 'tool_start' else None,
        'output': tool_output_str if event == 'tool_complete' else None,
        'session': session_id
    }))
except Exception as e:
    print(json.dumps({'parsed': False, 'error': str(e)}))
EOF
)

# 解析が成功したかチェック
PARSED_OK=$(echo "$PARSED" | python3 -c "import json,sys; print(json.load(sys.stdin).get('parsed', False))")

if [ "$PARSED_OK" != "True" ]; then
  # フォールバック: デバッグ用に生の入力をログに記録
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "{\"timestamp\":\"$timestamp\",\"event\":\"parse_error\",\"raw\":$(echo "$INPUT_JSON" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()[:1000]))')}" >> "$OBSERVATIONS_FILE"
  exit 0
fi

# ファイルが大きすぎる場合はアーカイブ
if [ -f "$OBSERVATIONS_FILE" ]; then
  file_size_mb=$(du -m "$OBSERVATIONS_FILE" 2>/dev/null | cut -f1)
  if [ "${file_size_mb:-0}" -ge "$MAX_FILE_SIZE_MB" ]; then
    archive_dir="${CONFIG_DIR}/observations.archive"
    mkdir -p "$archive_dir"
    mv "$OBSERVATIONS_FILE" "$archive_dir/observations-$(date +%Y%m%d-%H%M%S).jsonl"
  fi
fi

# 観測データを構築して書き込む
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

python3 << EOF
import json

parsed = json.loads('''$PARSED''')
observation = {
    'timestamp': '$timestamp',
    'event': parsed['event'],
    'tool': parsed['tool'],
    'session': parsed['session']
}

if parsed['input']:
    observation['input'] = parsed['input']
if parsed['output']:
    observation['output'] = parsed['output']

with open('$OBSERVATIONS_FILE', 'a') as f:
    f.write(json.dumps(observation) + '\n')
EOF

# 実行中のオブザーバーにシグナルを送る
OBSERVER_PID_FILE="${CONFIG_DIR}/.observer.pid"
if [ -f "$OBSERVER_PID_FILE" ]; then
  observer_pid=$(cat "$OBSERVER_PID_FILE")
  if kill -0 "$observer_pid" 2>/dev/null; then
    kill -USR1 "$observer_pid" 2>/dev/null || true
  fi
fi

exit 0
