-- Create scrape_jobs table for background scraping jobs
CREATE TABLE IF NOT EXISTS scrape_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  category text NOT NULL,
  cities text[] NOT NULL,
  pages int[] NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  result jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for polling jobs efficiently
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_status ON scrape_jobs(status);

-- Trigger to update updated_at on row change
CREATE OR REPLACE FUNCTION update_scrape_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_scrape_jobs_updated_at ON scrape_jobs;
CREATE TRIGGER set_scrape_jobs_updated_at
BEFORE UPDATE ON scrape_jobs
FOR EACH ROW EXECUTE FUNCTION update_scrape_jobs_updated_at(); 