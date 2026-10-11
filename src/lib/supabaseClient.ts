import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export const isSupabaseConfigured = Boolean(url && key)

// Keep the app renderable when environment variables have not been set yet.
// Database operations must go through requireSupabase() so configuration errors
// are shown at the point of use rather than crashing the entire app on startup.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, key!)
  : null

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'ยังไม่ได้ตั้งค่า Supabase กรุณากำหนด VITE_SUPABASE_URL และ VITE_SUPABASE_PUBLISHABLE_KEY ในไฟล์ .env.local หรือ Environment Variables ของ Vercel',
    )
  }

  return supabase
}
