-- Create AI tools catalog tables and access policies for EverythingAI360

-- Keep updated_at in sync on row updates.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.ai_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  summary text,
  website_url text,
  logo_url text,
  category text,
  tags text[] NOT NULL DEFAULT '{}'::text[],
  pricing_type text CHECK (pricing_type IN ('Free', 'Freemium', 'Paid', 'Open Source')),
  pricing_details text,
  trend_score integer NOT NULL DEFAULT 0,
  upvotes integer NOT NULL DEFAULT 0,
  source text,
  source_url text,
  is_verified boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tool_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  website_url text,
  description text,
  category text,
  tags text[] NOT NULL DEFAULT '{}'::text[],
  pricing_type text CHECK (pricing_type IN ('Free', 'Freemium', 'Paid', 'Open Source')),
  pricing_details text,
  source text,
  source_url text,
  submitter_email text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tool_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES public.ai_tools(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tool_id, user_id)
);

CREATE INDEX idx_ai_tools_category ON public.ai_tools(category);
CREATE INDEX idx_ai_tools_trend_score ON public.ai_tools(trend_score DESC);
CREATE INDEX idx_ai_tools_tags_gin ON public.ai_tools USING gin(tags);
CREATE INDEX idx_tool_submissions_status ON public.tool_submissions(status);
CREATE INDEX idx_tool_votes_tool_id ON public.tool_votes(tool_id);
CREATE INDEX idx_tool_votes_user_id ON public.tool_votes(user_id);

CREATE TRIGGER update_ai_tools_updated_at
BEFORE UPDATE ON public.ai_tools
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tool_submissions_updated_at
BEFORE UPDATE ON public.tool_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_votes ENABLE ROW LEVEL SECURITY;

-- ai_tools: anyone can read, only service role can write.
CREATE POLICY "Public can read ai_tools"
ON public.ai_tools
FOR SELECT
USING (true);

CREATE POLICY "Service role can insert ai_tools"
ON public.ai_tools
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update ai_tools"
ON public.ai_tools
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can delete ai_tools"
ON public.ai_tools
FOR DELETE
USING (auth.role() = 'service_role');

-- tool_submissions: public can submit, service role can review/manage.
CREATE POLICY "Public can insert tool_submissions"
ON public.tool_submissions
FOR INSERT
WITH CHECK (status = 'pending');

CREATE POLICY "Service role can read tool_submissions"
ON public.tool_submissions
FOR SELECT
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can update tool_submissions"
ON public.tool_submissions
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can delete tool_submissions"
ON public.tool_submissions
FOR DELETE
USING (auth.role() = 'service_role');

-- tool_votes: authenticated users can manage their own votes.
CREATE POLICY "Users can read own tool_votes"
ON public.tool_votes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tool_votes"
ON public.tool_votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tool_votes"
ON public.tool_votes
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage tool_votes"
ON public.tool_votes
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
