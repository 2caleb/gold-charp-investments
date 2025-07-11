-- Create sticky_notes table
CREATE TABLE public.sticky_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL DEFAULT '',
  user_id uuid NOT NULL,
  user_role text NOT NULL,
  payment_id uuid,
  record_type text NOT NULL DEFAULT 'payment',
  record_id text NOT NULL,
  position_x integer DEFAULT 0,
  position_y integer DEFAULT 0,
  color text DEFAULT '#fffda3',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sticky_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for sticky notes access
CREATE POLICY "Users can view notes based on role" 
ON public.sticky_notes 
FOR SELECT 
USING (
  CASE 
    WHEN get_user_role(auth.uid()) = ANY (ARRAY['ceo'::text, 'director'::text, 'chairperson'::text]) 
    THEN true
    ELSE user_id = auth.uid()
  END
);

CREATE POLICY "Authorized users can create notes" 
ON public.sticky_notes 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  get_user_role(auth.uid()) = ANY (ARRAY['ceo'::text, 'director'::text, 'chairperson'::text, 'manager'::text])
);

CREATE POLICY "Users can update their own notes" 
ON public.sticky_notes 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
ON public.sticky_notes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE TRIGGER update_sticky_notes_updated_at
BEFORE UPDATE ON public.sticky_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();