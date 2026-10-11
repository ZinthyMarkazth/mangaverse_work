export class ReadingHistory {
  id: number
  userId: number
  mangaId: number
  chapterId: number
  readAt: Date

  constructor(
    id: number,
    userId: number,
    mangaId: number,
    chapterId: number,
    readAt: Date = new Date(),
  ) {
    this.id = id
    this.userId = userId
    this.mangaId = mangaId
    this.chapterId = chapterId
    this.readAt = readAt
  }
}