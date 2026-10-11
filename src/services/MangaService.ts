import { ref, type Ref } from 'vue'
import { requireSupabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { Manga } from '@/models/Manga'

const mangaList: Ref<Manga[]> = ref([])
let loadPromise: Promise<void> | null = null

function statusFromDatabase(value: unknown): string {
  switch (String(value ?? '').toLowerCase()) {
    case 'completed': return 'จบแล้ว'
    case 'hiatus': return 'พักการเขียน'
    case 'ongoing': return 'กำลังดำเนินเรื่อง'
    case 'จบแล้ว': return 'จบแล้ว'
    case 'พักการเขียน': return 'พักการเขียน'
    default: return 'กำลังดำเนินเรื่อง'
  }
}

function statusToDatabase(value: string): string {
  switch (value) {
    case 'จบแล้ว':
    case 'completed': return 'completed'
    case 'พักการเขียน':
    case 'hiatus': return 'hiatus'
    default: return 'ongoing'
  }
}

function fromRow(row: Record<string, unknown>): Manga {
  return new Manga(
    Number(row.id),
    String(row.title ?? ''),
    String(row.author ?? ''),
    String(row.description ?? ''),
    String(row.category ?? ''),
    Number(row.latest_chapter ?? 0),
    statusFromDatabase(row.status),
    String(row.cover_path ?? ''),
  )
}

function toRow(manga: Manga) {
  return {
    title: manga.title.trim(),
    author: manga.author.trim(),
    description: manga.description.trim(),
    category: manga.category.trim(),
    latest_chapter: Number(manga.latestChapter) || 0,
    status: statusToDatabase(manga.status),
    cover_path: manga.cover.trim() || null,
  }
}

export class MangaService {
  readonly ready: Promise<void>

  constructor() {
    if (!loadPromise) {
      loadPromise = this.loadFromDatabase().catch((error) => {
        loadPromise = null
        throw error
      })
    }
    this.ready = loadPromise
  }

  private async loadFromDatabase(): Promise<void> {
    if (!isSupabaseConfigured) {
      console.warn('Supabase ยังไม่ได้ตั้งค่า จึงยังโหลดข้อมูลมังงะไม่ได้')
      mangaList.value = []
      return
    }
    const { data, error } = await requireSupabase()
      .from('manga')
      .select('id,title,author,description,category,latest_chapter,status,cover_path')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('โหลดมังงะจาก Supabase ไม่สำเร็จ:', error.message)
      throw error
    }
    mangaList.value = (data ?? []).map((row) => fromRow(row as Record<string, unknown>))
  }

 getAllManga(): Manga[] {
  return [...mangaList.value]
}

getMangaById(id: number): Manga | undefined {
  return mangaList.value.find(
    (manga: Manga) => Number(manga.id) === Number(id)
  )
}

  async createManga(manga: Manga): Promise<boolean> {
    const { data, error } = await requireSupabase()
      .from('manga').insert(toRow(manga)).select().single()
    if (error) {
      console.error('เพิ่มมังงะไม่สำเร็จ:', error.message)
      return false
    }
    mangaList.value = [fromRow(data as Record<string, unknown>), ...mangaList.value]
    return true
  }

  async updateManga(manga: Manga): Promise<boolean> {
    const { data, error } = await requireSupabase()
      .from('manga').update(toRow(manga)).eq('id', manga.id).select().single()
    if (error || !data) {
      console.error('บันทึกมังงะไม่สำเร็จ:', error?.message ?? 'ไม่พบข้อมูล')
      return false
    }
    const updated = fromRow(data as Record<string, unknown>)
    mangaList.value = mangaList.value.map((item) => item.id === updated.id ? updated : item)
    return true
  }

  async deleteManga(id: number): Promise<boolean> {
    const { error } = await requireSupabase().from('manga').delete().eq('id', id)
    if (error) {
      console.error('ลบมังงะไม่สำเร็จ:', error.message)
      return false
    }
    mangaList.value = mangaList.value.filter((manga) => manga.id !== id)
    return true
  }
}

export async function getMangaList() {
  const { data, error } = await requireSupabase()
    .from('manga')
    .select('id,title,author,description,category,latest_chapter,status,cover_path,created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function addManga(title: string, description = '') {
  const cleanTitle = title.trim()
  if (!cleanTitle) throw new Error('กรุณาระบุชื่อมังงะ')
  const { data, error } = await requireSupabase()
    .from('manga').insert({ title: cleanTitle, description: description.trim() }).select().single()
  if (error) throw error
  return data
}
