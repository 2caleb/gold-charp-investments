
-- Create expense weekly summaries table
CREATE TABLE expense_weekly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  year INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  category TEXT NOT NULL,
  account TEXT NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  average_amount NUMERIC NOT NULL DEFAULT 0,
  min_amount NUMERIC NOT NULL DEFAULT 0,
  max_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expense monthly summaries table
CREATE TABLE expense_monthly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  month_start_date DATE NOT NULL,
  month_end_date DATE NOT NULL,
  category TEXT NOT NULL,
  account TEXT NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  weekly_summaries_count INTEGER NOT NULL DEFAULT 0,
  average_weekly_amount NUMERIC NOT NULL DEFAULT 0,
  variance_from_previous_month NUMERIC DEFAULT 0,
  growth_percentage NUMERIC DEFAULT 0,
  budget_amount NUMERIC DEFAULT 0,
  budget_variance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create smart calculations table for end-of-month analysis
CREATE TABLE expense_smart_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_type TEXT NOT NULL, -- 'monthly_analysis', 'trend_prediction', 'budget_recommendation'
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  category TEXT,
  account TEXT,
  calculation_data JSONB NOT NULL DEFAULT '{}',
  insights TEXT[],
  recommendations TEXT[],
  confidence_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_expense_weekly_summaries_week_date ON expense_weekly_summaries(week_start_date, category, account);
CREATE INDEX idx_expense_monthly_summaries_month_year ON expense_monthly_summaries(year, month, category, account);
CREATE INDEX idx_expense_smart_calculations_type_date ON expense_smart_calculations(calculation_type, year, month);

