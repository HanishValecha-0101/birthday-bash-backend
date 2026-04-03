CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.wishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  emoji TEXT DEFAULT '💚',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read wishes" ON public.wishes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert wishes" ON public.wishes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete wishes" ON public.wishes FOR DELETE USING (true);

CREATE POLICY "Anyone can read photos" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Anyone can insert photos" ON public.photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete photos" ON public.photos FOR DELETE USING (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('photobooth', 'photobooth', true);

CREATE POLICY "Anyone can view photobooth images" ON storage.objects FOR SELECT USING (bucket_id = 'photobooth');
CREATE POLICY "Anyone can upload photobooth images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photobooth');
CREATE POLICY "Anyone can delete photobooth images" ON storage.objects FOR DELETE USING (bucket_id = 'photobooth');