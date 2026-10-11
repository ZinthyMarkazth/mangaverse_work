import { Content } from './Content'

export class Manga extends Content {
  private _id: number
  private _title: string
  private _author: string
  private _description: string
  private _category: string
  private _latestChapter: number
  private _status: string
  private _cover: string

  constructor(
    id: number,
    title: string,
    author: string,
    description: string,
    category: string,
    latestChapter: number,
    status: string,
    cover: string
  ) {
    super()

    this._id = id
    this._title = title
    this._author = author
    this._description = description
    this._category = category
    this._latestChapter = latestChapter
    this._status = status
    this._cover = cover
  }

  get id(): number {
    return this._id
  }

  get title(): string {
    return this._title
  }

  set title(value: string) {
    this._title = value
  }

  get author(): string {
    return this._author
  }

  set author(value: string) {
    this._author = value
  }

  get description(): string {
    return this._description
  }

  set description(value: string) {
    this._description = value
  }

  get category(): string {
    return this._category
  }

  set category(value: string) {
    this._category = value
  }

  get latestChapter(): number {
    return this._latestChapter
  }

  set latestChapter(value: number) {
    if (value >= 0) {
      this._latestChapter = value
    }
  }

  get status(): string {
    return this._status
  }

  set status(value: string) {
    this._status = value
  }

  get cover(): string {
    return this._cover
  }

  set cover(value: string) {
    this._cover = value
  }

  getInfo(): string {
    return `${this._title} - ${this._author}`
  }
}