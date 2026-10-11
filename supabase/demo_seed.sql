-- MangaVerse demo seed: run in Supabase SQL Editor.
-- Adds only missing columns, inserts three demo titles if absent, and updates existing demo rows.
-- Chapters/pages are seeded in this browser's localStorage by MangaService.ts using original placeholder SVGs.

ALTER TABLE public.manga
  ADD COLUMN IF NOT EXISTS author text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS latest_chapter numeric(8,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'กำลังดำเนินเรื่อง',
  ADD COLUMN IF NOT EXISTS cover_path text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

INSERT INTO public.manga (title, author, description, category, latest_chapter, status, cover_path)
SELECT v.title, v.author, v.description, v.category, 3, 'กำลังดำเนินเรื่อง', v.cover_path
FROM (VALUES
  ('The Bully In-Charge', '', 'ตัวอย่างเรื่องแนวโรงเรียนและแอ็กชันสำหรับทดสอบหน้ารายละเอียดและตัวอ่าน', 'Action, School, Drama', '/demo-covers/bully.svg'),
  ('The Beginning After the End', '', 'ตัวอย่างเรื่องแฟนตาซีและผจญภัยสำหรับทดสอบหน้ารายละเอียดและตัวอ่าน', 'Fantasy, Adventure, Action', '/demo-covers/tbate.svg'),
  ('Magic Emperor', '', 'ตัวอย่างเรื่องแฟนตาซีและจอมยุทธ์สำหรับทดสอบหน้ารายละเอียดและตัวอ่าน', 'Fantasy, Action, Martial Arts', '/demo-covers/magic-emperor.svg')
) AS v(title, author, description, category, cover_path)
WHERE NOT EXISTS (
  SELECT 1 FROM public.manga m WHERE lower(trim(m.title)) = lower(trim(v.title))
);

UPDATE public.manga SET
  category = CASE title
    WHEN 'The Bully In-Charge' THEN 'Action, School, Drama'
    WHEN 'The Beginning After the End' THEN 'Fantasy, Adventure, Action'
    WHEN 'Magic Emperor' THEN 'Fantasy, Action, Martial Arts'
    ELSE category END,
  latest_chapter = CASE WHEN coalesce(latest_chapter, 0) < 3 THEN 3 ELSE latest_chapter END,
  cover_path = CASE title
    WHEN 'The Bully In-Charge' THEN '/demo-covers/bully.svg'
    WHEN 'The Beginning After the End' THEN '/demo-covers/tbate.svg'
    WHEN 'Magic Emperor' THEN '/demo-covers/magic-emperor.svg'
    ELSE cover_path END,
  description = CASE
    WHEN title = 'The Bully In-Charge' AND coalesce(description, '') = '' THEN 'ตัวอย่างเรื่องแนวโรงเรียนและแอ็กชันสำหรับทดสอบหน้ารายละเอียดและตัวอ่าน'
    WHEN title = 'The Beginning After the End' AND coalesce(description, '') = '' THEN 'ตัวอย่างเรื่องแฟนตาซีและผจญภัยสำหรับทดสอบหน้ารายละเอียดและตัวอ่าน'
    WHEN title = 'Magic Emperor' AND coalesce(description, '') = '' THEN 'ตัวอย่างเรื่องแฟนตาซีและจอมยุทธ์สำหรับทดสอบหน้ารายละเอียดและตัวอ่าน'
    ELSE description END
WHERE title IN ('The Bully In-Charge', 'The Beginning After the End', 'Magic Emperor');

-- Verify the rows inserted/updated.
SELECT id, title, category, latest_chapter, status, cover_path
FROM public.manga
WHERE title IN ('The Bully In-Charge', 'The Beginning After the End', 'Magic Emperor')
ORDER BY title;
