import concurrent.futures
import contextlib
import http.client
import json
import sqlite3
import tempfile
import threading
import unittest
from pathlib import Path

from server import make_server, SERIES, LIMIT


class CounterTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.db = Path(self.tmp.name) / "aggregate.sqlite3"
        self.start()

    def start(self):
        self.httpd = make_server(self.db, port=0)
        self.thread = threading.Thread(target=self.httpd.serve_forever, daemon=True)
        self.thread.start()
        self.origin = self.httpd.allowed_origin

    def stop(self):
        if getattr(self, "httpd", None) is not None:
            self.httpd.shutdown()
            self.httpd.server_close()
            self.thread.join(timeout=5)
            self.httpd = None

    def tearDown(self):
        self.stop()

    def call(self, method="GET", path="/api/visits", headers=None, body=None):
        with contextlib.closing(http.client.HTTPConnection("127.0.0.1", self.httpd.server_port, timeout=10)) as conn:
            conn.request(method, path, body=body, headers=headers or {})
            with conn.getresponse() as response:
                raw = response.read()
                return response.status, json.loads(raw) if raw else None, dict(response.getheaders())

    def post(self):
        return self.call("POST", headers={"Origin": self.origin, "Sec-Fetch-Site": "same-origin"})

    def test_reads_and_real_increment(self):
        self.assertEqual(self.call()[:2], (200, {"series": SERIES, "value": 0}))
        status, result, headers = self.post()
        self.assertEqual((status, result), (200, {"series": SERIES, "value": 1}))
        self.assertNotIn("Set-Cookie", headers)
        self.assertNotIn("Access-Control-Allow-Origin", headers)
        self.assertEqual(headers["Cache-Control"], "no-store, max-age=0")
        self.assertEqual(self.call()[1]["value"], 1)

    def test_cross_origin_host_and_method_denied(self):
        self.assertEqual(self.call("POST")[0], 403)
        self.assertEqual(self.call("POST", headers={"Origin":"https://invalid.example"})[0], 403)
        self.assertEqual(self.call("POST", headers={"Origin":self.origin,"Sec-Fetch-Site":"cross-site"})[0], 403)
        self.assertEqual(self.call("GET", headers={"Host":"invalid.example"})[0], 404)
        self.assertEqual(self.call("DELETE")[0], 405)
        self.assertEqual(self.call("GET", "/api/visits?x=1")[0], 404)
        self.assertEqual(self.call("POST", headers={"Origin":self.origin}, body=b"private")[0], 400)
        self.assertEqual(self.call()[1]["value"], 0)

    def test_concurrent_increments_are_atomic(self):
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(lambda _: self.post(), range(24)))
        self.assertTrue(all(r[0] == 200 for r in results))
        self.assertEqual(sorted(r[1]["value"] for r in results), list(range(1,25)))
        self.assertEqual(self.call()[1]["value"], 24)

    def test_persistence_and_minimal_schema_after_restart(self):
        self.post()
        self.stop()
        self.start()
        self.assertEqual(self.call()[1]["value"], 1)
        with contextlib.closing(sqlite3.connect(self.db)) as db:
            self.assertEqual(db.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall(), [("visits",)])
            self.assertEqual([x[1] for x in db.execute("PRAGMA table_info(visits)")], ["name","value"])
            self.assertEqual(db.execute("SELECT * FROM visits").fetchall(), [("homepage",1)])

    def test_safe_integer_limit_does_not_overflow(self):
        with contextlib.closing(sqlite3.connect(self.db)) as db:
            with db:
                db.execute("UPDATE visits SET value=?", (LIMIT,))
        self.assertEqual(self.post()[0], 503)
        self.assertEqual(self.call()[1]["value"], LIMIT)


if __name__ == "__main__":
    unittest.main()
