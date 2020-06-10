/**
 * Fields in a request to create a single Book item.
 */
export interface CreateBookRequest {
    isbn: string
    title: string
    author: string
    publishedDate: string
    categoryId: string
  }