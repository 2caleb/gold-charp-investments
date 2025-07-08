
-- Create egg deliveries table
CREATE TABLE public.egg_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name text NOT NULL,
  phone_number text,
  delivery_date date NOT NULL,
  trays integer NOT NULL CHECK (trays > 0),
  price_per_tray numeric NOT NULL CHECK (price_per_tray > 0),
  total_amount numeric NOT NULL CHECK (total_amount > 0),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue')),
  delivery_location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.egg_deliveries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view all deliveries" 
ON public.egg_deliveries 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert deliveries" 
ON public.egg_deliveries 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update deliveries" 
ON public.egg_deliveries 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Management can delete deliveries" 
ON public.egg_deliveries 
FOR DELETE 
USING (get_user_role(auth.uid()) = ANY (ARRAY['director', 'ceo', 'chairperson']));

-- Create trigger for updated_at
CREATE TRIGGER update_egg_deliveries_updated_at
BEFORE UPDATE ON public.egg_deliveries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-calculate total_amount
CREATE OR REPLACE FUNCTION public.calculate_delivery_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_amount := NEW.trays * NEW.price_per_tray;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_delivery_total_trigger
BEFORE INSERT OR UPDATE ON public.egg_deliveries
FOR EACH ROW
EXECUTE FUNCTION public.calculate_delivery_total();

-- Create trigger to set user_id automatically
CREATE TRIGGER set_delivery_user_id
BEFORE INSERT ON public.egg_deliveries
FOR EACH ROW
EXECUTE FUNCTION public.set_user_id_from_auth();

-- Create indexes for performance
CREATE INDEX idx_egg_deliveries_delivery_date ON public.egg_deliveries(delivery_date);
CREATE INDEX idx_egg_deliveries_supplier_name ON public.egg_deliveries(supplier_name);
CREATE INDEX idx_egg_deliveries_payment_status ON public.egg_deliveries(payment_status);
CREATE INDEX idx_egg_deliveries_created_by ON public.egg_deliveries(created_by);

-- Update financial summary function to include egg delivery revenue
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
$function$;

-- Create trigger to update financial summary when deliveries change
CREATE OR REPLACE FUNCTION public.trigger_delivery_financial_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_financial_summary();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_financial_summary_on_delivery_change
AFTER INSERT OR UPDATE OR DELETE ON public.egg_deliveries
FOR EACH STATEMENT
EXECUTE FUNCTION public.trigger_delivery_financial_update();
