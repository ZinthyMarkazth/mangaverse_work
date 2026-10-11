export class CustomCategory {
  id: number
  userId: number
  name: string
  createdAt: Date

  constructor(
    id: number,
    userId: number,
    name: string,
    createdAt: Date = new Date()
  ) {
    this.id = id
    this.userId = userId
    this.name = name
    this.createdAt = createdAt
  }
}