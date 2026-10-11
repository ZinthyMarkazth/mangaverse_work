import { requireSupabase } from '@/lib/supabaseClient'

export type MangaInput = {
  title: string
  author?: string
  description?: string
  category?: string
  latest_chapter?: number
  status?: string
  cover_path?: string | null
}
export type ChapterInput = { manga_id: number; chapter_number: number; title?: string }
export type MangaRecord = {
  id: number; title: string; author: string; description: string
  category: string; latest_chapter: number; status: string
  cover_path: string | null; created_at: string
}

export const mangaRepository = {
  async list(search = '') {
    let query = requireSupabase().from('manga').select('*').order('title')
    if (search.trim()) query = query.ilike('title', `%${search.trim().replace(/[%_]/g, '\\$&')}%`)
    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as MangaRecord[]
  },
  async get(id: number) {
    const { data, error } = await requireSupabase().from('manga').select('*').eq('id', id).single()
    if (error) throw error
    return data as MangaRecord
  },
  async create(input: MangaInput) {
    const { data, error } = await requireSupabase().from('manga').insert(input).select().single()
    if (error) throw error
    return data as MangaRecord
  },
  async update(id: number, input: Partial<MangaInput>) {
    const { data, error } = await requireSupabase().from('manga').update(input).eq('id', id).select().single()
    if (error) throw error
    return data as MangaRecord
  },
  async remove(id: number) {
    const { error } = await requireSupabase().from('manga').delete().eq('id', id)
    if (error) throw error
  },
}

export const chapterRepository = {
  async list(mangaId: number) {
    const { data, error } = await requireSupabase()
      .from('chapters')
      .select('id,manga_id,chapter_number,title,created_at,chapter_images(id,image_path,image_order)')
      .eq('manga_id', mangaId).order('chapter_number')
    if (error) throw error
    return data ?? []
  },
  async create(input: ChapterInput) {
    const { data, error } = await requireSupabase().from('chapters').insert(input).select().single()
    if (error) throw error
    return data
  },
  async remove(id: number) {
    const { error } = await requireSupabase().from('chapters').delete().eq('id', id)
    if (error) throw error
  },
  async replaceImages(chapterId: number, paths: string[]) {
    const client = requireSupabase()
    const rows = paths.map((image_path, i) => ({
      chapter_id: chapterId, image_path, image_order: i + 1,
    }))
    const { error: deleteError } = await client.from('chapter_images').delete().eq('chapter_id', chapterId)
    if (deleteError) throw deleteError
    if (rows.length) {
      const { error } = await client.from('chapter_images').insert(rows)
      if (error) throw error
    }
  },
}

export const bookshelfRepository = {
  async list() {
    const { data, error } = await requireSupabase().from('bookshelf')
      .select('manga_id,added_at,manga(id,title,author,cover_path,latest_chapter,status)')
      .order('added_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },
  async add(mangaId: number) {
    const client = requireSupabase()
    const { data: { user }, error: authError } = await client.auth.getUser()
    if (authError) throw authError
    if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนเพิ่มเข้าชั้นหนังสือ')
    const { error } = await client.from('bookshelf').insert({ user_id: user.id, manga_id: mangaId })
    if (error && error.code !== '23505') throw error
  },
  async remove(mangaId: number) {
    const { error } = await requireSupabase().from('bookshelf').delete().eq('manga_id', mangaId)
    if (error) throw error
  },
}

export const readingRepository = {
  async save(mangaId: number, chapterId: number) {
    const client = requireSupabase()
    const { data: { user }, error: authError } = await client.auth.getUser()
    if (authError) throw authError
    if (!user) return
    const { error } = await client.from('reading_progress').upsert({
      user_id: user.id, manga_id: mangaId, chapter_id: chapterId, read_at: new Date().toISOString(),
    }, { onConflict: 'user_id,manga_id' })
    if (error) throw error
  },
  async get(mangaId: number) {
    const { data, error } = await requireSupabase().from('reading_progress')
      .select('manga_id,chapter_id,read_at,chapters(id,chapter_number,title)')
      .eq('manga_id', mangaId).maybeSingle()
    if (error) throw error
    return data
  },
}

export const categoryRepository = {
  async list() {
    const { data, error } = await requireSupabase().from('custom_categories')
      .select('id,name,created_at,custom_category_manga(manga_id)').order('name')
    if (error) throw error
    return data ?? []
  },
  async create(name: string) {
    const client = requireSupabase()
    const { data: { user }, error: authError } = await client.auth.getUser()
    if (authError) throw authError
    if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนสร้างหมวดหมู่')
    const { data, error } = await client.from('custom_categories')
      .insert({ user_id: user.id, name: name.trim() }).select().single()
    if (error) throw error
    return data
  },
  async addManga(categoryId: number, mangaId: number) {
    const { error } = await requireSupabase().from('custom_category_manga')
      .insert({ category_id: categoryId, manga_id: mangaId })
    if (error && error.code !== '23505') throw error
  },
  async removeManga(categoryId: number, mangaId: number) {
    const { error } = await requireSupabase().from('custom_category_manga')
      .delete().eq('category_id', categoryId).eq('manga_id', mangaId)
    if (error) throw error
  },
  async remove(categoryId: number) {
    const { error } = await requireSupabase().from('custom_categories').delete().eq('id', categoryId)
    if (error) throw error
  },
}

export async function uploadMangaImage(
  bucket: 'manga-covers' | 'manga-pages',
  file: File,
) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) throw new Error('รองรับเฉพาะ JPG, PNG และ WebP')
  const maxBytes = bucket === 'manga-covers' ? 5 * 1024 * 1024 : 10 * 1024 * 1024
  if (file.size > maxBytes) throw new Error(`ไฟล์มีขนาดเกิน ${maxBytes / 1024 / 1024} MB`)
  const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1]
  const path = `${crypto.randomUUID()}.${ext}`
  const { data, error } = await requireSupabase().storage.from(bucket).upload(path, file, {
    contentType: file.type, upsert: false,
  })
  if (error) throw error
  return data.path
}

export function publicImageUrl(bucket: 'manga-covers' | 'manga-pages', path: string) {
  const { data } = requireSupabase().storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
