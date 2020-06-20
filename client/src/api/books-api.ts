import { apiEndpoint } from '../config'
import { Book } from '../types/Book';
import { CreateBookRequest } from '../types/CreateBookRequest';
import Axios from 'axios'
import { UpdateBookSelfServiceRequest } from '../types/UpdateBookSelfServiceRequest';

export async function getBooks(idToken: string): Promise<Book[]> {
  console.log('Fetching books')

  const response = await Axios.get(`${apiEndpoint}/admin/books?limit=20&nextKey=`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Books:', response.data)
  return response.data.items
}

export async function getCategoriesBooks(idToken: string, categoryId: string): Promise<Book[]> {
  console.log('Fetching books')

  const response = await Axios.get(`${apiEndpoint}/categories/${categoryId}/booksFree?limit=20&nextKey=`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Books:', response.data)
  return response.data.items
}

export async function createBook(
  idToken: string,
  newBook: CreateBookRequest
): Promise<Book> {
  const response = await Axios.post(`${apiEndpoint}/books`,  JSON.stringify(newBook), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchBook(
  idToken: string,
  isbn: string,
  updatedBook: UpdateBookSelfServiceRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/books/${isbn}`, JSON.stringify(updatedBook), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteBook(
  idToken: string,
  isbn: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/books/${isbn}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  isbn: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/books/${isbn}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
