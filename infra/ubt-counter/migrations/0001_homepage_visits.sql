-- Only one aggregate total is stored. No visitor records, IPs, headers or timestamps.
CREATE TABLE IF NOT EXISTS visits (
  name TEXT PRIMARY KEY CHECK (name = 'homepage'),
  value INTEGER NOT NULL DEFAULT 0 CHECK (value >= 0)
);
INSERT OR IGNORE INTO visits (name,value) VALUES ('homepage',0);
