import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateBookDetailsRequest } from '../../requests/UpdateBookDetailsRequest'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { updateBookDetails } from '../../businessLogic/books'
import HttpException from '../../utils/HttpException'

const logger = createLogger('updateBookDetails')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', { event:event })

  const isbn = event.pathParameters.isbn
  const updatedBookDetails: UpdateBookDetailsRequest = JSON.parse(event.body)
  logger.debug(`Updating details for the Book with isbn ${isbn}.`, { UpdatedBookDetailsRequest:updatedBookDetails  })
  try {
    await updateBookDetails(isbn, updatedBookDetails)
    //HTTP 200 or HTTP 204 should imply "resource updated successfully"
    //204 (No Content)
    return {
      statusCode: 204,
      body: ''
    }
  } catch (error) {
    logger.error('Error updating books.', { errorMessage: error.message})
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
