export interface BookItem {
    isbn: string
    lenderId: string
    title: string
    author: string
    publishDate: string
    borrowed: boolean
    borrowedDate:string
    attachmentUrl?: string
  }
  