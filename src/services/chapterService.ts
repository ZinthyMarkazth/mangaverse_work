
import { requireSupabase } from '@/lib/supabaseClient'

export interface ChapterData {
  id: string
  mangaId: string
  chapterNumber: number
  title: string
  images: string[]
}

type ChapterRow = {
  id: string
  manga_id: string
  chapter_number: number | string
  title: string | null
  chapter_images?: {
    image_url: string
    page_number: number
  }[] | null
}

export class ChapterService {
  private mapRow(row: ChapterRow): ChapterData {
    const images = [...(row.chapter_images ?? [])]
      .sort((a, b) => a.page_number - b.page_number)
      .map((image) => image.image_url)

    return {
      id: String(row.id),
      mangaId: String(row.manga_id),
      chapterNumber: Number(row.chapter_number),
      title: row.title ?? '',
      images,
    }
  }

  // Load chapter metadata and image counts only. Do not download every page image
  // just to render the admin list (legacy Base64 images can freeze the browser).
  async getAdminListByMangaId(mangaId: string): Promise<{ id: string; mangaId: string; chapterNumber: number; title: string; imageCount: number }[]> {
    const supabase = requireSupabase()
    const { data, error } = await supabase
      .from('chapters')
      .select('id,manga_id,chapter_number,title,chapter_images(page_number)')
      .eq('manga_id', mangaId)
      .order('chapter_number', { ascending: false })
    if (error) throw error
    return (data ?? []).map((row: any) => ({
      id: String(row.id),
      mangaId: String(row.manga_id),
      chapterNumber: Number(row.chapter_number),
      title: row.title ?? '',
      imageCount: Array.isArray(row.chapter_images) ? row.chapter_images.length : 0,
    }))
  }

  async getByMangaId(mangaId: string): Promise<ChapterData[]> {
    const supabase = requireSupabase()

    const { data, error } = await supabase
      .from('chapters')
      .select(`
        id,
        manga_id,
        chapter_number,
        title,
        chapter_images (
          image_url,
          page_number
        )
      `)
      .eq('manga_id', mangaId)
      .order('chapter_number', { ascending: false })

    if (error) throw error

    return ((data ?? []) as unknown as ChapterRow[])
      .map((row) => this.mapRow(row))
  }

  async getById(chapterId: string): Promise<ChapterData | undefined> {
    const supabase = requireSupabase()

    const { data, error } = await supabase
      .from('chapters')
      .select(`
        id,
        manga_id,
        chapter_number,
        title,
        chapter_images (
          image_url,
          page_number
        )
      `)
      .eq('id', chapterId)
      .maybeSingle()

    if (error) throw error
    if (!data) return undefined

    return this.mapRow(data as unknown as ChapterRow)
  }

  async create(
    mangaId: string,
    chapterNumber: number,
    title: string,
    images: string[] = [],
  ): Promise<ChapterData | null> {
    const supabase = requireSupabase()

    const { data: existing, error: checkError } = await supabase
      .from('chapters')
      .select('id')
      .eq('manga_id', mangaId)
      .eq('chapter_number', chapterNumber)
      .maybeSingle()

    if (checkError) throw checkError
    if (existing) return null

    const { data: chapter, error } = await supabase
      .from('chapters')
      .insert({
        manga_id: mangaId,
        chapter_number: chapterNumber,
        title: title.trim(),
      })
      .select('id, manga_id, chapter_number, title')
      .single()

    if (error) throw error

    if (images.length > 0) {
      const rows = images.map((imagePath, index) => ({
        chapter_id: chapter.id,
        image_url: imagePath,
        page_number: index + 1,
      }))

      const { error: imageError } = await supabase
        .from('chapter_images')
        .insert(rows)

      if (imageError) {
        // Avoid leaving an empty chapter if saving its images fails.
        await supabase.from('chapters').delete().eq('id', chapter.id)
        throw imageError
      }
    }

    return this.getById(String(chapter.id)) as Promise<ChapterData>
  }

  async update(updated: ChapterData): Promise<boolean> {
    const supabase = requireSupabase()

    const { data: duplicate, error: checkError } = await supabase
      .from('chapters')
      .select('id')
      .eq('manga_id', updated.mangaId)
      .eq('chapter_number', updated.chapterNumber)
      .neq('id', updated.id)
      .maybeSingle()

    if (checkError) throw checkError
    if (duplicate) return false

    const { error } = await supabase
      .from('chapters')
      .update({
        chapter_number: updated.chapterNumber,
        title: updated.title.trim(),
      })
      .eq('id', updated.id)

    if (error) throw error

    const { error: deleteImagesError } = await supabase
      .from('chapter_images')
      .delete()
      .eq('chapter_id', updated.id)

    if (deleteImagesError) throw deleteImagesError

    if (updated.images.length > 0) {
      const rows = updated.images.map((imagePath, index) => ({
        chapter_id: updated.id,
        image_url: imagePath,
        page_number: index + 1,
      }))

      const { error: insertImagesError } = await supabase
        .from('chapter_images')
        .insert(rows)

      if (insertImagesError) throw insertImagesError
    }

    return true
  }

  async delete(chapterId: string): Promise<boolean> {
    const supabase = requireSupabase()

    const { data, error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId)
      .select('id')

    if (error) throw error
    return (data?.length ?? 0) > 0
  }

  async getLatestChapter(
    mangaId: string,
  ): Promise<ChapterData | undefined> {
    const chapters = await this.getByMangaId(mangaId)
    return chapters.reduce<ChapterData | undefined>(
      (latest, chapter) =>
        !latest || chapter.chapterNumber > latest.chapterNumber
          ? chapter
          : latest,
      undefined,
    )
  }

  async getChapterCount(mangaId: string): Promise<number> {
    const supabase = requireSupabase()

    const { count, error } = await supabase
      .from('chapters')
      .select('id', { count: 'exact', head: true })
      .eq('manga_id', mangaId)

    if (error) throw error
    return count ?? 0
  }
}
