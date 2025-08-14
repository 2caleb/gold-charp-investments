-- Fix critical security issue: Restrict loan_book_live table access to authorized staff only

-- Drop the existing permissive policy that allows anyone to view loan records
DROP POLICY IF EXISTS "Users can view all loan book records" ON public.loan_book_live;

-- Create new restrictive policies for loan book access

-- Only staff can view loan records (SELECT)
CREATE POLICY "Staff can view loan book records" 
ON public.loan_book_live 
FOR SELECT 
USING (get_user_role(auth.uid()) = ANY (ARRAY['field_officer'::text, 'manager'::text, 'director'::text, 'ceo'::text, 'chairperson'::text]));

-- Only staff can insert loan records (INSERT) - replace existing policy
DROP POLICY IF EXISTS "Authenticated users can insert loan book records" ON public.loan_book_live;
CREATE POLICY "Staff can insert loan book records" 
ON public.loan_book_live 
FOR INSERT 
WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['field_officer'::text, 'manager'::text, 'director'::text, 'ceo'::text, 'chairperson'::text]));

-- Only staff can update loan records (UPDATE) - replace existing policy  
DROP POLICY IF EXISTS "Authenticated users can update loan book records" ON public.loan_book_live;
CREATE POLICY "Staff can update loan book records" 
ON public.loan_book_live 
FOR UPDATE 
USING (get_user_role(auth.uid()) = ANY (ARRAY['field_officer'::text, 'manager'::text, 'director'::text, 'ceo'::text, 'chairperson'::text]));

-- Only management can delete loan records (new policy)
CREATE POLICY "Management can delete loan book records" 
ON public.loan_book_live 
FOR DELETE 
USING (get_user_role(auth.uid()) = ANY (ARRAY['director'::text, 'ceo'::text, 'chairperson'::text]));

-- Add trigger to automatically set user_id when creating loan records
CREATE OR REPLACE FUNCTION public.set_loan_book_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Ensure auth.uid() is not null
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication UID is null. Cannot set user_id.';
  END IF;

  -- Set the user_id field to the authenticated user's UID
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$;

-- Create trigger for loan_book_live inserts
DROP TRIGGER IF EXISTS trigger_set_loan_book_user_id ON public.loan_book_live;
CREATE TRIGGER trigger_set_loan_book_user_id
  BEFORE INSERT ON public.loan_book_live
  FOR EACH ROW
  EXECUTE FUNCTION public.set_loan_book_user_id();