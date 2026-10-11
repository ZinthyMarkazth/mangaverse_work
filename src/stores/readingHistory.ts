import { defineStore } from 'pinia'

export interface ReadingHistoryData {
  id: number
  userId: number
  mangaId: number
  chapterId: number
  readAt: string
}

const STORAGE_KEY =
  'mangaverse_reading_history'

export const useReadingHistoryStore =
  defineStore('readingHistory', {
    state: () => ({
      histories:
        [] as ReadingHistoryData[],
    }),

    actions: {
      load() {
        const saved =
          localStorage.getItem(
            STORAGE_KEY,
          )

        if (!saved) {
          this.histories = []
          return
        }

        try {
          const parsed = JSON.parse(saved)

          if (!Array.isArray(parsed)) {
            this.histories = []
            return
          }

          this.histories = parsed
        } catch {
          this.histories = []
        }
      },

      save() {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(this.histories),
        )
      },

      saveReading(
        userId: number,
        mangaId: number,
        chapterId: number,
      ) {
        if (userId <= 0) {
          return
        }

        const existingIndex =
          this.histories.findIndex(
            (history) =>
              history.userId === userId &&
              history.mangaId === mangaId,
          )

        const history: ReadingHistoryData = {
          id:
            existingIndex >= 0
              ? this.histories[
                  existingIndex
                ]!.id
              : Date.now(),

          userId,

          mangaId,

          chapterId,

          readAt:
            new Date().toISOString(),
        }

        if (existingIndex >= 0) {
          this.histories[
            existingIndex
          ] = history
        } else {
          this.histories.push(history)
        }

        this.save()
      },

      getLastChapter(
        userId: number,
        mangaId: number,
      ) {
        return this.histories.find(
          (history) =>
            history.userId === userId &&
            history.mangaId === mangaId,
        )
      },

      removeHistory(
        userId: number,
        mangaId: number,
      ) {
        this.histories =
          this.histories.filter(
            (history) =>
              !(
                history.userId === userId &&
                history.mangaId === mangaId
              ),
          )

        this.save()
      },
    },
  })