import { requireSupabase } from '@/lib/supabaseClient'

const MAX_COVER_BYTES = 5 * 1024 * 1024
const MAX_PAGE_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

/** Upload an image to Supabase Storage and return its public URL. */
export async function uploadMangaImage(file: File, kind: 'cover' | 'page', mangaId?: number): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('รองรับเฉพาะไฟล์ JPG, PNG หรือ WebP')
  }
  const limit = kind === 'cover' ? MAX_COVER_BYTES : MAX_PAGE_BYTES
  if (file.size > limit) {
    throw new Error(kind === 'cover' ? 'รูปปกต้องมีขนาดไม่เกิน 5 MB' : 'รูปหน้าต้องมีขนาดไม่เกิน 10 MB')
  }
  const supabase = requireSupabase()
  const bucket = kind === 'cover' ? 'manga-covers' : 'manga-pages'
  const extension = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp'
  const folder = kind === 'cover' ? 'covers' : `manga-${mangaId ?? 'unassigned'}`
  const path = `${folder}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
