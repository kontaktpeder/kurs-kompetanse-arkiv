-- Truck
WITH up AS (
  INSERT INTO public.courses (
    title, slug, short_description, description,
    learning_outcomes, target_audience, course_structure,
    practical_info, certification_info, duration, requirements,
    course_type, languages, is_active, is_featured
  ) VALUES (
    'Truckkurs i Telemark',
    'truckkurs-telemark',
    'Ta truckkurs i Telemark med praktisk og dokumentert opplæring. Kurs for bedrifter og privatpersoner innen lager, industri og transport.',
    E'Truckkurs passer for deg som skal kjøre truck på lager, terminal, verksted, industriområde eller byggeplass. Hos KursKragerø får du praktisk og dokumentert opplæring med fokus på trygg kjøring, riktig godshåndtering og god HMS i arbeidshverdagen.\n\nVi holder truckkurs for både bedrifter og privatpersoner i Kragerø og resten av Telemark, og kan tilpasse gjennomføringen etter behov, erfaring og type arbeidsplass.',
    E'sikker kjøring og manøvrering\nlasting og lossing\nstabilitet og tyngdepunkt\ndaglig kontroll av truck\nHMS og internkontroll\nriktig bruk i trange områder\nansvar som truckfører\ndokumentasjon av opplæring',
    'Truckkurs er aktuelt for ansatte og privatpersoner som skal bruke truck på lager, terminal, industri, verksted, transport eller byggeplass.',
    E'Truckkurset kombinerer teori og praktisk opplæring. Vi bruker konkrete eksempler fra arbeidshverdagen og legger vekt på at deltakerne faktisk forstår hvordan truck brukes trygt i praksis.\n\nKurset kan gjennomføres som bedriftsinternt kurs eller for enkeltpersoner. For bedrifter i Telemark kan vi avtale gjennomføring tilpasset drift, skift og tilgjengelig utstyr.\n\nVi tilbyr opplæring på norsk, engelsk og tegnspråk der det er behov for det.',
    E'KursKragerø har drevet med opplæring siden 2006 og har praktisk erfaring fra bygg, maskin, transport og industri. Vi passer særlig godt for bedrifter som ønsker ryddig, fleksibel og praktisk opplæring uten unødvendig komplisering. Målet er at deltakerne skal sitte igjen med trygghet, dokumentasjon og bedre forståelse for sikker bruk av truck.',
    'Deltakere får dokumentasjon på gjennomført opplæring etter bestått kurs.',
    'Varierer etter behov og forkunnskaper',
    'Ingen formelle forkunnskaper',
    'certified',
    ARRAY['no','en','sign'],
    true,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    title=EXCLUDED.title, short_description=EXCLUDED.short_description, description=EXCLUDED.description,
    learning_outcomes=EXCLUDED.learning_outcomes, target_audience=EXCLUDED.target_audience,
    course_structure=EXCLUDED.course_structure, practical_info=EXCLUDED.practical_info,
    certification_info=EXCLUDED.certification_info, duration=EXCLUDED.duration,
    requirements=EXCLUDED.requirements, course_type=EXCLUDED.course_type,
    languages=EXCLUDED.languages, is_active=EXCLUDED.is_active, is_featured=EXCLUDED.is_featured,
    updated_at=now()
  RETURNING id
), del AS (
  DELETE FROM public.course_faqs WHERE course_id = (SELECT id FROM up) RETURNING 1
)
INSERT INTO public.course_faqs (course_id, question, answer, sort_order, is_published)
SELECT (SELECT id FROM up), q.question, q.answer, q.sort_order, true FROM (VALUES
  ('Hvem trenger truckkurs?', 'Alle som skal bruke truck i arbeid må ha dokumentert opplæring. Dette gjelder blant annet lager, terminal, industri, verksted, transport og byggeplass.', 10),
  ('Kan truckkurset holdes hos bedriften?', 'Ja, vi kan holde bedriftsinterne truckkurs for bedrifter i Kragerø, Telemark og omegn, avhengig av behov og tilgjengelig utstyr.', 20),
  ('Tilbyr dere truckkurs på engelsk?', 'Ja, vi tilbyr opplæring på norsk, engelsk og tegnspråk ved behov.', 30),
  ('Får man dokumentasjon etter kurset?', 'Ja, deltakerne får dokumentasjon på gjennomført opplæring etter bestått kurs.', 40),
  ('Kan privatpersoner melde seg på truckkurs?', 'Ja, både privatpersoner og bedrifter kan ta kontakt for kursdato, pris og tilgjengelighet.', 50)
) AS q(question, answer, sort_order);

-- Fallsikring
WITH up AS (
  INSERT INTO public.courses (
    title, slug, short_description, description,
    learning_outcomes, target_audience, course_structure,
    practical_info, certification_info, duration, requirements,
    course_type, languages, is_active, is_featured
  ) VALUES (
    'Fallsikringskurs i Telemark',
    'fallsikringskurs-telemark',
    'Ta fallsikringskurs i Telemark. Praktisk opplæring i trygg bruk av sele, forankring og arbeid i høyden. For bedrifter og privatpersoner.',
    E'Fallsikringskurs er for deg som skal arbeide i høyden, på tak, i lift, på stillas eller andre steder hvor det er risiko for fall. Hos KursKragerø får du praktisk og dokumentert opplæring i trygg bruk av fallsikringsutstyr og gode rutiner før, under og etter arbeid i høyden.\n\nVi holder fallsikringskurs for bedrifter og privatpersoner i Kragerø og resten av Telemark, med fokus på praktisk forståelse og sikker gjennomføring.',
    E'bruk av sele og line\nvalg av forankringspunkt\nkontroll av utstyr før bruk\narbeid i høyden\nrisikovurdering\nfallfaktor og pendelfall\nenkel redningsforståelse\nHMS og ansvar',
    'Fallsikringskurs er aktuelt for alle som skal arbeide i høyden eller bruke fallsikringsutstyr, for eksempel på tak, i lift, på stillas, i bygg, industri eller vedlikehold.',
    E'Kurset kombinerer teori og praktiske øvelser. Vi bruker konkrete eksempler fra bygg, anlegg, industri og vedlikehold, slik at deltakerne kjenner igjen situasjonene fra egen arbeidshverdag.\n\nFallsikringskurs kan gjennomføres for enkeltpersoner eller som bedriftsinternt kurs. For bedrifter kan opplæringen tilpasses type arbeid, arbeidssted og utstyr som brukes i virksomheten.\n\nVi tilbyr opplæring på norsk, engelsk og tegnspråk ved behov.',
    E'KursKragerø har drevet med opplæring siden 2006 og har praktisk bakgrunn fra bygg, maskin og industri. Arbeid i høyden krever mer enn papirarbeid. Deltakerne må forstå hva som kan gå galt, hvordan utstyret skal brukes, og hvilke rutiner som faktisk gjør arbeidet tryggere.',
    'Deltakere får dokumentasjon på gjennomført opplæring etter bestått kurs.',
    'Varierer etter behov og forkunnskaper',
    'Ingen formelle forkunnskaper',
    'certified',
    ARRAY['no','en','sign'],
    true,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    title=EXCLUDED.title, short_description=EXCLUDED.short_description, description=EXCLUDED.description,
    learning_outcomes=EXCLUDED.learning_outcomes, target_audience=EXCLUDED.target_audience,
    course_structure=EXCLUDED.course_structure, practical_info=EXCLUDED.practical_info,
    certification_info=EXCLUDED.certification_info, duration=EXCLUDED.duration,
    requirements=EXCLUDED.requirements, course_type=EXCLUDED.course_type,
    languages=EXCLUDED.languages, is_active=EXCLUDED.is_active, is_featured=EXCLUDED.is_featured,
    updated_at=now()
  RETURNING id
), del AS (
  DELETE FROM public.course_faqs WHERE course_id = (SELECT id FROM up) RETURNING 1
)
INSERT INTO public.course_faqs (course_id, question, answer, sort_order, is_published)
SELECT (SELECT id FROM up), q.question, q.answer, q.sort_order, true FROM (VALUES
  ('Hvem trenger fallsikringskurs?', 'Fallsikringskurs er aktuelt for alle som skal arbeide i høyden eller bruke fallsikringsutstyr, for eksempel på tak, i lift, på stillas, i bygg, industri eller vedlikehold.', 10),
  ('Må jeg ha med eget utstyr?', 'Det avtales før kurset. Ved bedriftsinterne kurs kan opplæringen ofte ta utgangspunkt i utstyret bedriften faktisk bruker.', 20),
  ('Kan kurset holdes hos bedriften?', 'Ja, vi kan holde fallsikringskurs for bedrifter i Kragerø, Telemark og omegn.', 30),
  ('Tilbyr dere kurs på engelsk?', 'Ja, opplæring kan tilbys på norsk, engelsk og tegnspråk ved behov.', 40),
  ('Får man kursbevis?', 'Ja, deltakerne får dokumentasjon på gjennomført opplæring etter bestått kurs.', 50)
) AS q(question, answer, sort_order);