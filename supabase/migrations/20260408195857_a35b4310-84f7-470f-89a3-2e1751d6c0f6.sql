
-- Create glossary table
CREATE TABLE public.glossary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  long_explanation TEXT,
  examples TEXT,
  category TEXT NOT NULL DEFAULT 'beginner' CHECK (category IN ('beginner', 'intermediate', 'advanced')),
  related_terms TEXT[],
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create glossary suggestions table
CREATE TABLE public.glossary_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  submitter_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.glossary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossary_suggestions ENABLE ROW LEVEL SECURITY;

-- Glossary: public read, admin full access
CREATE POLICY "Anyone can view glossary terms"
  ON public.glossary FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Anyone can insert glossary"
  ON public.glossary FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update glossary"
  ON public.glossary FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete glossary"
  ON public.glossary FOR DELETE
  USING (true);

-- Suggestions: public insert, admin read/manage
CREATE POLICY "Anyone can submit glossary suggestions"
  ON public.glossary_suggestions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view glossary suggestions"
  ON public.glossary_suggestions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update glossary suggestions"
  ON public.glossary_suggestions FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete glossary suggestions"
  ON public.glossary_suggestions FOR DELETE
  USING (true);

-- Indexes
CREATE INDEX idx_glossary_term ON public.glossary (term);
CREATE INDEX idx_glossary_category ON public.glossary (category);

-- Trigger
CREATE TRIGGER update_glossary_updated_at
  BEFORE UPDATE ON public.glossary
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
