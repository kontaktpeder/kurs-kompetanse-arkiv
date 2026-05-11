CREATE TABLE IF NOT EXISTS public.course_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_faqs_course_id
  ON public.course_faqs(course_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_course_faqs_unique_sort
  ON public.course_faqs(course_id, sort_order);

ALTER TABLE public.course_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_published_course_faqs"
ON public.course_faqs
FOR SELECT
USING (is_published = true);

CREATE POLICY "admin_manage_course_faqs"
ON public.course_faqs
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE TRIGGER set_updated_at_course_faqs
BEFORE UPDATE ON public.course_faqs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();