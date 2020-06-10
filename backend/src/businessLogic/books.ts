import { BookAccess } from '../dataLayer/BooksAccess'
import { BookItem } from '../models/BookItem'
import { CreateBookRequest } from '../requests/CreateBookRequest'
import { UpdateBookRequest } from '../requests/UpdateBookRequest'
import { UpdateBookDetailsRequest } from '../requests/UpdateBookDetailsRequest'
import { DocumentClient, Key } from 'aws-sdk/clients/dynamodb'

const bookAccess = new BookAccess()

export async function getAllBooks(): Promise<BookItem[]> {
  return bookAccess.getAllBooks()
}

export async function getAllBooksPagination(limit: number, nextKey: Key): Promise<DocumentClient.QueryOutput> {
  return bookAccess.getAllBooksPagination(limit, nextKey)
}

export async function getFreeBooks(categoryId: string, limit: number, nextKey: Key): Promise<DocumentClient.QueryOutput> {
  return bookAccess.getFreeBooks(categoryId, limit, nextKey)
}

export async function getBooksFromLender(categoryId: string, lenderId: string, limit: number, nextKey: Key): Promise<DocumentClient.QueryOutput> {
  return bookAccess.getBooksFromLender(categoryId, lenderId, limit, nextKey)
}

export async function getBookFromLender(isbn: string, lenderId: string): Promise<BookItem> {
  return bookAccess.getBookFromLender(isbn, lenderId)
}

export async function getBook(isbn: string): Promise<BookItem> {
  return bookAccess.getBook(isbn)
}

export async function getBooksFromCategory(categoryId: string, limit: number, nextKey: Key): Promise<DocumentClient.QueryOutput> {
  return bookAccess.getBooksFromCategory(categoryId, limit, nextKey)
}

export async function createBook(
  createBookRequest: CreateBookRequest
): Promise<BookItem> {

  return await bookAccess.createBook({
    isbn: createBookRequest.isbn,
    categoryId: createBookRequest.categoryId,
    title: createBookRequest.title,
    author: createBookRequest.author,
    publishedDate: createBookRequest.publishedDate,
    borrowed: false
    //removed borrowedDate and lenderId as still in not borrowed
    //removed attachment as it is not in S3 bucket yet. It is updated once the upload url is retrieved
    //attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
  })
}

export async function updateBook(
  isbn: string,
  updateBookRequest: UpdateBookRequest,
): Promise<void> {

  const book = await bookAccess.getBook(isbn)

  if (updateBookRequest.borrowed && book.borrowed) {
    //We can not borrow a book that is already borrowed
  } else if (!updateBookRequest.borrowed && !book.borrowed) {
    //We cannot return a book that it is not borrowed
  } else {
    return await bookAccess.updateBook({
      isbn: isbn,
      lenderId: updateBookRequest.lenderId,
      categoryId: book.categoryId,
      title: book.title,
      author: book.author,
      publishedDate: book.publishedDate,
      borrowed: updateBookRequest.borrowed,
      borrowedDate: updateBookRequest.borrowedDate
    })
  }
}

export async function updateBookDetails(
  isbn: string,
  updateBookDetailsRequest: UpdateBookDetailsRequest,
): Promise<void> {

  const book = await bookAccess.getBook(isbn)

  return await bookAccess.updateDetails({
    isbn: isbn,
    lenderId: "",
    categoryId: book.categoryId,
    title: updateBookDetailsRequest.title,
    author: updateBookDetailsRequest.author,
    publishedDate: book.publishedDate,
    borrowed: false,
    borrowedDate: ""
  })
}

export async function updateBookToBorrow(
  isbn: string,
  lenderId: string
): Promise<void> {

  const book = await bookAccess.getBook(isbn)

  return await bookAccess.updateBookToBorrow({
    isbn: isbn,
    lenderId: lenderId,
    categoryId: book.categoryId,
    title: book.title,
    author: book.author,
    publishedDate: book.publishedDate,
    borrowed: true,
    borrowedDate: new Date().toISOString()
  })
}

export async function updateBookToReturn(
  isbn: string,
  lenderId: string,
): Promise<void> {

  const book = await bookAccess.getBook(isbn)

  return await bookAccess.updateBookToReturn({
    isbn: isbn,
    lenderId: lenderId,
    categoryId: book.categoryId,
    title: book.title,
    author: book.author,
    publishedDate: book.publishedDate,
    borrowed: false,
    borrowedDate: new Date().toISOString()
  })
}

export async function updateAttachment(
  isbn: string,
  attachmentUrl: string,
): Promise<void> {
  //need to find category of the book
  const book = await bookAccess.getBook(isbn)

  return await bookAccess.updateAttachment(isbn, book.categoryId, book.publishedDate, attachmentUrl)
}

export async function deleteBook(
  isbn: string
): Promise<void> {
  const book = await bookAccess.getBook(isbn)
  if (book.borrowed) {
    //we cannot delete a book that is borrowed
  } else {
    return await bookAccess.deleteBook(isbn, book.categoryId, book.publishedDate)
  }

}