export class User {
  id: number
  username: string
  email: string
  role: string

  constructor(
    id: number,
    username: string,
    email: string,
    role: string = 'user'
  ) {
    this.id = id
    this.username = username
    this.email = email
    this.role = role
  }
}