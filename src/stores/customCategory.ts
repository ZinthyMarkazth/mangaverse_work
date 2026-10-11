import { defineStore } from 'pinia'

export interface CustomCategoryItem {
  id: number
  name: string
  mangaIds: number[]
}

const STORAGE_KEY =
  'mangaverse_custom_categories'

export const useCustomCategoryStore =
  defineStore(
    'customCategory',
    {
      state: () => ({
        categories: loadCategories(),
      }),

      getters: {
        getCategoryById: (state) => {
          return (categoryId: number) => {
            return state.categories.find(
              (category) =>
                category.id === categoryId,
            )
          }
        },

        getMangaIds: (state) => {
          return (categoryId: number) => {
            const category =
              state.categories.find(
                (item) =>
                  item.id === categoryId,
              )

            return (
              category?.mangaIds ?? []
            )
          }
        },

        isMangaInCategory: (state) => {
          return (
            categoryId: number,
            mangaId: number,
          ) => {
            const category =
              state.categories.find(
                (item) =>
                  item.id === categoryId,
              )

            if (!category) {
              return false
            }

            return category.mangaIds.includes(
              mangaId,
            )
          }
        },

        getCategoryCount: (state) => {
          return (categoryId: number) => {
            const category =
              state.categories.find(
                (item) =>
                  item.id === categoryId,
              )

            return (
              category?.mangaIds.length ??
              0
            )
          }
        },
      },

      actions: {
        addCategory(name: string) {
          const categoryName =
            name.trim()

          if (!categoryName) {
            return false
          }

          const exists =
            this.categories.some(
              (category) =>
                category.name.toLowerCase() ===
                categoryName.toLowerCase(),
            )

          if (exists) {
            return false
          }

          const newId =
            this.categories.length > 0
              ? Math.max(
                  ...this.categories.map(
                    (category) =>
                      category.id,
                  ),
                ) + 1
              : 1

          this.categories.push({
            id: newId,
            name: categoryName,
            mangaIds: [],
          })

          this.saveCategories()

          return true
        },

        updateCategory(
          categoryId: number,
          name: string,
        ) {
          const categoryName =
            name.trim()

          if (!categoryName) {
            return false
          }

          const category =
            this.categories.find(
              (item) =>
                item.id === categoryId,
            )

          if (!category) {
            return false
          }

          const duplicate =
            this.categories.some(
              (item) =>
                item.id !== categoryId &&
                item.name.toLowerCase() ===
                  categoryName.toLowerCase(),
            )

          if (duplicate) {
            return false
          }

          category.name =
            categoryName

          this.saveCategories()

          return true
        },

        deleteCategory(
          categoryId: number,
        ) {
          const exists =
            this.categories.some(
              (category) =>
                category.id === categoryId,
            )

          if (!exists) {
            return false
          }

          this.categories =
            this.categories.filter(
              (category) =>
                category.id !==
                categoryId,
            )

          this.saveCategories()

          return true
        },

        addMangaToCategory(
          categoryId: number,
          mangaId: number,
        ) {
          const category =
            this.categories.find(
              (item) =>
                item.id === categoryId,
            )

          if (!category) {
            return false
          }

          if (
            category.mangaIds.includes(
              mangaId,
            )
          ) {
            return false
          }

          category.mangaIds.push(
            mangaId,
          )

          this.saveCategories()

          return true
        },

        removeMangaFromCategory(
          categoryId: number,
          mangaId: number,
        ) {
          const category =
            this.categories.find(
              (item) =>
                item.id === categoryId,
            )

          if (!category) {
            return false
          }

          category.mangaIds =
            category.mangaIds.filter(
              (id) => id !== mangaId,
            )

          this.saveCategories()

          return true
        },

        removeMangaFromAllCategories(
          mangaId: number,
        ) {
          let changed = false

          this.categories.forEach(
            (category) => {
              const originalLength =
                category.mangaIds.length

              category.mangaIds =
                category.mangaIds.filter(
                  (id) =>
                    id !== mangaId,
                )

              if (
                category.mangaIds.length !==
                originalLength
              ) {
                changed = true
              }
            },
          )

          if (changed) {
            this.saveCategories()
          }

          return changed
        },

        saveCategories() {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
              this.categories,
            ),
          )
        },
      },
    },
  )

function loadCategories(): CustomCategoryItem[] {
  const saved =
    localStorage.getItem(
      STORAGE_KEY,
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
      .map((category) => ({
        id: Number(category.id),

        name: String(
          category.name,
        ),

        mangaIds:
          Array.isArray(
            category.mangaIds,
          )
            ? (
                category.mangaIds as unknown[]
              )
                .map((id: unknown) =>
                  Number(id),
                )
                .filter(
                  (id: number) =>
                    Number.isFinite(id),
                )
            : [],
      }))
      .filter(
        (category) =>
          Number.isFinite(
            category.id,
          ) &&
          category.name.trim() !== '',
      )
  } catch (error) {
    console.error(
      'ไม่สามารถโหลด Custom Category ได้',
      error,
    )

    return []
  }
}