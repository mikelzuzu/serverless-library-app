import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getAllCategoriesPagination } from '../../businessLogic/categories'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { parseLimitParameter, parseNextKeyParameter, encodeNextKey } from '../../utils/QueryParameter'
import HttpException from '../../utils/HttpException'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const logger = createLogger('getAllCategories')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event: ', { event: event })

  logger.debug(`Retrieving all Categories.`)
  try {
    // Check if the user is using pagination options. If Limit is not specify, I will default to 5.
    const limit = parseLimitParameter(event) || 5
    const nextKey = parseNextKeyParameter(event)
    const result: DocumentClient.QueryOutput = await getAllCategoriesPagination(limit, nextKey)
    const items = result.Items
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        items,
        // Encode the JSON object so a client can return it in a URL as is
        nextKey: encodeNextKey(result.LastEvaluatedKey)
      })
    }
  } catch(error) {
    logger.error('Error getting Categories.', { errorMessage: error.message })
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
