# คู่มือตั้งค่า Supabase และ Deploy บน Vercel (MangaVerse)

## 1. เตรียม Supabase
1. สร้างโปรเจกต์ใน Supabase
2. เปิด **SQL Editor** แล้วรันไฟล์ `supabase/migrations/202610110001_mangaverse.sql` ทั้งไฟล์
3. ไปที่ **Project Settings → API** (หรือ Connect) แล้วคัดลอก Project URL และ Publishable key
4. ไปที่ **Authentication → URL Configuration** ตั้ง Site URL เป็น URL ที่ได้จาก Vercel และเพิ่ม URL สำหรับ redirect ที่ใช้งานจริง
5. สมัครบัญชีผ่านหน้า Register ก่อน จากนั้นใน SQL Editor กำหนดบัญชีผู้ดูแลระบบด้วยคำสั่งด้านล่าง โดยแทนค่าอีเมลให้ตรงกับบัญชีของตัวเอง:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where lower(email) = lower('YOUR_EMAIL@example.com')
);
```

อย่าเปิดสิทธิ์ให้ผู้ใช้ทั่วไปแก้ `profiles.role` และห้ามนำ `service_role` key มาใส่ใน frontend

## 2. รันในเครื่อง
1. เปิด Terminal ที่โฟลเดอร์ `mangaverse_work`
2. ติดตั้ง dependencies: `npm ci`
3. สร้างไฟล์ `.env.local` จาก `.env.example` แล้วใส่ค่าจริง:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

4. รัน `npm run dev`
5. ทดสอบ build ด้วย `npm run build` ก่อน deploy

## 3. Deploy บน Vercel
1. Push โปรเจกต์ขึ้น GitHub โดยไม่ commit `.env.local`
2. ใน Vercel เลือก **Add New → Project** แล้ว import repository
3. ตั้ง **Root Directory** เป็น `mangaverse_work`
4. Framework Preset: **Vite**; Build Command: `npm run build`; Output Directory: `dist`
5. ใน **Environment Variables** เพิ่ม `VITE_SUPABASE_URL` และ `VITE_SUPABASE_PUBLISHABLE_KEY` ทั้ง Production และ Preview ตามต้องการ
6. Deploy แล้วนำ URL ที่ได้ไปเพิ่มใน Supabase Authentication URL Configuration

มี `vercel.json` สำหรับให้ Vue Router history fallback ทำงานเมื่อเปิด URL ภายในเว็บโดยตรง

## ข้อควรรู้
- การตั้งค่า Supabase และรัน migration เป็นขั้นตอนที่ต้องทำในบัญชี Supabase ของเจ้าของโปรเจกต์ จึงไม่สามารถทำแทนจากไฟล์ ZIP ได้
- ตารางมังงะใช้ Supabase แล้ว แต่ระบบจัดการ Chapter/รูปตอน, ชั้นหนังสือ, ประวัติการอ่าน และหมวดหมู่แบบกำหนดเองยังมีส่วนที่ใช้ `localStorage` ในโค้ดเดิม ต้องย้ายแต่ละส่วนไปใช้ repository และ RLS ให้ครบก่อนถือว่าเป็นระบบฐานข้อมูลเต็มรูปแบบ
- รูปปกที่เป็น data URL ไม่เหมาะกับการเก็บในคอลัมน์ฐานข้อมูล ควรอัปโหลดไป Supabase Storage แล้วเก็บเฉพาะ path
