/**
 * Fields in a request to update a single Book item.
 */
export interface UpdateBookRequest {
    lenderId: string
    borrowed: boolean
    borrowedDate:string
  }