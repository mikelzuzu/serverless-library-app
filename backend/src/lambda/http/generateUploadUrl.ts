import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getAttachmentUploadUrl } from '../../businessLogic/attachments'
import { updateAttachment } from '../../businessLogic/books'
import HttpException from '../../utils/HttpException'

const logger = createLogger('generateUploadUrl')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', { event: event })

  const isbn = event.pathParameters.isbn

  //update book
  const attachmentUrl = `https://${process.env.BOOKS_S3_BUCKET}.s3.amazonaws.com/${isbn}`
  try {
    logger.debug(`Adding attachmentUrl for book with isbn ${isbn}.`)
    await updateAttachment(isbn, attachmentUrl)
  } catch (error) {
    logger.error('Error updating attachment for book.', { errorMessage: error.message })
    if (error instanceof HttpException) {
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

  try {
    const uploadURL = await getAttachmentUploadUrl(isbn)
    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: uploadURL
      })
    }
  } catch (error) {
    logger.error('Error getting upload url from S3.', { errorMessage: error.message })
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error"
      })
    }
  }
})

handler.use(
  cors({
    credentials: true
  })
)
