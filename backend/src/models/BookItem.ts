export interface BookItem {
    isbn: string
    categoryId: string
    lenderId?: string
    title: string
    author: string
    publishedDate: string
    borrowed: boolean
    borrowedDate?:string
    attachmentUrl?: string
  }
  