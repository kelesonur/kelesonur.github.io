#!/usr/bin/env python3
"""Local-only static server + DeepSeek chat proxy for LING313.

Binds to 127.0.0.1. Reads API key from .chat-secret (gitignored).
Does not expose the key to the browser.
"""

from __future__ import annotations

import json
import ssl
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

try:
    import certifi

    SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except Exception:
    SSL_CONTEXT = ssl.create_default_context()

HOST = "127.0.0.1"
PORT = 8765
ROOT = Path(__file__).resolve().parent
SECRET_PATH = ROOT / ".chat-secret"
DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"
DEEPSEEK_MODEL = "deepseek-flash"
MAX_TOKENS = 180
TEMPERATURE = 0.2


def load_api_key() -> str | None:
    try:
        if not SECRET_PATH.is_file():
            return None
        key = SECRET_PATH.read_text(encoding="utf-8").strip()
        return key or None
    except OSError:
        return None


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt: str, *args) -> None:
        # Avoid logging request bodies / Authorization.
        msg = fmt % args if args else fmt
        if "Authorization" in msg or "sk-" in msg:
            msg = "[redacted]"
        print("%s - %s" % (self.address_string(), msg))

    def _send_json(self, code: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path.split("?", 1)[0] == "/api/chat/status":
            self._send_json(200, {"connected": bool(load_api_key())})
            return
        super().do_GET()

    def do_POST(self) -> None:
        path = self.path.split("?", 1)[0]
        if path != "/api/chat":
            self.send_error(404, "Not Found")
            return

        key = load_api_key()
        if not key:
            self._send_json(
                503,
                {
                    "error": "not_connected",
                    "message": "The course assistant is not connected yet.",
                },
            )
            return

        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > 200_000:
            self._send_json(400, {"error": "bad_request", "message": "Invalid body."})
            return

        try:
            raw = self.rfile.read(length)
            data = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._send_json(400, {"error": "bad_request", "message": "Invalid JSON."})
            return

        messages = data.get("messages") if isinstance(data, dict) else None
        if not isinstance(messages, list) or not messages:
            self._send_json(400, {"error": "bad_request", "message": "Missing messages."})
            return

        upstream = {
            "model": DEEPSEEK_MODEL,
            "messages": messages,
            "temperature": TEMPERATURE,
            "max_tokens": MAX_TOKENS,
        }
        req = urllib.request.Request(
            DEEPSEEK_URL,
            data=json.dumps(upstream).encode("utf-8"),
            method="POST",
            headers={
                "Content-Type": "application/json",
                "Authorization": "Bearer " + key,
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=60, context=SSL_CONTEXT) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            try:
                detail = e.read().decode("utf-8", errors="replace")[:400]
            except Exception:
                detail = ""
            self._send_json(
                502,
                {
                    "error": "upstream",
                    "message": "Something went wrong. Please try again later or email the TA.",
                    "status": e.code,
                    "detail": detail[:120] if detail else "",
                },
            )
            return
        except Exception:
            self._send_json(
                502,
                {
                    "error": "upstream",
                    "message": "Something went wrong. Please try again later or email the TA.",
                },
            )
            return

        try:
            content = payload["choices"][0]["message"]["content"]
            if not isinstance(content, str) or not content.strip():
                raise KeyError("empty")
        except (KeyError, IndexError, TypeError):
            self._send_json(
                502,
                {
                    "error": "upstream",
                    "message": "Something went wrong. Please try again later or email the TA.",
                },
            )
            return

        self._send_json(200, {"reply": content.strip()})


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    connected = "yes" if load_api_key() else "no"
    print(
        "LING313 chat proxy on http://%s:%s/ (secret present: %s)"
        % (HOST, PORT, connected)
    )
    server.serve_forever()


if __name__ == "__main__":
    main()
