
-- Merge duplicate "*-telemark" courses into the established courses, then delete duplicates.

-- 1) Fallsikringskurs: merge content
UPDATE public.courses AS dst SET
  short_description  = src.short_description,
  description        = src.description,
  learning_outcomes  = src.learning_outcomes,
  target_audience    = src.target_audience,
  course_structure   = src.course_structure,
  certification_info = src.certification_info,
  practical_info     = src.practical_info,
  duration           = src.duration,
  requirements       = src.requirements,
  languages          = src.languages,
  is_featured        = true,
  updated_at         = now()
FROM public.courses AS src
WHERE dst.slug = 'fallsikringskurs'
  AND src.slug = 'fallsikringskurs-telemark';

-- 2) G11 Løfteredskap: merge content
UPDATE public.courses AS dst SET
  short_description  = src.short_description,
  description        = src.description,
  learning_outcomes  = src.learning_outcomes,
  target_audience    = src.target_audience,
  course_structure   = src.course_structure,
  certification_info = src.certification_info,
  practical_info     = src.practical_info,
  duration           = src.duration,
  requirements       = src.requirements,
  languages          = src.languages,
  is_featured        = true,
  updated_at         = now()
FROM public.courses AS src
WHERE dst.slug = 'g11-lofteredskap-anhuker-signalgiver'
  AND src.slug = 'g11-lofteredskap-anhukerkurs-telemark';

-- 3) Truckførerkurs: merge content
UPDATE public.courses AS dst SET
  short_description  = src.short_description,
  description        = src.description,
  learning_outcomes  = src.learning_outcomes,
  target_audience    = src.target_audience,
  course_structure   = src.course_structure,
  certification_info = src.certification_info,
  practical_info     = src.practical_info,
  duration           = src.duration,
  requirements       = src.requirements,
  languages          = src.languages,
  is_featured        = true,
  updated_at         = now()
FROM public.courses AS src
WHERE dst.slug = 'truckforerkurs-t1-t5'
  AND src.slug = 'truckkurs-telemark';

-- 4) Move FAQs from duplicate courses onto the established courses
--    Clear any pre-existing FAQs on the destination so we don't get duplicates,
--    then move the FAQs from the duplicate course onto the destination.

-- Fallsikring
DELETE FROM public.course_faqs
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'fallsikringskurs')
  AND course_id <> (SELECT id FROM public.courses WHERE slug = 'fallsikringskurs-telemark');

UPDATE public.course_faqs
SET course_id = (SELECT id FROM public.courses WHERE slug = 'fallsikringskurs')
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'fallsikringskurs-telemark');

-- G11
DELETE FROM public.course_faqs
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'g11-lofteredskap-anhuker-signalgiver')
  AND course_id <> (SELECT id FROM public.courses WHERE slug = 'g11-lofteredskap-anhukerkurs-telemark');

UPDATE public.course_faqs
SET course_id = (SELECT id FROM public.courses WHERE slug = 'g11-lofteredskap-anhuker-signalgiver')
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'g11-lofteredskap-anhukerkurs-telemark');

-- Truck
DELETE FROM public.course_faqs
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'truckforerkurs-t1-t5')
  AND course_id <> (SELECT id FROM public.courses WHERE slug = 'truckkurs-telemark');

UPDATE public.course_faqs
SET course_id = (SELECT id FROM public.courses WHERE slug = 'truckforerkurs-t1-t5')
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'truckkurs-telemark');

-- 5) Delete the duplicate courses
DELETE FROM public.courses
WHERE slug IN (
  'fallsikringskurs-telemark',
  'g11-lofteredskap-anhukerkurs-telemark',
  'truckkurs-telemark'
);
