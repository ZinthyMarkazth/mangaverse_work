import { defineStore } from 'pinia'

export interface BookshelfManga {
  id: number
  title: string
  cover: string
  chapter: number
}

const STORAGE_KEY = 'mangaverse_bookshelf'

export const useBookshelfStore = defineStore('bookshelf', {
  state: () => ({
    mangaList: loadBookshelf(),
  }),

  getters: {
    isInBookshelf: (state) => {
      return (mangaId: number) => {
        return state.mangaList.some(
          (manga) => manga.id === mangaId,
        )
      }
    },
  },

  actions: {
    addToBookshelf(manga: BookshelfManga) {
      const exists = this.mangaList.some(
        (item) => item.id === manga.id,
      )

      if (exists) {
        return false
      }

      this.mangaList.push({
        ...manga,
      })

      this.saveBookshelf()

      return true
    },

    removeFromBookshelf(mangaId: number) {
      this.mangaList = this.mangaList.filter(
        (manga) => manga.id !== mangaId,
      )

      this.saveBookshelf()
    },

    updateChapter(
      mangaId: number,
      chapter: number,
    ) {
      const manga = this.mangaList.find(
        (item) => item.id === mangaId,
      )

      if (!manga) return

      manga.chapter = chapter

      this.saveBookshelf()
    },

    saveBookshelf() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(this.mangaList),
      )
    },
  },
})

function loadBookshelf(): BookshelfManga[] {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return [
      {
        id: 1,
        title: 'One Piece',
        cover:
          'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=600',
        chapter: 100,
      },
    ]
  }

  try {
    const parsed = JSON.parse(saved)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.map((manga) => ({
      id: Number(manga.id),
      title: String(manga.title),
      cover: String(manga.cover),
      chapter: Number(manga.chapter),
    }))
  } catch (error) {
    console.error(
      'ไม่สามารถโหลดข้อมูลชั้นหนังสือได้',
      error,
    )

    return []
  }
}