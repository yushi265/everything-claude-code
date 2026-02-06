#!/bin/bash
# Continuous Learning v2 - オブザーバーエージェント起動スクリプト
#
# 観測データを分析して本能ファイルを生成するバックグラウンドオブザーバーエージェントを起動する。
# コスト効率のためHaikuモデルを使用する。
#
# 使い方:
#   start-observer.sh        # オブザーバーをバックグラウンドで起動
#   start-observer.sh stop   # 実行中のオブザーバーを停止
#   start-observer.sh status # オブザーバーの実行状態を確認

set -e

CONFIG_DIR="${HOME}/.claude/homunculus"
PID_FILE="${CONFIG_DIR}/.observer.pid"
LOG_FILE="${CONFIG_DIR}/observer.log"
OBSERVATIONS_FILE="${CONFIG_DIR}/observations.jsonl"

mkdir -p "$CONFIG_DIR"

case "${1:-start}" in
  stop)
    if [ -f "$PID_FILE" ]; then
      pid=$(cat "$PID_FILE")
      if kill -0 "$pid" 2>/dev/null; then
        echo "オブザーバーを停止中 (PID: $pid)..."
        kill "$pid"
        rm -f "$PID_FILE"
        echo "オブザーバーを停止しました。"
      else
        echo "オブザーバーは実行されていません（古いPIDファイル）。"
        rm -f "$PID_FILE"
      fi
    else
      echo "オブザーバーは実行されていません。"
    fi
    exit 0
    ;;

  status)
    if [ -f "$PID_FILE" ]; then
      pid=$(cat "$PID_FILE")
      if kill -0 "$pid" 2>/dev/null; then
        echo "オブザーバーは実行中です (PID: $pid)"
        echo "ログ: $LOG_FILE"
        echo "観測データ: $(wc -l < "$OBSERVATIONS_FILE" 2>/dev/null || echo 0) 行"
        exit 0
      else
        echo "オブザーバーは実行されていません（古いPIDファイル）"
        rm -f "$PID_FILE"
        exit 1
      fi
    else
      echo "オブザーバーは実行されていません"
      exit 1
    fi
    ;;

  start)
    # 既に実行中かチェック
    if [ -f "$PID_FILE" ]; then
      pid=$(cat "$PID_FILE")
      if kill -0 "$pid" 2>/dev/null; then
        echo "オブザーバーは既に実行中です (PID: $pid)"
        exit 0
      fi
      rm -f "$PID_FILE"
    fi

    echo "オブザーバーエージェントを起動中..."

    # オブザーバーループ
    (
      trap 'rm -f "$PID_FILE"; exit 0' TERM INT

      analyze_observations() {
        # 十分な観測データがある場合のみ分析
        obs_count=$(wc -l < "$OBSERVATIONS_FILE" 2>/dev/null || echo 0)
        if [ "$obs_count" -lt 10 ]; then
          return
        fi

        echo "[$(date)] $obs_count 件の観測データを分析中..." >> "$LOG_FILE"

        # Claude Code (Haiku) を使用して観測データを分析
        # 高速な分析セッションを生成
        if command -v claude &> /dev/null; then
          claude --model haiku --max-turns 3 --print \
            "Read $OBSERVATIONS_FILE and identify patterns. If you find 3+ occurrences of the same pattern, create an instinct file in $CONFIG_DIR/instincts/personal/ following the format in the observer agent spec. Be conservative - only create instincts for clear patterns." \
            >> "$LOG_FILE" 2>&1 || true
        fi

        # 処理済み観測データをアーカイブ
        if [ -f "$OBSERVATIONS_FILE" ]; then
          archive_dir="${CONFIG_DIR}/observations.archive"
          mkdir -p "$archive_dir"
          mv "$OBSERVATIONS_FILE" "$archive_dir/processed-$(date +%Y%m%d-%H%M%S).jsonl"
          touch "$OBSERVATIONS_FILE"
        fi
      }

      # オンデマンド分析用にSIGUSR1を処理
      trap 'analyze_observations' USR1

      echo "$$" > "$PID_FILE"
      echo "[$(date)] オブザーバー起動 (PID: $$)" >> "$LOG_FILE"

      while true; do
        # 5分ごとにチェック
        sleep 300

        analyze_observations
      done
    ) &

    disown

    # PIDファイル生成を待つ
    sleep 1

    if [ -f "$PID_FILE" ]; then
      echo "オブザーバーを起動しました (PID: $(cat "$PID_FILE"))"
      echo "ログ: $LOG_FILE"
    else
      echo "オブザーバーの起動に失敗しました"
      exit 1
    fi
    ;;

  *)
    echo "使い方: $0 {start|stop|status}"
    exit 1
    ;;
esac
