-- Add note_type column to distinguish between notes and comments
ALTER TABLE public.sticky_notes 
ADD COLUMN note_type text NOT NULL DEFAULT 'note' CHECK (note_type IN ('note', 'comment'));

-- Add author_name column to store the full name of the person who created the note/comment
ALTER TABLE public.sticky_notes 
ADD COLUMN author_name text;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Only Director Caleb can create notes" ON public.sticky_notes;
DROP POLICY IF EXISTS "Only Director Caleb can update notes" ON public.sticky_notes;
DROP POLICY IF EXISTS "Only Director Caleb can delete notes" ON public.sticky_notes;

-- Create comprehensive policies for the new system
-- Director Caleb can create notes and comments, edit any content, delete any item
CREATE POLICY "Director Caleb can manage all notes and comments" 
ON public.sticky_notes 
FOR ALL
USING (is_director_caleb(auth.uid()))
WITH CHECK (is_director_caleb(auth.uid()));

-- CEO and Chairperson can create comments and edit their own comments
CREATE POLICY "CEO and Chairperson can create comments" 
ON public.sticky_notes 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  note_type = 'comment' AND
  get_user_role(auth.uid()) IN ('ceo', 'chairperson')
);

CREATE POLICY "CEO and Chairperson can update their own comments" 
ON public.sticky_notes 
FOR UPDATE 
USING (
  auth.uid() = user_id AND 
  note_type = 'comment' AND
  get_user_role(auth.uid()) IN ('ceo', 'chairperson')
)
WITH CHECK (
  auth.uid() = user_id AND 
  note_type = 'comment' AND
  get_user_role(auth.uid()) IN ('ceo', 'chairperson')
);

-- Everyone can view notes and comments (maintaining existing view policy)
CREATE POLICY "Everyone can view notes and comments" 
ON public.sticky_notes 
FOR SELECT 
USING (true);