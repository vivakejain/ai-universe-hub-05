
-- Create tools table
CREATE TABLE public.tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  description TEXT NOT NULL,
  summary TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  best_for TEXT DEFAULT 'Everyone',
  pricing TEXT DEFAULT 'Free' CHECK (pricing IN ('Free', 'Freemium', 'Paid')),
  rating NUMERIC(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  is_approved BOOLEAN NOT NULL DEFAULT true,
  is_community_submitted BOOLEAN NOT NULL DEFAULT false,
  submitter_email TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create people table
CREATE TABLE public.people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  platform TEXT,
  profile_url TEXT,
  description TEXT,
  follower_count TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- Public read access for approved items only
CREATE POLICY "Anyone can view approved tools"
  ON public.tools FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Anyone can view approved people"
  ON public.people FOR SELECT
  USING (is_approved = true);

-- Allow public inserts for community submissions
CREATE POLICY "Anyone can submit tools"
  ON public.tools FOR INSERT
  WITH CHECK (is_community_submitted = true AND is_approved = false);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers
CREATE TRIGGER update_tools_updated_at
  BEFORE UPDATE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON public.people
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
