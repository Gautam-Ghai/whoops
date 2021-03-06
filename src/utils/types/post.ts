import { User } from "./user";
import { Game } from "./game"
export interface Post {
  id?: number
  createdAt?: string
  updatedAt?: string
  title?: string
  description?: string
  url?: string
  publicId?: string
  gameId?: number
  game?: Game,
  views?: number,
  _count?: {
    likedBy?: number,
    comments?: number,
    savedBy?: number
  }
  authorId?: number,
  author?: User
  likedBy?: User[]
  savedBy?: User[]
  comments?: any[]
  comment?: {
    content?: string
    authorId?: number
    postId?: number
    createdAt?: string
    author?: User
  }
}