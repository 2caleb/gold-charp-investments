
-- Function to get loan workflow data by application id
CREATE OR REPLACE FUNCTION public.get_loan_workflow(application_id UUID)
RETURNS TABLE (
  id UUID,
  loan_application_id UUID,
  current_stage TEXT,
  field_officer_approved BOOLEAN,
  manager_approved BOOLEAN,
  director_approved BOOLEAN,
  ceo_approved BOOLEAN,
  chairperson_approved BOOLEAN,
  field_officer_notes TEXT,
  manager_notes TEXT,
  director_notes TEXT,
  ceo_notes TEXT,
  chairperson_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT * FROM loan_application_workflow 
  WHERE loan_application_id = application_id;
$$;
