
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
)
export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseKey
)
export function requireSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'กรุณาตั้งค่า VITE_SUPABASE_URL และ VITE_SUPABASE_PUBLISHABLE_KEY',
    )
  }

  return supabase
}
