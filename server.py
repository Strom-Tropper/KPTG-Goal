#!/usr/bin/env python3
# đọc file tĩnh, và ghi 2 file json khi game gửi lên
import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BALANCE = ROOT / 'data' / 'balance.json'
HISTORY = ROOT / 'data' / 'history.json'
os.chdir(ROOT)

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_POST(self):
        path = self.path.split('?', 1)[0]
        length = int(self.headers.get('Content-Length', '0'))
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw.decode('utf-8'))
        except json.JSONDecodeError:
            self.send_error(400)
            return
        if path == '/data/balance.json':
            balance = data.get('balance') if isinstance(data, dict) else None
            if isinstance(balance, bool) or not isinstance(balance, (int, float)):
                self.send_error(400)
                return
            BALANCE.write_text(json.dumps({'balance': balance}, indent=4) + '\n', encoding='utf-8')
        elif path == '/data/history.json':
            if not isinstance(data, list):
                self.send_error(400)
                return
            HISTORY.write_text(json.dumps(data, indent=4) + '\n', encoding='utf-8')
        else:
            self.send_error(404)
            return
        self.send_response(204)
        self.end_headers()

if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', 8765), Handler)
    print('http://127.0.0.1:8765')
    server.serve_forever()
