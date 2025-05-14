
-- Function to get loan workflow data by application id
CREATE OR REPLACE FUNCTION public.get_loan_workflow(application_id UUID)
RETURNS SETOF loan_application_workflow
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT * FROM loan_application_workflow 
  WHERE loan_application_id = application_id;
$$;
