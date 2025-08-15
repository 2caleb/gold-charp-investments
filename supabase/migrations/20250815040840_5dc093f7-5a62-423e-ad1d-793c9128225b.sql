-- Fix egg_deliveries table for Director Caleb authorization and creation errors

-- 1. Fix the ID column default value
ALTER TABLE public.egg_deliveries 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Drop existing problematic policy and create Director Caleb only policy
DROP POLICY IF EXISTS "Staff can create deliveries" ON public.egg_deliveries;

CREATE POLICY "Only Director Caleb can create deliveries" 
ON public.egg_deliveries 
FOR INSERT 
WITH CHECK (is_director_caleb(auth.uid()));

-- 3. Clean up triggers - drop existing and create clean version
DROP TRIGGER IF EXISTS set_delivery_metadata_trigger ON public.egg_deliveries;
DROP TRIGGER IF EXISTS trigger_delivery_financial_update ON public.egg_deliveries;

-- 4. Create clean metadata trigger
CREATE OR REPLACE FUNCTION public.set_delivery_metadata()
RETURNS trigger AS $$
BEGIN
  -- Set created_by if not set and this is an INSERT
  IF TG_OP = 'INSERT' AND NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  
  -- Always update updated_at timestamp
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create triggers
CREATE TRIGGER set_delivery_metadata_trigger
  BEFORE INSERT OR UPDATE ON public.egg_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_delivery_metadata();

-- Re-create financial update trigger
CREATE TRIGGER trigger_delivery_financial_update
  AFTER INSERT OR UPDATE OR DELETE ON public.egg_deliveries
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_delivery_financial_update();