import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import HttpException from '../../utils/HttpException'
import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'
import { parseQueryParameter } from '../../utils/QueryParameter'
import { BookItem } from '../../models/BookItem'
//import { SearchBookRequest } from '../../requests/SearchBookRequest'

const logger = createLogger('searchBooks')

const esHost = process.env.ES_ENDPOINT
const eIndex = process.env.ELASTICSEARCH_INDEX

const es = new elasticsearch.Client({
    hosts: [esHost],
    connectionClass: httpAwsEs
})

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event: ', { event: event })

  //const searchBook: SearchBookRequest = JSON.parse(event.body)
  const query = parseQueryParameter(event)
  logger.debug(`Searching Books with including text: ${query}.`)

  try {

    const result = await es.search({
      index: eIndex,
      body: {
        query: {
          multi_match: { 
            query: query,
            fields: ['title', 'author'] 
          }
          //match: { title: query }
        }
      }
    })
    const items = result.hits.hits
    logger.info(`Books found with the text ${query}`, { Books:items })
    logger.info(`Total Books found: ${result.hits.total}`)
    //delete userId in the todos list for security
    items.forEach(book => delete book.fields)

    let books: BookItem[] = []
    items.forEach(element => {
      let item = element._source as BookItem
      let book: BookItem = {
        isbn: item.isbn,
        categoryId: item.categoryId,
        title: item.title,
        author: item.author,
        publishedDate: item.publishedDate,
        borrowed: item.borrowed,
        createdAt: item.createdAt
      }
      books.push(book)
    });
  
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: books
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
