#!/bin/bash
cd "$(dirname "$0")"
URL="http://127.0.0.1:8765/index.html"

if curl -sf -o /dev/null --max-time 1 "$URL"; then
    open "$URL"
    exit 0
fi

python3 server.py &
PID=$!

for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
    if curl -sf -o /dev/null --max-time 1 "$URL"; then
        open "$URL"
        echo "Game đang chạy: $URL"
        echo "Tắt cửa sổ này là server dừng."
        wait "$PID"
        exit 0
    fi
    sleep 0.2
done

echo "Không mở được server"
kill "$PID" 2>/dev/null
exit 1
