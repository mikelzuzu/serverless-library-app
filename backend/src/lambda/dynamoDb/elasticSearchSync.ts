import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'
import { createLogger } from '../../utils/logger'

const esHost = process.env.ES_ENDPOINT
const eIndex = process.env.ELASTICSEARCH_INDEX
const logger = createLogger("syncElasticSearch")

const es = new elasticsearch.Client({
    hosts: [esHost],
    connectionClass: httpAwsEs
})

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
    logger.info('Processing events batch from DynamoDB', { event: JSON.stringify(event) })

    for (const record of event.Records) {

        if (record.eventName !== 'INSERT') {
            continue
        }
        logger.info('Processing record', { item: JSON.stringify(record) })
        const newItem = record.dynamodb.NewImage

        const isbn = newItem.isbn.S

        const body = {
            isbn: newItem.isbn.S,
            categoryId: newItem.categoryId.S,
            author: newItem.author.S,
            title: newItem.title.S,
            publishedDate: newItem.publishedDate.S,
            createdAt: newItem.createdAt.S
        }

        try {
            await es.index({
                index: eIndex,
                type: 'books',
                id: isbn,
                body
            })
        } catch (error) {
            logger.error('Error sending data to elasticsearch.', { errorMessage: error.message })
        }

    }
}