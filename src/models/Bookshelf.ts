export class Bookshelf {
  id: number
  userId: number
  mangaId: number

  constructor(
    id: number,
    userId: number,
    mangaId: number
  ) {
    this.id = id
    this.userId = userId
    this.mangaId = mangaId
  }
}