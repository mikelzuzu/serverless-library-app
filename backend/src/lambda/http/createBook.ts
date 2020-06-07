import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateBookRequest } from '../../requests/CreateBookRequest'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { createBook } from '../../businessLogic/books'

const logger = createLogger('createBook')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', { event: event })

  const newBook: CreateBookRequest = JSON.parse(event.body)

  logger.debug(`Starting creating Bookk.`, { CreateBookRequest:newBook })
  const newItem = await createBook(newBook)
  //delete userId in the return for security
  delete newItem.lenderId

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