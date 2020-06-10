import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { deleteBook } from '../../businessLogic/books'
import { createLogger } from '../../utils/logger'
import HttpException from '../../utils/HttpException'

const logger = createLogger('deleteBook')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', { event: event })
  
  const isbn = event.pathParameters.isbn

  logger.debug(`Starting deleting Book with isbn: ${isbn}.`)
  try {
    await deleteBook(isbn)
    //HTTP 200 or HTTP 204 should imply "resource deleted successfully"
    //204 (No Content)
    return {
      statusCode: 204,
      body: ''
    }
  } catch (error) {
    logger.error('Error deleting book.', { errorMessage: error.message})
    //TODO: Return specific error if the book is borrowed
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
