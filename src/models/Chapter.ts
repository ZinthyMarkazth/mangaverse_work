import { Content } from './Content'

export class Chapter extends Content {
  id: number
  mangaId: number
  chapterNumber: number
  title: string

  constructor(
    id: number,
    mangaId: number,
    chapterNumber: number,
    title: string
  ) {
    super()

    this.id = id
    this.mangaId = mangaId
    this.chapterNumber = chapterNumber
    this.title = title
  }

  getInfo(): string {
    return `Chapter ${this.chapterNumber}: ${this.title}`
  }
}