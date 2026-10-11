export class ChapterImage {
  id: number
  chapterId: number
  imageUrl: string
  imageOrder: number

  constructor(
    id: number,
    chapterId: number,
    imageUrl: string,
    imageOrder: number
  ) {
    this.id = id
    this.chapterId = chapterId
    this.imageUrl = imageUrl
    this.imageOrder = imageOrder
  }
}