-- Fix unsafe DELETE statements in database functions
-- This fixes the "DELETE requires a WHERE clause" error

-- Fix update_financial_summary function
CREATE OR REPLACE FUNCTION public.update_financial_summary()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_total_loan_portfolio NUMERIC := 0;
  v_total_repaid NUMERIC := 0;
  v_outstanding_balance NUMERIC := 0;
  v_total_income NUMERIC := 0;
  v_total_expenses NUMERIC := 0;
  v_active_loan_holders INTEGER := 0;
  v_collection_rate NUMERIC := 0;
  v_net_income NUMERIC := 0;
  v_delivery_revenue NUMERIC := 0;
BEGIN
  -- Calculate loan portfolio metrics from loan_book_live using actual date-based payment columns
  SELECT 
    COALESCE(SUM(amount_returnable), 0),
    COALESCE(SUM(
      COALESCE("19-05-2025", 0) + 
      COALESCE("22-05-2025", 0) + 
      COALESCE("26-05-2025", 0) + 
      COALESCE("27-05-2025", 0) + 
      COALESCE("28-05-2025", 0) + 
      COALESCE("30-05-2025", 0) + 
      COALESCE("31-05-2025", 0) + 
      COALESCE("02-06-2025", 0) + 
      COALESCE("04-06-2025", 0) + 
      COALESCE("05-06-2025", 0) + 
      COALESCE("07-06-2025", 0) + 
      COALESCE("10-06-2025", 0) + 
      COALESCE("11-06-2025", 0) + 
      COALESCE("12-06-2025", 0) + 
      COALESCE("13-06-2025", 0) + 
      COALESCE("14-06-2025", 0) + 
      COALESCE("16-06-2025", 0) + 
      COALESCE("17-06-2025", 0) + 
      COALESCE("18-06-2025", 0) + 
      COALESCE("19-06-2025", 0) + 
      COALESCE("20-06-2025", 0) + 
      COALESCE("23-06-2025", 0) + 
      COALESCE("24-06-2025", 0) + 
      COALESCE("25-06-2025", 0) + 
      COALESCE("26-06-2025", 0) + 
      COALESCE("27-06-2025", 0)
    ), 0),
    COALESCE(SUM(remaining_balance), 0),
    COUNT(DISTINCT client_name)
  INTO v_total_loan_portfolio, v_total_repaid, v_outstanding_balance, v_active_loan_holders
  FROM loan_book_live
  WHERE client_name IS NOT NULL AND client_name != '' AND status = 'active';

  -- Calculate income and expenses from financial_transactions
  SELECT 
    COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0)
  INTO v_total_income, v_total_expenses
  FROM financial_transactions
  WHERE status = 'completed';

  -- Calculate delivery revenue from paid deliveries
  SELECT COALESCE(SUM(total_amount), 0)
  INTO v_delivery_revenue
  FROM egg_deliveries
  WHERE payment_status = 'paid';

  -- Add delivery revenue to total income
  v_total_income := v_total_income + v_delivery_revenue;

  -- Calculate collection rate
  IF v_total_loan_portfolio > 0 THEN
    v_collection_rate := (v_total_repaid / v_total_loan_portfolio) * 100;
  END IF;

  -- Calculate net income
  v_net_income := v_total_income - v_total_expenses;

  -- Clear existing data using TRUNCATE for better performance and safety
  TRUNCATE financial_summary;
  
  INSERT INTO financial_summary (
    total_loan_portfolio,
    total_repaid,
    outstanding_balance,
    total_income,
    total_expenses,
    active_loan_holders,
    collection_rate,
    net_income
  ) VALUES (
    v_total_loan_portfolio,
    v_total_repaid,
    v_outstanding_balance,
    v_total_income,
    v_total_expenses,
    v_active_loan_holders,
    v_collection_rate,
    v_net_income
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise with more context
    RAISE NOTICE 'Error in update_financial_summary: %', SQLERRM;
    RAISE;
END;
$function$;

-- Fix cluster_expenses_daily function
CREATE OR REPLACE FUNCTION public.cluster_expenses_daily(target_date date DEFAULT NULL::date)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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

  -- Clear existing data for this date using safe DELETE
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
$function$;

-- Fix cluster_expenses_weekly function
CREATE OR REPLACE FUNCTION public.cluster_expenses_weekly(target_week_start date DEFAULT NULL::date)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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

  -- Clear existing data for this week using safe DELETE
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
$function$;

-- Fix cluster_expenses_monthly function
CREATE OR REPLACE FUNCTION public.cluster_expenses_monthly(target_month integer DEFAULT NULL::integer, target_year integer DEFAULT NULL::integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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

  -- Clear existing monthly data using safe DELETE
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
$function$;

-- Fix smart_end_of_month_analysis function
CREATE OR REPLACE FUNCTION public.smart_end_of_month_analysis(target_month integer DEFAULT NULL::integer, target_year integer DEFAULT NULL::integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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

  -- Clear existing calculations for this month using safe DELETE
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
$function$;