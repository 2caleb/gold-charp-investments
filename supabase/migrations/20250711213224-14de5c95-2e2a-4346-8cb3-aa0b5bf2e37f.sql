-- Drop existing policies for sticky notes creation and deletion
DROP POLICY IF EXISTS "Authorized users can create notes" ON public.sticky_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.sticky_notes;

-- Create new policy: Only Director Caleb can create notes
CREATE POLICY "Only Director Caleb can create notes" 
ON public.sticky_notes 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  is_director_caleb(auth.uid())
);

-- Create new policy: Only Director Caleb can delete any notes
CREATE POLICY "Only Director Caleb can delete notes" 
ON public.sticky_notes 
FOR DELETE 
USING (is_director_caleb(auth.uid()));

-- Update the update policy to only allow Director Caleb to edit notes
DROP POLICY IF EXISTS "Users can update their own notes" ON public.sticky_notes;
CREATE POLICY "Only Director Caleb can update notes" 
ON public.sticky_notes 
FOR UPDATE 
USING (is_director_caleb(auth.uid()))
WITH CHECK (is_director_caleb(auth.uid()));