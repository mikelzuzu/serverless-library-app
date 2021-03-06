import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getFreeBooks } from '../../businessLogic/books'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { parseLimitParameter, parseNextKeyParameter, encodeNextKey } from '../../utils/QueryParameter'
import HttpException from '../../utils/HttpException'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { categoryExists } from '../../businessLogic/categories'

const logger = createLogger('getAvailableBooks')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event: ', { event: event })

  logger.debug(`Retrieving all Books.`)
  try {
    // Check if the user is using pagination options. If Limit is not specify, I will default to 5.
    const limit = parseLimitParameter(event) || 5
    const nextKey = parseNextKeyParameter(event)

    const categoryId = event.pathParameters.categoryId
    logger.info(`Retrieving all available Books from category: ${categoryId}.`)

    const validCategoryId = await categoryExists(categoryId)

    if (!validCategoryId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Category does not exist'
        })
      }
    }
    
    const result: DocumentClient.QueryOutput = await getFreeBooks(categoryId, limit, nextKey)
    const items = result.Items
    //delete lenderId in the books list (it should not be there already)
    items.forEach(book => delete book.lenderId)
  
    return {
      statusCode: 200,
      body: JSON.stringify({
        items,
        // Encode the JSON object so a client can return it in a URL as is
        nextKey: encodeNextKey(result.LastEvaluatedKey)
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
