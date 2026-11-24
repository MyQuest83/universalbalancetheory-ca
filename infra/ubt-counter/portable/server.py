"""Portable UBT counter: aggregate SQLite only, loopback HTTP transport.

Use for local testing or behind an independently approved, hardened HTTPS proxy.
The standard-library HTTP server is NOT a public production web server.
No third-party SDK, visitor identifiers, or application request logs.
"""
import argparse
import json
import sqlite3
from contextlib import closing
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

SERIES = "homepage-openings-v1"
LIMIT = 2**53 - 1
MIGRATION = Path(__file__).resolve().parents[1] / "migrations" / "0001_homepage_visits.sql"


class Aggregate:
    def __init__(self, database):
        self.database = str(database)
        with closing(sqlite3.connect(self.database, timeout=5)) as conn:
            with conn:
                conn.executescript(MIGRATION.read_text(encoding="utf-8"))

    def value(self, increment=False):
        with closing(sqlite3.connect(self.database, timeout=5)) as conn:
            with conn:
                if increment:
                    row = conn.execute(
                        "UPDATE visits SET value=value+1 "
                        "WHERE name='homepage' AND value<? RETURNING value", (LIMIT,)
                    ).fetchone()
                else:
                    row = conn.execute("SELECT value FROM visits WHERE name='homepage'").fetchone()
                if row is None or type(row[0]) is not int or not 0 <= row[0] <= LIMIT:
                    raise ValueError("Invalid aggregate")
                return row[0]


class LocalServer(ThreadingHTTPServer):
    daemon_threads = True
    def handle_error(self, request, client_address):
        # Do not print connection metadata or exceptions in the application.
        pass


def make_server(database, origin=None, port=8787):
    store = Aggregate(database)
    if origin is not None:
        parts = urlsplit(origin)
        if (parts.scheme not in ("https", "http") or not parts.hostname or
                parts.username or parts.password or parts.path or parts.query or
                parts.fragment or origin != f"{parts.scheme}://{parts.netloc}" or
                (parts.scheme == "http" and parts.hostname not in ("127.0.0.1", "localhost"))):
            raise ValueError("Specify one exact HTTPS origin, or a loopback HTTP origin")

    class Handler(BaseHTTPRequestHandler):
        def setup(self):
            super().setup()
            self.connection.settimeout(5)

        def log_message(self, *args):
            pass

        def reply(self, status, payload, extra=None):
            content = json.dumps(payload, separators=(",", ":")).encode("utf-8")
            self.send_response(status)
            for name, val in {
                "Content-Type": "application/json; charset=utf-8",
                "Content-Length": str(len(content)),
                "Cache-Control": "no-store, max-age=0",
                "Referrer-Policy": "no-referrer",
                "Cross-Origin-Resource-Policy": "same-origin",
                "X-Content-Type-Options": "nosniff",
                "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
                "Connection": "close",
                **(extra or {}),
            }.items():
                self.send_header(name, val)
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(content)
            self.close_connection = True

        def dispatch(self):
            allowed = self.server.allowed_origin
            if self.headers.get("Host") != urlsplit(allowed).netloc:
                return self.reply(404, {"error": "Not found"})
            if self.path != "/api/visits":
                return self.reply(404, {"error": "Not found"})
            if self.command not in ("GET", "POST"):
                return self.reply(405, {"error": "Method not allowed"}, {"Allow": "GET, POST"})
            if self.headers.get("Transfer-Encoding") is not None or self.headers.get("Content-Length", "0") != "0":
                return self.reply(400, {"error": "No request body expected"})
            if self.command == "POST":
                if self.headers.get("Origin") != allowed or self.headers.get("Sec-Fetch-Site", "same-origin") != "same-origin":
                    return self.reply(403, {"error": "Same-origin request required"})
            try:
                number = store.value(self.command == "POST")
            except (ValueError, sqlite3.Error):
                return self.reply(503, {"error": "Counter unavailable"})
            return self.reply(200, {"series": SERIES, "value": number})

        do_GET = do_POST = do_HEAD = do_OPTIONS = do_PUT = do_DELETE = do_PATCH = dispatch

    httpd = LocalServer(("127.0.0.1", port), Handler)
    httpd.allowed_origin = origin or f"http://127.0.0.1:{httpd.server_port}"
    return httpd


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", required=True, help="SQLite file outside the public repository")
    parser.add_argument("--port", type=int, default=8787)
    parser.add_argument("--origin", help="Exact approved origin; default is local loopback")
    args = parser.parse_args()
    if not 0 <= args.port <= 65535:
        parser.error("Invalid port")
    database = Path(args.db).expanduser().resolve()
    repo_root = Path(__file__).resolve().parents[3]
    if database.is_relative_to(repo_root):
        parser.error("The database must live outside the public repository")
    with make_server(database, args.origin, args.port) as httpd:
        print(f"Counter listening on loopback port {httpd.server_port}; origin: {httpd.allowed_origin}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
