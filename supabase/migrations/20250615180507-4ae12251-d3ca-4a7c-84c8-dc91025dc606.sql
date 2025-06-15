
-- 1. Add risk columns to loan_book_live (using defaults for existing records)
ALTER TABLE loan_book_live
  ADD COLUMN IF NOT EXISTS risk_score numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS default_probability numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS risk_level text NOT NULL DEFAULT 'low',
  ADD COLUMN IF NOT EXISTS risk_factors jsonb DEFAULT '{}'::jsonb;

-- Optional: Constrain risk_level to allowed values for integrity (simulate enum)
ALTER TABLE loan_book_live
  ADD CONSTRAINT risk_level_check CHECK (risk_level IN ('low', 'medium', 'high', 'critical'));

-- 2. Loan risk history table: tracks how the risk score changes over time
CREATE TABLE IF NOT EXISTS loan_risk_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES loan_book_live(id) ON DELETE CASCADE,
  risk_score numeric NOT NULL,
  default_probability numeric NOT NULL,
  risk_level text NOT NULL,
  risk_factors jsonb DEFAULT '{}'::jsonb,
  calculated_by text,
  calculated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT risk_level_history_check CHECK (risk_level IN ('low', 'medium', 'high', 'critical'))
);

-- 3. Prediction log: audit model outputs for MLOps and explainability
CREATE TABLE IF NOT EXISTS loan_risk_prediction_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES loan_book_live(id) ON DELETE CASCADE,
  risk_score numeric NOT NULL,
  default_probability numeric NOT NULL,
  model_version text NOT NULL,
  model_input jsonb,
  model_output jsonb,
  calculated_at timestamp with time zone DEFAULT now()
);
