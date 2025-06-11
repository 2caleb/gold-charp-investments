
-- Create weekly_reports table to store generated reports
CREATE TABLE IF NOT EXISTS public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_type TEXT NOT NULL,
  report_week DATE NOT NULL,
  applications_reviewed INTEGER NOT NULL DEFAULT 0,
  applications_approved INTEGER NOT NULL DEFAULT 0,
  applications_rejected INTEGER NOT NULL DEFAULT 0,
  pending_applications INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for weekly_reports
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read reports for their role
CREATE POLICY "Users can view reports for their role" ON public.weekly_reports
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert reports
CREATE POLICY "Users can create reports" ON public.weekly_reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_weekly_reports_role_week ON public.weekly_reports(role_type, report_week);
