
-- Create expense daily summaries table
CREATE TABLE expense_daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
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

-- Create indexes for performance
CREATE INDEX idx_expense_daily_summaries_date ON expense_daily_summaries(expense_date, category, account);
CREATE INDEX idx_expense_daily_summaries_dow ON expense_daily_summaries(day_of_week, category);

-- Function to cluster expenses daily
CREATE OR REPLACE FUNCTION cluster_expenses_daily(target_date DATE DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  expense_record RECORD;
  target_expense_date DATE;
  day_of_week_val INTEGER;
BEGIN
  -- If no target date specified, use current date
  IF target_date IS NULL THEN
    target_expense_date := CURRENT_DATE;
  ELSE
    target_expense_date := target_date;
  END IF;

  -- Get day of week (0 = Sunday, 1 = Monday, etc.)
  day_of_week_val := EXTRACT(DOW FROM target_expense_date);

  -- Clear existing data for this date
  DELETE FROM expense_daily_summaries 
  WHERE expense_date = target_expense_date;

  -- Cluster expenses by category and account for the day
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
    WHERE expense_date = target_expense_date
      AND status = 'approved'
    GROUP BY category, "Account"
  LOOP
    INSERT INTO expense_daily_summaries (
      expense_date, day_of_week, category, account, 
      total_amount, transaction_count, average_amount, 
      min_amount, max_amount
    ) VALUES (
      target_expense_date, day_of_week_val,
      expense_record.category, expense_record.account,
      expense_record.total_amount, expense_record.transaction_count,
      expense_record.average_amount, expense_record.min_amount, 
      expense_record.max_amount
    );
  END LOOP;

  RAISE NOTICE 'Daily clustering completed for %', target_expense_date;
END;
$$ LANGUAGE plpgsql;

-- Function for smart end-of-day analysis
CREATE OR REPLACE FUNCTION smart_end_of_day_analysis(target_date DATE DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  analysis_data JSONB;
  insights TEXT[];
  recommendations TEXT[];
  category_record RECORD;
  total_daily_expenses NUMERIC;
  avg_daily_expenses NUMERIC;
  confidence NUMERIC;
  target_expense_date DATE;
  day_of_week_val INTEGER;
  weekday_avg NUMERIC;
  weekend_avg NUMERIC;
BEGIN
  -- Set defaults
  IF target_date IS NULL THEN
    target_expense_date := CURRENT_DATE;
  ELSE
    target_expense_date := target_date;
  END IF;

  day_of_week_val := EXTRACT(DOW FROM target_expense_date);

  -- Calculate total daily expenses
  SELECT COALESCE(SUM(total_amount), 0) INTO total_daily_expenses
  FROM expense_daily_summaries
  WHERE expense_date = target_expense_date;

  -- Calculate average daily expenses (last 30 days)
  SELECT COALESCE(AVG(total_amount), 0) INTO avg_daily_expenses
  FROM expense_daily_summaries
  WHERE expense_date >= target_expense_date - INTERVAL '30 days'
    AND expense_date < target_expense_date;

  -- Calculate weekday vs weekend averages
  SELECT COALESCE(AVG(total_amount), 0) INTO weekday_avg
  FROM expense_daily_summaries
  WHERE day_of_week BETWEEN 1 AND 5
    AND expense_date >= target_expense_date - INTERVAL '30 days';

  SELECT COALESCE(AVG(total_amount), 0) INTO weekend_avg
  FROM expense_daily_summaries
  WHERE day_of_week IN (0, 6)
    AND expense_date >= target_expense_date - INTERVAL '30 days';

  -- Generate insights and recommendations
  insights := ARRAY[]::TEXT[];
  recommendations := ARRAY[]::TEXT[];

  -- Day-specific analysis
  IF day_of_week_val IN (0, 6) AND total_daily_expenses > weekend_avg * 1.2 THEN
    insights := array_append(insights, 'Weekend spending is 20% above average - monitor leisure expenses');
    recommendations := array_append(recommendations, 'Review weekend spending patterns and set weekend budgets');
  ELSIF day_of_week_val BETWEEN 1 AND 5 AND total_daily_expenses > weekday_avg * 1.2 THEN
    insights := array_append(insights, 'Weekday spending is 20% above average - check business expenses');
    recommendations := array_append(recommendations, 'Analyze weekday operational costs and identify savings');
  END IF;

  -- Overall daily analysis
  IF total_daily_expenses > avg_daily_expenses * 1.15 THEN
    insights := array_append(insights, 'Daily expenses are 15% above 30-day average');
    recommendations := array_append(recommendations, 'Review today''s expenses for any unusual transactions');
    confidence := 85;
  ELSIF total_daily_expenses < avg_daily_expenses * 0.8 THEN
    insights := array_append(insights, 'Daily expenses are 20% below average - good cost control');
    confidence := 90;
  ELSE
    insights := array_append(insights, 'Daily expenses are within normal range');
    confidence := 75;
  END IF;

  -- Store analysis data
  analysis_data := jsonb_build_object(
    'total_daily_expenses', total_daily_expenses,
    'average_daily_expenses', avg_daily_expenses,
    'weekday_average', weekday_avg,
    'weekend_average', weekend_avg,
    'day_of_week', day_of_week_val,
    'variance_percentage', CASE WHEN avg_daily_expenses > 0 
                          THEN ROUND(((total_daily_expenses - avg_daily_expenses) / avg_daily_expenses) * 100, 2)
                          ELSE 0 END,
    'analysis_date', CURRENT_TIMESTAMP
  );

  -- Insert daily analysis into smart calculations
  INSERT INTO expense_smart_calculations (
    calculation_type, month, year, calculation_data, 
    insights, recommendations, confidence_score
  ) VALUES (
    'daily_analysis', 
    EXTRACT(MONTH FROM target_expense_date)::INTEGER,
    EXTRACT(YEAR FROM target_expense_date)::INTEGER,
    analysis_data, insights, recommendations, confidence
  );

  RAISE NOTICE 'Smart end-of-day analysis completed for %', target_expense_date;
END;
$$ LANGUAGE plpgsql;

-- Update the existing trigger function to include daily clustering
CREATE OR REPLACE FUNCTION trigger_expense_clustering()
RETURNS TRIGGER AS $$
BEGIN
  -- Cluster the day that contains the new/updated expense
  PERFORM cluster_expenses_daily(NEW.expense_date);
  
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

  -- Run daily analysis
  PERFORM smart_end_of_day_analysis(NEW.expense_date);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enable real-time updates for daily summaries
ALTER TABLE expense_daily_summaries REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE expense_daily_summaries;

-- Initialize daily clustering for current data
SELECT cluster_expenses_daily();
SELECT smart_end_of_day_analysis();
