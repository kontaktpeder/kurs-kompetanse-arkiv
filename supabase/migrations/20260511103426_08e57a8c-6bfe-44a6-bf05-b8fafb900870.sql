WITH upsert_course AS (
  INSERT INTO public.courses (
    title, slug, short_description, description,
    learning_outcomes, target_audience, course_structure,
    practical_info, certification_info, duration, requirements,
    course_type, languages, is_active, is_featured
  ) VALUES (
    'G11 Løfteredskap og anhukerkurs i Telemark',
    'g11-lofteredskap-anhukerkurs-telemark',
    'Ta G11 løfteredskap og anhukerkurs i Telemark. Praktisk og sertifisert opplæring på norsk, engelsk og tegnspråk. Kurs for bedrifter og privatpersoner.',
    E'G11 løfteredskap og anhukerkurs er for deg som skal arbeide med anhuking, stropping og sikker bruk av løfteredskap innen bygg, industri, lager, verksted og anlegg. Hos KursKragerø får du praktisk og dokumentert opplæring med fokus på sikkerhet, kommunikasjon og riktig bruk av utstyr i reelle arbeidssituasjoner.\n\nVi holder kurs for både privatpersoner og bedrifter i Kragerø og resten av Telemark, og tilbyr opplæring på norsk, engelsk og tegnspråk.',
    E'kontroll og vurdering av løfteredskap\nsignalgiving og kommunikasjon\nstropping og sikring av last\nbelastning og vinkler\nHMS og ansvar\nlover og forskrifter\nsikker arbeidsutførelse i praksis',
    'Kurset passer både for nybegynnere og erfarne deltakere som trenger dokumentert opplæring i trygg anhuking og bruk av løfteredskap i arbeidshverdagen.',
    E'Kurset kombinerer teori og praksis, og gjennomføres av instruktører med erfaring fra bygg, maskin og industri. Vi legger vekt på praktiske eksempler og realistiske situasjoner fremfor bare teori i klasserom.\n\nKurs kan holdes:\n- hos bedriften deres\n- i Kragerø og omegn\n- som bedriftsinternt kurs\n- for mindre eller større grupper\n\nVi tilbyr fleksible løsninger for bedrifter i Telemark som ønsker opplæring for flere ansatte samtidig.',
    'Opplæringen tilpasses deltakergruppe og bransje. Vi avklarer behov, antall deltakere og ønsket gjennomføringsform i forkant for å sikre relevant og effektiv opplæring.',
    'Deltakere får dokumentasjon på gjennomført opplæring etter bestått kurs, i tråd med gjeldende krav.',
    'Varierer etter behov og forkunnskaper',
    'Ingen formelle forkunnskaper',
    'certified',
    ARRAY['no','en','sign'],
    true,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    learning_outcomes = EXCLUDED.learning_outcomes,
    target_audience = EXCLUDED.target_audience,
    course_structure = EXCLUDED.course_structure,
    practical_info = EXCLUDED.practical_info,
    certification_info = EXCLUDED.certification_info,
    duration = EXCLUDED.duration,
    requirements = EXCLUDED.requirements,
    course_type = EXCLUDED.course_type,
    languages = EXCLUDED.languages,
    is_active = EXCLUDED.is_active,
    is_featured = EXCLUDED.is_featured,
    updated_at = now()
  RETURNING id
),
del_faqs AS (
  DELETE FROM public.course_faqs
  WHERE course_id = (SELECT id FROM upsert_course)
  RETURNING 1
)
INSERT INTO public.course_faqs (course_id, question, answer, sort_order, is_published)
SELECT (SELECT id FROM upsert_course), q.question, q.answer, q.sort_order, true
FROM (
  VALUES
    ('Hvor lenge varer G11-kurset?', 'Varigheten varierer ut fra behov og forkunnskaper, men kurset består normalt av teori og praktisk opplæring med dokumentert avslutning.', 10),
    ('Må jeg ha erfaring fra før?', 'Nei, kurset passer både for nybegynnere og personer med erfaring som trenger dokumentert opplæring.', 20),
    ('Tilbyr dere kurs for bedrifter?', 'Ja, vi holder bedriftsinterne kurs for små og store bedrifter i Kragerø og resten av Telemark.', 30),
    ('Kan kurset holdes på engelsk?', 'Ja, vi tilbyr opplæring på norsk, engelsk og tegnspråk.', 40),
    ('Får man kursbevis?', 'Ja, deltakerne får dokumentasjon på gjennomført opplæring etter bestått kurs.', 50)
) AS q(question, answer, sort_order);