import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateCategoryRequest } from '../../requests/CreateCategoryRequest'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { createCategory } from '../../businessLogic/categories'

const logger = createLogger('createTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', { event: event })

  const newCategory: CreateCategoryRequest = JSON.parse(event.body)

  logger.debug(`Starting creating Category`, { CreateCategoryRequest: newCategory })
  const newItem = await createCategory(newCategory)
  
  logger.debug('New item was created', { item: newItem })

  return {
    statusCode: 201,
    body: JSON.stringify({
      item: newItem
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)