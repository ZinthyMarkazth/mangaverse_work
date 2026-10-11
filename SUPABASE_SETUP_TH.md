# MangaVerse + Supabase integration pack

โปรเจกต์นี้ต่อยอดจาก Vue 3 + TypeScript + Vite + Pinia เดิม โดยเพิ่มการเชื่อม Supabase Auth, schema/RLS/Storage migration และ repository สำหรับข้อมูลมังงะ/ตอน/ชั้นหนังสือ/ประวัติอ่าน/หมวดหมู่

## สิ่งที่เตรียมไว้ในชุดนี้

- `src/lib/supabaseClient.ts` — Supabase client และการตรวจว่าตั้งค่า env แล้วหรือยัง
- `src/stores/auth.ts` — สมัครสมาชิก/เข้าสู่ระบบ/ออกจากระบบผ่าน Supabase Auth พร้อมโหลด role จาก `profiles`
- `src/views/LoginView.vue`, `RegisterView.vue` — เปลี่ยนจาก mock login/register มาใช้ Supabase Auth
- `src/router/index.ts` — รอให้ตรวจ session ก่อนตัดสินใจเข้าหน้า protected
- `src/services/supabaseRepository.ts` — API สำหรับ CRUD มังงะ, ตอน, รูปภาพ, bookshelf, reading progress, custom categories และ upload รูป
- `supabase/migrations/202610110001_mangaverse.sql` — ตาราง, foreign keys, indexes, RLS policies, profile trigger และ Storage buckets/policies
- `.env.example` — ตัวอย่าง environment variables

## ติดตั้ง

ต้องใช้ Node.js ตาม `package.json` (Node 22.18+ หรือ 24.12+)

1. แตก ZIP แล้วเปิด Terminal ในโฟลเดอร์ที่มี `package.json`
2. ติดตั้ง dependency:

   ```bash
   npm install
   ```

3. สร้าง Supabase project ที่ https://supabase.com/dashboard
4. คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ Project URL และ Publishable Key จาก Supabase
5. Supabase Dashboard → SQL Editor → วางและรัน `supabase/migrations/202610110001_mangaverse.sql`
6. ตั้งค่า Authentication → URL Configuration ให้ Site URL เป็น URL ที่ใช้พัฒนา เช่น `http://localhost:5173`
7. ถ้าเปิด Email Confirmation ให้ผู้ใช้ยืนยันอีเมลก่อน login; ตั้งค่า SMTP/redirect URL สำหรับ deployment ตามที่ต้องการ
8. รัน:

   ```bash
   npm run dev
   ```

9. ทดสอบ build/type check:

   ```bash
   npm run build
   ```

## กำหนด Admin คนแรก

สมัครบัญชีผ่านหน้า Register ก่อน จากนั้นเปิด SQL Editor:

```sql
select id, email from auth.users;
```

คัดลอก UUID ของบัญชีที่ต้องการเป็น Admin แล้วรัน:

```sql
update public.profiles
set role = 'admin'
where id = 'UUID-ของบัญชีที่ต้องการ';
```

ห้ามเปิดฟังก์ชันให้ผู้ใช้แก้ `profiles.role` เอง และห้ามใส่ Secret/Service Role Key ลงในไฟล์ `.env` ที่ขึ้นต้นด้วย `VITE_` หรือใน frontend source code

## Repository usage

ตัวอย่าง:

```ts
import {
  mangaRepository,
  chapterRepository,
  bookshelfRepository,
  readingRepository,
  categoryRepository,
  uploadMangaImage,
  publicImageUrl,
} from '@/services/supabaseRepository'

const mangas = await mangaRepository.list('one piece')
const manga = await mangaRepository.create({
  title: 'Example Manga',
  author: 'Example Author',
  description: 'Description',
  category: 'Action, Fantasy',
  status: 'กำลังดำเนินเรื่อง',
})

const coverPath = await uploadMangaImage('manga-covers', file)
await mangaRepository.update(manga.id, { cover_path: coverPath })
const coverUrl = publicImageUrl('manga-covers', coverPath)

const chapters = await chapterRepository.list(manga.id)
await readingRepository.save(manga.id, chapters[0].id)
await bookshelfRepository.add(manga.id)
const categories = await categoryRepository.list()
```

