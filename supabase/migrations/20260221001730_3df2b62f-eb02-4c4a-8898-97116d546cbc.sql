
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

CREATE POLICY "Public can view media" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Admins can upload media" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media' AND public.is_admin());

CREATE POLICY "Admins can update media" ON storage.objects
FOR UPDATE USING (bucket_id = 'media' AND public.is_admin());

CREATE POLICY "Admins can delete media" ON storage.objects
FOR DELETE USING (bucket_id = 'media' AND public.is_admin());
