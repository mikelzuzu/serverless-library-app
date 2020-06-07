/**
 * Fields in a request to update a single Book item.
 */
export interface UpdateBookDetailsRequest {
  categoryId: string
  title: string
  author:string
  publishDate: string
  }