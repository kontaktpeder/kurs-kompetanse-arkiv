
-- Add image columns to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS hero_image_url text;

-- Create site_settings singleton table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  home_hero_image_url text,
  home_hero_title text,
  home_hero_subtitle text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default row
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read site settings
CREATE POLICY "public_read_site_settings" ON public.site_settings
  FOR SELECT USING (true);

-- Admins can manage site settings
CREATE POLICY "admin_manage_site_settings" ON public.site_settings
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Storage RLS: admins can upload to media bucket
CREATE POLICY "admin_upload_media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND is_admin());

CREATE POLICY "admin_update_media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media' AND is_admin());

CREATE POLICY "admin_delete_media" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND is_admin());

-- Public can read media
CREATE POLICY "public_read_media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');
