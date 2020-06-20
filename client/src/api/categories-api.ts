import { Category } from '../types/Category'
import { apiEndpoint } from '../config'
import { CreateCategoryRequest } from '../types/CreateCategoryRequest'
import Axios from 'axios'

export async function getCategories(idToken: string): Promise<Category[]> {
  console.log('Fetching categories')

  const response = await Axios.get(`${apiEndpoint}/categories?limit=20&nextKey=`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Categories:', response.data)
  return response.data.items
}

export async function createCategory(
  idToken: string,
  newCategory: CreateCategoryRequest
): Promise<Category> {
  const reply = await fetch(`${apiEndpoint}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({
      name: newCategory.name,
      description: newCategory.description
    })
  })
  const result = await reply.json()
  return result.newItem
}
