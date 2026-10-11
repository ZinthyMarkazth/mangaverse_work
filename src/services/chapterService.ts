export interface ChapterData {
  id: number
  mangaId: number
  chapterNumber: number
  title: string
  images: string[]
}

const STORAGE_PREFIX =
  'mangaverse_chapters_'

export class ChapterService {
  /* =========================
     Storage Key
  ========================= */

  private getStorageKey(
    mangaId: number,
  ): string {
    return `${STORAGE_PREFIX}${mangaId}`
  }

  /* =========================
     Load Chapters
  ========================= */

  private loadChapters(
    mangaId: number,
  ): ChapterData[] {
    const saved =
      localStorage.getItem(
        this.getStorageKey(mangaId),
      )

    if (!saved) {
      return []
    }

    try {
      const parsed =
        JSON.parse(saved)

      if (!Array.isArray(parsed)) {
        return []
      }

      return parsed
        .map((chapter) => {
          const images =
            Array.isArray(
              chapter.images,
            )
              ? chapter.images
                  .map((image: unknown) =>
                    String(image),
                  )
                  .filter(
                    (image: string) =>
                      image.length > 0,
                  )
              : []

          return {
            id: Number(
              chapter.id,
            ),

            mangaId:
              Number(
                chapter.mangaId ??
                  mangaId,
              ),

            chapterNumber:
              Number(
                chapter.chapterNumber ??
                  chapter.number ??
                  0,
              ),

            title: String(
              chapter.title ?? '',
            ),

            images,
          }
        })
        .filter(
          (chapter) =>
            Number.isFinite(
              chapter.id,
            ) &&
            Number.isFinite(
              chapter.chapterNumber,
            ),
        )
    } catch (error) {
      console.error(
        'ไม่สามารถโหลด Chapter ได้:',
        error,
      )

      return []
    }
  }

  /* =========================
     Save Chapters
  ========================= */

  private saveChapters(
    mangaId: number,
    chapters: ChapterData[],
  ): boolean {
    try {
      localStorage.setItem(
        this.getStorageKey(mangaId),
        JSON.stringify(chapters),
      )

      return true
    } catch (error) {
      console.error(
        'ไม่สามารถบันทึก Chapter ได้:',
        error,
      )

      return false
    }
  }

  /* =========================
     Get Chapters By Manga
  ========================= */

  getByMangaId(
    mangaId: number,
  ): ChapterData[] {
    return this.loadChapters(
      mangaId,
    )
  }

  /* =========================
     Get Chapter By ID
  ========================= */

  getById(
    chapterId: number,
  ): ChapterData | undefined {
    const chapters =
      this.getAllChapters()

    return chapters.find(
      (chapter) =>
        chapter.id === chapterId,
    )
  }

  /* =========================
     Get All Chapters
  ========================= */

  private getAllChapters(): ChapterData[] {
    const allChapters: ChapterData[] =
      []

    for (
      let index = 0;
      index < localStorage.length;
      index++
    ) {
      const key =
        localStorage.key(index)

      if (
        !key ||
        !key.startsWith(
          STORAGE_PREFIX,
        )
      ) {
        continue
      }

      const mangaId =
        Number(
          key.replace(
            STORAGE_PREFIX,
            '',
          ),
        )

      if (
        !Number.isFinite(
          mangaId,
        )
      ) {
        continue
      }

      const chapters =
        this.loadChapters(
          mangaId,
        )

      allChapters.push(
        ...chapters,
      )
    }

    return allChapters
  }

  /* =========================
     Create Chapter
  ========================= */

  create(
    mangaId: number,
    chapterNumber: number,
    title: string,
    images: string[] = [],
  ): ChapterData | null {
    const chapters =
      this.loadChapters(
        mangaId,
      )

    /* ป้องกันเลขตอนซ้ำ */
    const duplicate =
      chapters.some(
        (chapter) =>
          chapter.chapterNumber ===
          chapterNumber,
      )

    if (duplicate) {
      return null
    }

    const newChapter: ChapterData =
      {
        id: Date.now(),
        mangaId,
        chapterNumber,
        title: title.trim(),
        images: [...images],
      }

    chapters.push(
      newChapter,
    )

    const saved =
      this.saveChapters(
        mangaId,
        chapters,
      )

    if (!saved) {
      return null
    }

    return newChapter
  }

  /* =========================
     Update Chapter
  ========================= */

  update(
    updatedChapter: ChapterData,
  ): boolean {
    const chapters =
      this.loadChapters(
        updatedChapter.mangaId,
      )

    const index =
      chapters.findIndex(
        (chapter) =>
          chapter.id ===
          updatedChapter.id,
      )

    if (index === -1) {
      return false
    }

    /* ป้องกันเลขตอนซ้ำ */
    const duplicate =
      chapters.some(
        (chapter) =>
          chapter.id !==
            updatedChapter.id &&
          chapter.chapterNumber ===
            updatedChapter.chapterNumber,
      )

    if (duplicate) {
      return false
    }

    chapters[index] = {
      id: updatedChapter.id,
      mangaId:
        updatedChapter.mangaId,
      chapterNumber:
        updatedChapter.chapterNumber,
      title:
        updatedChapter.title.trim(),
      images: [
        ...updatedChapter.images,
      ],
    }

    return this.saveChapters(
      updatedChapter.mangaId,
      chapters,
    )
  }

  /* =========================
     Delete Chapter
  ========================= */

  delete(
    chapterId: number,
  ): boolean {
    const chapter =
      this.getById(
        chapterId,
      )

    if (!chapter) {
      return false
    }

    const chapters =
      this.loadChapters(
        chapter.mangaId,
      )

    const index =
      chapters.findIndex(
        (item) =>
          item.id ===
          chapterId,
      )

    if (index === -1) {
      return false
    }

    chapters.splice(
      index,
      1,
    )

    return this.saveChapters(
      chapter.mangaId,
      chapters,
    )
  }

  /* =========================
     Latest Chapter
  ========================= */

  getLatestChapter(
    mangaId: number,
  ): ChapterData | undefined {
    const chapters =
      this.loadChapters(
        mangaId,
      )

    if (
      chapters.length === 0
    ) {
      return undefined
    }

    return [...chapters].sort(
      (a, b) =>
        b.chapterNumber -
        a.chapterNumber,
    )[0]
  }

  /* =========================
     Chapter Count
  ========================= */

  getChapterCount(
    mangaId: number,
  ): number {
    return this.loadChapters(
      mangaId,
    ).length
  }
}