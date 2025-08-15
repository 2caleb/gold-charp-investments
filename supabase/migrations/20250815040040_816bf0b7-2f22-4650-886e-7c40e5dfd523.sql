-- Add INSERT policy for egg_deliveries table
CREATE POLICY "Staff can create deliveries" 
ON public.egg_deliveries 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'::text);

-- Ensure created_by column exists (if not already)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'egg_deliveries' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.egg_deliveries 
        ADD COLUMN created_by uuid REFERENCES auth.users(id);
    END IF;
END $$;

-- Create or replace trigger function to set created_by and updated_at
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

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS set_delivery_metadata_trigger ON public.egg_deliveries;

CREATE TRIGGER set_delivery_metadata_trigger
  BEFORE INSERT OR UPDATE ON public.egg_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_delivery_metadata();