ทุกเมธอดที่เรียกฐานข้อมูลเป็น async และอาจ throw error; ให้เรียกผ่าน `try/catch` และแสดงข้อความสถานะใน UI เสมอ

## Schema notes

- `manga.cover_path` และ `chapter_images.image_path` เก็บ Storage path ไม่ใช่รูปภาพ Base64
- `reading_progress` เก็บหนึ่งแถวต่อผู้ใช้ต่อเรื่อง และ upsert เพื่ออัปเดตตอนล่าสุด
- `bookshelf` ใช้ composite primary key ป้องกันเรื่องซ้ำในชั้นหนังสือ
- `custom_categories` เป็นของผู้ใช้แต่ละคน; `custom_category_manga` เชื่อมหมวดหมู่กับเรื่อง
- RLS แยกสิทธิ์ผู้ใช้กับ Admin ที่ฐานข้อมูล ไม่พึ่งการซ่อนปุ่มใน UI
- Storage buckets ใน migration เป็น Public สำหรับการอ่านรูปภาพมังงะ; ใช้เฉพาะเนื้อหาที่ตั้งใจเผยแพร่สาธารณะ หากเป็นเนื้อหาส่วนตัวให้เปลี่ยนเป็น Private และใช้ signed URLs

## สำคัญ: การเชื่อมหน้าที่มีอยู่เดิม

หน้าเดิมหลายหน้า (`HomeView`, `MangaView`, `ReadingView`, `AdminView`, `AdminMangaView`, `CategoryView`, `BookshelfView`, `CustomCategoryView`) ถูกเขียนให้เรียก `MangaService`/`ChapterService` แบบ synchronous และใช้ `localStorage` ดังนั้น repository ใหม่นี้ยังต้องถูกนำไปผูกกับหน้าที่เกี่ยวข้องก่อนข้อมูลทุกฟีเจอร์จะย้ายจาก localStorage ไป Supabase ได้ครบ 100% การแปลง API เหล่านั้นเป็น async ทั้งหมดเป็น breaking change หากเปลี่ยนเพียงไฟล์ Service จะทำให้หน้าเดิมอ่านข้อมูลผิดรูปแบบ

Auth/Login/Register และ route guard ถูกเปลี่ยนให้ใช้ Supabase แล้ว แต่ต้องตั้งค่า `.env.local` และรัน SQL migration ก่อนใช้งานจริง ส่วนข้อมูลเดิมใน `localStorage` จะไม่ถูกย้ายขึ้น Supabase อัตโนมัติ ให้ export/ย้ายข้อมูลเดิมก่อนล้างข้อมูล browser

## Troubleshooting

- `Missing Supabase URL...`: ตรวจ `.env.local` แล้ว restart `npm run dev`
- `Invalid API key`: ใช้ Project URL + Publishable Key ของ project เดียวกัน
- สมัครได้แต่ login ไม่ได้: ตรวจ Email Confirmation และกล่องอีเมล
- `permission denied` / `new row violates row-level security`: ตรวจ role ใน `profiles`, policy, และ user session
- รูปไม่ขึ้น: ตรวจ bucket name, `cover_path`/`image_path`, และ URL ที่สร้าง
- Admin เปิดหน้าได้แต่บันทึกไม่ได้: UI route guard ไม่ใช่สิทธิ์จริง ต้องกำหนด role ผ่าน SQL และตรวจ RLS

## Pre-release checklist

- [ ] สมัครบัญชีใหม่และยืนยันอีเมล (ถ้าเปิด)
- [ ] User ทั่วไปอ่าน catalog ได้แต่เพิ่ม/แก้/ลบมังงะไม่ได้
- [ ] Admin จัดการมังงะและตอนผ่าน repository ได้
- [ ] User A อ่าน/แก้ bookshelf และ reading progress ของ User B ไม่ได้
- [ ] รูปภาพเป็นไฟล์ใน Storage และ path ถูกเก็บในฐานข้อมูล
- [ ] Continue Reading จัดการกรณีไม่มีประวัติหรือ chapter ถูกลบได้
- [ ] `npm run build` ผ่าน
