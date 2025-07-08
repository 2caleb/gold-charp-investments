-- Fix the update_financial_summary() function to use correct date-based payment columns
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

  -- Calculate income and expenses from financial_transactions (new table structure)
  SELECT 
    COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0)
  INTO v_total_income, v_total_expenses
  FROM financial_transactions
  WHERE status = 'completed';

  -- Calculate collection rate
  IF v_total_loan_portfolio > 0 THEN
    v_collection_rate := (v_total_repaid / v_total_loan_portfolio) * 100;
  END IF;

  -- Calculate net income
  v_net_income := v_total_income - v_total_expenses;

  -- Clear existing data and insert new summary
  DELETE FROM financial_summary;
  
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
$function$