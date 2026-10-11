export class CustomCategoryManga {
  customCategoryId: number
  mangaId: number

  constructor(
    customCategoryId: number,
    mangaId: number
  ) {
    this.customCategoryId = customCategoryId
    this.mangaId = mangaId
  }
}