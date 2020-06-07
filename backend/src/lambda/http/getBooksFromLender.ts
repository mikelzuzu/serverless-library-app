import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getBooksFromLender } from '../../businessLogic/books'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { parseLimitParameter, parseNextKeyParameter, encodeNextKey } from '../../utils/QueryParameter'
import HttpException from '../../utils/HttpException'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const logger = createLogger('getBooks')

//This handler is for the case when the lender is logged in a website where he/she can check which books are borrowed by themselves
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event: ', { event: event })

  const lenderId = getUserId(event)
  logger.debug(`Retrieving all Books for the lender ${lenderId}.`)
  try {
    // Check if the user is using pagination options. If Limit is not specify, I will default to 5.
    const limit = parseLimitParameter(event) || 5
    const nextKey = parseNextKeyParameter(event)
    const result: DocumentClient.QueryOutput = await getBooksFromLender(lenderId, limit, nextKey)
    const items = result.Items
    //delete lenderId in the book list
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
