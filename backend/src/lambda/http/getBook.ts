import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getBook } from '../../businessLogic/books'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import HttpException from '../../utils/HttpException'
import { BookItem } from '../../models/BookItem'

const logger = createLogger('getBooksFromCategory')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event: ', { event: event })

  const isbn = event.pathParameters.isbn
  logger.info(`Retrieving Book with ISBN: ${isbn}.`)

  try {
    const book: BookItem = await getBook(isbn)
  
    return {
      statusCode: 200,
      body: JSON.stringify({
        items:book
      })
    }
  } catch(error) {
    logger.error('Error getting Books.', { errorMessage: error.message })
    if (error instanceof HttpException){
      // send back http 404 not found error
      const exception: HttpException = error
      return {
        statusCode: exception.status,
        body: JSON.stringify({
          error: exception.message
        })
      }
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Internal server error"
        })
      }
    }
  }
})

handler.use(
  cors({
    credentials: true
  })
)
