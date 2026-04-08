
-- Drop the existing restrictive select policy
DROP POLICY IF EXISTS "Anyone can view approved tools" ON public.tools;

-- Allow reading all tools (admin needs to see pending too)
CREATE POLICY "Anyone can view all tools"
  ON public.tools FOR SELECT
  USING (true);

-- Allow updates (for approving tools)
CREATE POLICY "Anyone can update tools"
  ON public.tools FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow deletes (for rejecting/removing tools)
CREATE POLICY "Anyone can delete tools"
  ON public.tools FOR DELETE
  USING (true);

-- Also allow admin inserts of approved tools (existing policy only allows community submissions)
DROP POLICY IF EXISTS "Anyone can submit tools" ON public.tools;

CREATE POLICY "Anyone can insert tools"
  ON public.tools FOR INSERT
  WITH CHECK (true);
