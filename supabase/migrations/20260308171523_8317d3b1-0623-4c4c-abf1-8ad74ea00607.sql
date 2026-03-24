
-- Create a public storage bucket for course thumbnails
INSERT INTO storage.buckets (id, name, public) VALUES ('course-thumbnails', 'course-thumbnails', true);

-- Allow admins to upload files
CREATE POLICY "Admins can upload course thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-thumbnails' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Allow admins to update files
CREATE POLICY "Admins can update course thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'course-thumbnails' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Allow admins to delete files
CREATE POLICY "Admins can delete course thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-thumbnails' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Allow anyone to view course thumbnails (public bucket)
CREATE POLICY "Anyone can view course thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-thumbnails');
