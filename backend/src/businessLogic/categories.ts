import * as uuid from 'uuid'

import { CategoryItem } from '../models/CategoryItem'
import { CategoryAccess } from '../dataLayer/CategoryAccess'
import { CreateCategoryRequest } from '../requests/CreateCategoryRequest'

const categoryAccess = new CategoryAccess()

export async function getAllCategories(): Promise<CategoryItem[]> {
  return categoryAccess.getAllCategories()
}

export async function createGroup(
  createCategoryRequest: CreateCategoryRequest,
): Promise<CategoryItem> {

  const itemId = uuid.v4()

  return await categoryAccess.createCategory({
    id: itemId,
    name: createCategoryRequest.name,
    description: createCategoryRequest.description,
    timestamp: new Date().toISOString()
  })
}

export async function getCategory(categoryId: string): Promise<CategoryItem> {
    return categoryAccess.getCategory(categoryId)
}

export async function categoryExists(categoryId: string): Promise<Boolean> {
    return categoryAccess.categoryExists(categoryId)
}
