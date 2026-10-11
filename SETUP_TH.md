# MangaVerse: ขั้นตอนเปิดใช้งานหลังแก้ไข

1. ตั้งค่า `.env.local` ในโฟลเดอร์เดียวกับ `package.json`:
   - `VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY`
   ใช้ค่าจาก Supabase > Project Settings > API Keys ห้ามใส่ service_role key ในเว็บ
2. เปิด Supabase > SQL Editor แล้วรันไฟล์ `SUPABASE_REPAIR_SQL_TH.sql`
3. ตั้งบัญชีผู้ดูแลหลังจากล็อกอินสมัครบัญชีแล้ว โดยเปลี่ยนอีเมลในคำสั่งตัวอย่างท้ายไฟล์ SQL และรัน:
   `UPDATE public.profiles p SET role='admin' FROM auth.users u WHERE p.id=u.id AND lower(u.email)=lower('YOUR_LOGIN_EMAIL');`
4. ออกจากระบบเว็บแล้วล็อกอินใหม่
5. ติดตั้ง/รัน: `npm ci`, `npm run build`, `npm run dev`

## รูปภาพ
รูปปกและรูปหน้าตอนใหม่จะอัปโหลดไปยัง Supabase Storage (`manga-covers`, `manga-pages`) แทนการบันทึก base64 ลงในตาราง. จำกัดรูปปก 5 MB และรูปหน้าตอน 10 MB; รองรับ JPG, PNG, WebP. ไฟล์ SQL จะสร้าง buckets และ policies ที่ต้องใช้.

## สถานะมังงะ
หน้าเว็บใช้คำภาษาไทย แต่บันทึกลงฐานข้อมูลเป็น `ongoing`, `completed`, `hiatus` ให้ตรงกับ CHECK constraint ของตาราง `manga`.
