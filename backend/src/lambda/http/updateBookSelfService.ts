import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { updateBookToBorrow, updateBookToReturn } from '../../businessLogic/books'
import HttpException from '../../utils/HttpException'
import { UpdateBookSelfServiceRequest } from '../../requests/UpdateBookSelfServiceRequest'

const logger = createLogger('updateBookToBorrow')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event: ', { event: event })

    const isbn = event.pathParameters.isbn
    const lenderId = getUserId(event)
    const updatedBookSelfService: UpdateBookSelfServiceRequest = JSON.parse(event.body)

    logger.debug(`Updating the status of the Book with isbn ${isbn} for lender ${lenderId} to borrowed: ${updatedBookSelfService.borrowed}.`)
    try {
        if (updatedBookSelfService.borrowed) {
            //Borrow the book for this lender
            await updateBookToBorrow(isbn, lenderId)
        } else {
            await updateBookToReturn(isbn, lenderId)
        }

        //HTTP 200 or HTTP 204 should imply "resource updated successfully"
        //204 (No Content)
        return {
            statusCode: 204,
            body: ''
        }
    } catch (error) {
        logger.error('Error updating book.', { errorMessage: error.message })
        if (error instanceof HttpException) {
            // send back http error from our exception class
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