
-- Add user_id columns
ALTER TABLE public.wishes ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Anyone can read wishes" ON public.wishes;
DROP POLICY IF EXISTS "Anyone can insert wishes" ON public.wishes;
DROP POLICY IF EXISTS "Anyone can delete wishes" ON public.wishes;
DROP POLICY IF EXISTS "Anyone can read photos" ON public.photos;
DROP POLICY IF EXISTS "Anyone can insert photos" ON public.photos;
DROP POLICY IF EXISTS "Anyone can delete photos" ON public.photos;

-- Authenticated-only policies
CREATE POLICY "Authenticated read wishes" ON public.wishes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert wishes" ON public.wishes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated delete wishes" ON public.wishes FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated read photos" ON public.photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert photos" ON public.photos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated delete photos" ON public.photos FOR DELETE TO authenticated USING (true);
