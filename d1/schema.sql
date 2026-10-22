-- 報告テーブルのスキーマ（README「報告APIの仕様」）
-- 適用（本番）:
--   npx wrangler d1 execute <DATABASE_NAME> --remote --file=d1/schema.sql
-- Pages 側の設定:
--   - D1 バインディング名は DB（Pages → 設定 → Functions → D1 データベース バインディング）
--   - Secrets: HCAPTCHA_SECRET / ADMIN_TOKEN
--   - クライアント用サイトキーはビルド変数 VITE_HCAPTCHA_SITEKEY

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,                  -- UUID
  questionId TEXT NOT NULL,
  category TEXT NOT NULL,               -- src/lib/report.ts の REPORT_CATEGORIES（誤字・脱字 / 解答・解説の誤り / 表示崩れ / その他）
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',  -- open / resolved
  createdAt TEXT NOT NULL               -- ISO-8601 (UTC)
);

CREATE INDEX IF NOT EXISTS idx_reports_created ON reports (createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status_created ON reports (status, createdAt DESC);
