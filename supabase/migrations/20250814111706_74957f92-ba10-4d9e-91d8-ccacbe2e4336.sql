-- Check if shared_excel_data table exists and create it with proper security if not
DO $$
BEGIN
    -- Check if the table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'shared_excel_data') THEN
        -- Create shared_excel_data table with proper structure
        CREATE TABLE public.shared_excel_data (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            upload_id UUID NOT NULL,
            sheet_name TEXT NOT NULL,
            row_data JSONB NOT NULL DEFAULT '{}'::jsonb,
            row_index INTEGER NOT NULL,
            uploaded_by UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        -- Create upload_history table if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'upload_history') THEN
            CREATE TABLE public.upload_history (
                id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
                file_name TEXT NOT NULL,
                original_file_name TEXT NOT NULL,
                file_size BIGINT NOT NULL,
                sheet_count INTEGER NOT NULL DEFAULT 0,
                total_rows INTEGER NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'pending'::text,
                uploaded_by UUID NOT NULL,
                storage_path TEXT NOT NULL,
                processing_notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );
        END IF;
    END IF;
END $$;

-- Enable RLS on both tables
ALTER TABLE public.shared_excel_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_history ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies first
DROP POLICY IF EXISTS "Enable read access for all users" ON public.shared_excel_data;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.shared_excel_data;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.shared_excel_data;
DROP POLICY IF EXISTS "Public read access" ON public.shared_excel_data;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.upload_history;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.upload_history;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.upload_history;
DROP POLICY IF EXISTS "Public read access" ON public.upload_history;

-- Create secure RLS policies for shared_excel_data
-- Only authorized staff can view Excel data
CREATE POLICY "Staff can view shared excel data" 
ON public.shared_excel_data 
FOR SELECT 
TO authenticated
USING (get_user_role(auth.uid()) = ANY (ARRAY['field_officer'::text, 'manager'::text, 'director'::text, 'ceo'::text, 'chairperson'::text]));

-- Only authorized staff can insert Excel data
CREATE POLICY "Staff can insert shared excel data" 
ON public.shared_excel_data 
FOR INSERT 
TO authenticated
WITH CHECK (
    get_user_role(auth.uid()) = ANY (ARRAY['field_officer'::text, 'manager'::text, 'director'::text, 'ceo'::text, 'chairperson'::text]) 
    AND uploaded_by = auth.uid()
);

-- Only the uploader or management can update Excel data
CREATE POLICY "Uploader or management can update shared excel data" 
ON public.shared_excel_data 
FOR UPDATE 
TO authenticated
USING (
    uploaded_by = auth.uid() 
    OR get_user_role(auth.uid()) = ANY (ARRAY['manager'::text, 'director'::text, 'ceo'::text, 'chairperson'::text])
);

-- Only management can delete Excel data
CREATE POLICY "Management can delete shared excel data" 
ON public.shared_excel_data 
FOR DELETE 
TO authenticated
USING (get_user_role(auth.uid()) = ANY (ARRAY['director'::text, 'ceo'::text, 'chairperson'::text]));

-- Create secure RLS policies for upload_history
-- Only authorized staff can view upload history
CREATE POLICY "Staff can view upload history" 
ON public.upload_history 
FOR SELECT 
TO authenticated
USING (get_user_role(auth.uid()) = ANY (ARRAY['field_officer'::text, 'manager'::text, 'director'::text, 'ceo'::text, 'chairperson'::text]));

-- Only authorized staff can insert upload history
CREATE POLICY "Staff can insert upload history" 
ON public.upload_history 
FOR INSERT 
TO authenticated
WITH CHECK (
    get_user_role(auth.uid()) = ANY (ARRAY['field_officer'::text, 'manager'::text, 'director'::text, 'ceo'::text, 'chairperson'::text]) 
    AND uploaded_by = auth.uid()
);

-- Only the uploader or management can update upload history
CREATE POLICY "Uploader or management can update upload history" 
ON public.upload_history 
FOR UPDATE 
TO authenticated
USING (
    uploaded_by = auth.uid() 
    OR get_user_role(auth.uid()) = ANY (ARRAY['manager'::text, 'director'::text, 'ceo'::text, 'chairperson'::text])
);

-- Only management can delete upload history
CREATE POLICY "Management can delete upload history" 
ON public.upload_history 
FOR DELETE 
TO authenticated
USING (get_user_role(auth.uid()) = ANY (ARRAY['director'::text, 'ceo'::text, 'chairperson'::text]));

-- Add trigger to automatically set uploaded_by for shared_excel_data
CREATE OR REPLACE FUNCTION public.set_uploaded_by_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure auth.uid() is not null
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication UID is null. Cannot set uploaded_by.';
  END IF;

  -- Set the uploaded_by field to the authenticated user's UID
  NEW.uploaded_by := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Create triggers for automatic user assignment
DROP TRIGGER IF EXISTS set_uploaded_by_shared_excel_data ON public.shared_excel_data;
CREATE TRIGGER set_uploaded_by_shared_excel_data
  BEFORE INSERT ON public.shared_excel_data
  FOR EACH ROW
  EXECUTE FUNCTION public.set_uploaded_by_from_auth();

DROP TRIGGER IF EXISTS set_uploaded_by_upload_history ON public.upload_history;
CREATE TRIGGER set_uploaded_by_upload_history
  BEFORE INSERT ON public.upload_history
  FOR EACH ROW
  EXECUTE FUNCTION public.set_uploaded_by_from_auth();