-- Function to calculate week boundaries (Monday to Sunday)
CREATE OR REPLACE FUNCTION get_week_boundaries(input_date DATE)
RETURNS TABLE(week_start DATE, week_end DATE, week_number INTEGER, year INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (input_date - INTERVAL '1 day' * EXTRACT(DOW FROM input_date) + INTERVAL '1 day')::DATE as week_start,
    (input_date - INTERVAL '1 day' * EXTRACT(DOW FROM input_date) + INTERVAL '7 days')::DATE as week_end,
    EXTRACT(WEEK FROM input_date)::INTEGER as week_number,
    EXTRACT(YEAR FROM input_date)::INTEGER as year;
END;
$$ LANGUAGE plpgsql;

-- Function to cluster expenses weekly (fixed column name to Account)
CREATE OR REPLACE FUNCTION cluster_expenses_weekly(target_week_start DATE DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  week_boundaries RECORD;
  expense_record RECORD;
BEGIN
  -- If no target week specified, use current week
  IF target_week_start IS NULL THEN
    SELECT * INTO week_boundaries FROM get_week_boundaries(CURRENT_DATE);
  ELSE
    SELECT * INTO week_boundaries FROM get_week_boundaries(target_week_start);
  END IF;

  -- Clear existing data for this week
  DELETE FROM expense_weekly_summaries 
  WHERE week_start_date = week_boundaries.week_start;

  -- Cluster expenses by category and Account for the week (using correct column name)
  FOR expense_record IN
    SELECT 
      category,
      "Account" as account,
      SUM(amount) as total_amount,
      COUNT(*) as transaction_count,
      AVG(amount) as average_amount,
      MIN(amount) as min_amount,
      MAX(amount) as max_amount
    FROM expenses_live
    WHERE expense_date >= week_boundaries.week_start 
      AND expense_date <= week_boundaries.week_end
      AND status = 'approved'
    GROUP BY category, "Account"
  LOOP
    INSERT INTO expense_weekly_summaries (
      week_start_date, week_end_date, year, week_number,
      category, account, total_amount, transaction_count,
      average_amount, min_amount, max_amount
    ) VALUES (
      week_boundaries.week_start, week_boundaries.week_end,
      week_boundaries.year, week_boundaries.week_number,
      expense_record.category, expense_record.account,
      expense_record.total_amount, expense_record.transaction_count,
      expense_record.average_amount, expense_record.min_amount, expense_record.max_amount
    );
  END LOOP;

  RAISE NOTICE 'Weekly clustering completed for week starting %', week_boundaries.week_start;
END;
$$ LANGUAGE plpgsql;

-- Function to cluster expenses monthly
CREATE OR REPLACE FUNCTION cluster_expenses_monthly(target_month INTEGER DEFAULT NULL, target_year INTEGER DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  month_start DATE;
  month_end DATE;
  prev_month_start DATE;
  prev_month_end DATE;
  expense_record RECORD;
  prev_month_total NUMERIC;
  growth_pct NUMERIC;
BEGIN
  -- Set target month/year defaults
  IF target_month IS NULL THEN
    target_month := EXTRACT(MONTH FROM CURRENT_DATE);
  END IF;
  IF target_year IS NULL THEN
    target_year := EXTRACT(YEAR FROM CURRENT_DATE);
  END IF;

  -- Calculate month boundaries
  month_start := DATE(target_year || '-' || target_month || '-01');
  month_end := (month_start + INTERVAL '1 month - 1 day')::DATE;
  
  -- Calculate previous month boundaries
  IF target_month = 1 THEN
    prev_month_start := DATE((target_year - 1) || '-12-01');
  ELSE
    prev_month_start := DATE(target_year || '-' || (target_month - 1) || '-01');
  END IF;
  prev_month_end := (prev_month_start + INTERVAL '1 month - 1 day')::DATE;

  -- Clear existing monthly data
  DELETE FROM expense_monthly_summaries 
  WHERE month = target_month AND year = target_year;

  -- Aggregate weekly summaries into monthly summaries
  FOR expense_record IN
    SELECT 
      category,
      account,
      SUM(total_amount) as total_amount,
      COUNT(*) as weekly_summaries_count,
      AVG(total_amount) as average_weekly_amount
    FROM expense_weekly_summaries
    WHERE week_start_date >= month_start 
      AND week_start_date <= month_end
    GROUP BY category, account
  LOOP
    -- Get previous month total for comparison
    SELECT COALESCE(SUM(total_amount), 0) INTO prev_month_total
    FROM expense_monthly_summaries
    WHERE month = CASE WHEN target_month = 1 THEN 12 ELSE target_month - 1 END
      AND year = CASE WHEN target_month = 1 THEN target_year - 1 ELSE target_year END
      AND category = expense_record.category
      AND account = expense_record.account;

    -- Calculate growth percentage
    IF prev_month_total > 0 THEN
      growth_pct := ((expense_record.total_amount - prev_month_total) / prev_month_total) * 100;
    ELSE
      growth_pct := 0;
    END IF;

    INSERT INTO expense_monthly_summaries (
      month, year, month_start_date, month_end_date,
      category, account, total_amount, weekly_summaries_count,
      average_weekly_amount, variance_from_previous_month, growth_percentage
    ) VALUES (
      target_month, target_year, month_start, month_end,
      expense_record.category, expense_record.account,
      expense_record.total_amount, expense_record.weekly_summaries_count,
      expense_record.average_weekly_amount, 
      expense_record.total_amount - prev_month_total, growth_pct
    );
  END LOOP;

  RAISE NOTICE 'Monthly clustering completed for % %', target_month, target_year;
END;
$$ LANGUAGE plpgsql;

-- Function for smart end-of-month calculations
CREATE OR REPLACE FUNCTION smart_end_of_month_analysis(target_month INTEGER DEFAULT NULL, target_year INTEGER DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  analysis_data JSONB;
  insights TEXT[];
  recommendations TEXT[];
  category_record RECORD;
  total_monthly_expenses NUMERIC;
  avg_monthly_expenses NUMERIC;
  confidence NUMERIC;
BEGIN
  -- Set defaults
  IF target_month IS NULL THEN
    target_month := EXTRACT(MONTH FROM CURRENT_DATE);
  END IF;
  IF target_year IS NULL THEN
    target_year := EXTRACT(YEAR FROM CURRENT_DATE);
  END IF;

  -- Clear existing calculations for this month
  DELETE FROM expense_smart_calculations 
  WHERE month = target_month AND year = target_year;

  -- Calculate total monthly expenses
  SELECT COALESCE(SUM(total_amount), 0) INTO total_monthly_expenses
  FROM expense_monthly_summaries
  WHERE month = target_month AND year = target_year;

  -- Calculate average monthly expenses (last 6 months)
  SELECT COALESCE(AVG(total_amount), 0) INTO avg_monthly_expenses
  FROM expense_monthly_summaries
  WHERE (year = target_year AND month <= target_month)
     OR (year = target_year - 1 AND month > target_month);

  -- Generate insights and recommendations
  insights := ARRAY[]::TEXT[];
  recommendations := ARRAY[]::TEXT[];

  -- Analysis by category
  FOR category_record IN
    SELECT 
      category,
      SUM(total_amount) as category_total,
      AVG(growth_percentage) as avg_growth,
      COUNT(*) as account_count
    FROM expense_monthly_summaries
    WHERE month = target_month AND year = target_year
    GROUP BY category
    ORDER BY SUM(total_amount) DESC
  LOOP
    -- Generate category-specific insights
    IF category_record.avg_growth > 20 THEN
      insights := array_append(insights, 
        category_record.category || ' expenses increased by ' || ROUND(category_record.avg_growth, 1) || '% - requires attention');
      recommendations := array_append(recommendations,
        'Review ' || category_record.category || ' spending patterns and implement cost controls');
    ELSIF category_record.avg_growth < -10 THEN
      insights := array_append(insights,
        category_record.category || ' expenses decreased by ' || ABS(ROUND(category_record.avg_growth, 1)) || '% - positive trend');
    END IF;
  END LOOP;

  -- Overall spending analysis
  IF total_monthly_expenses > avg_monthly_expenses * 1.15 THEN
    insights := array_append(insights, 'Monthly expenses are 15% above average - budget review needed');
    recommendations := array_append(recommendations, 'Implement expense reduction measures for next month');
    confidence := 85;
  ELSIF total_monthly_expenses < avg_monthly_expenses * 0.9 THEN
    insights := array_append(insights, 'Monthly expenses are 10% below average - good cost control');
    confidence := 90;
  ELSE
    insights := array_append(insights, 'Monthly expenses are within normal range');
    confidence := 75;
  END IF;

  -- Store analysis data
  analysis_data := jsonb_build_object(
    'total_monthly_expenses', total_monthly_expenses,
    'average_monthly_expenses', avg_monthly_expenses,
    'variance_percentage', CASE WHEN avg_monthly_expenses > 0 
                          THEN ROUND(((total_monthly_expenses - avg_monthly_expenses) / avg_monthly_expenses) * 100, 2)
                          ELSE 0 END,
    'categories_analyzed', (SELECT COUNT(DISTINCT category) FROM expense_monthly_summaries 
                           WHERE month = target_month AND year = target_year),
    'analysis_date', CURRENT_TIMESTAMP
  );

  -- Insert monthly analysis
  INSERT INTO expense_smart_calculations (
    calculation_type, month, year, calculation_data, 
    insights, recommendations, confidence_score
  ) VALUES (
    'monthly_analysis', target_month, target_year, analysis_data,
    insights, recommendations, confidence
  );

  RAISE NOTICE 'Smart end-of-month analysis completed for % %', target_month, target_year;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically cluster expenses when new expenses are added
CREATE OR REPLACE FUNCTION trigger_expense_clustering()
RETURNS TRIGGER AS $$
BEGIN
  -- Cluster the week that contains the new/updated expense
  PERFORM cluster_expenses_weekly(NEW.expense_date);
  
  -- If it's a new month or end of month, trigger monthly clustering
  IF EXTRACT(DAY FROM NEW.expense_date) >= 28 OR 
     NOT EXISTS (
       SELECT 1 FROM expense_monthly_summaries 
       WHERE month = EXTRACT(MONTH FROM NEW.expense_date) 
         AND year = EXTRACT(YEAR FROM NEW.expense_date)
     ) THEN
    PERFORM cluster_expenses_monthly(
      EXTRACT(MONTH FROM NEW.expense_date)::INTEGER,
      EXTRACT(YEAR FROM NEW.expense_date)::INTEGER
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on expenses_live
CREATE TRIGGER expense_clustering_trigger
  AFTER INSERT OR UPDATE ON expenses_live
  FOR EACH ROW
  EXECUTE FUNCTION trigger_expense_clustering();

-- Enable real-time updates for new tables
ALTER TABLE expense_weekly_summaries REPLICA IDENTITY FULL;
ALTER TABLE expense_monthly_summaries REPLICA IDENTITY FULL;
ALTER TABLE expense_smart_calculations REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE expense_weekly_summaries;
ALTER PUBLICATION supabase_realtime ADD TABLE expense_monthly_summaries;
ALTER PUBLICATION supabase_realtime ADD TABLE expense_smart_calculations;

-- Initialize clustering for current data
SELECT cluster_expenses_weekly();
SELECT cluster_expenses_monthly();
SELECT smart_end_of_month_analysis();
