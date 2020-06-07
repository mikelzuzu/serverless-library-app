import * as AWS  from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient, Key } from 'aws-sdk/clients/dynamodb'
import { CategoryItem } from '../models/CategoryItem'
import { createLogger } from '../utils/logger';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('CategoryAccess')

export class CategoryAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly categoriesTable = process.env.CATEGORIES_TABLE) {
  }

  async getAllCategories(): Promise<CategoryItem[]> {
    logger.info('Getting all categories')

    const result = await this.docClient.scan({
      TableName: this.categoriesTable
    }).promise()

    const items = result.Items
    return items as CategoryItem[]
  }

  async getAllCategoriesPagination(limit: number, nextKey: Key): Promise<DocumentClient.QueryOutput> {
    logger.info('Getting all categories')

    const result = await this.docClient.query({
      TableName: this.categoriesTable,
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: nextKey
    }).promise()

    const items = result.Items
    logger.info(`List of categories`, { Books:items })
    return result
  }

  async createCategory(category: CategoryItem): Promise<CategoryItem> {
    logger.info('Creating a category')
    await this.docClient.put({
      TableName: this.categoriesTable,
      Item: category
    }).promise()

    return category
  }

  async categoryExists(categoryId: string): Promise<Boolean> {
    const result = await this.docClient.get({
      TableName: this.categoriesTable,
      Key: {
        id: categoryId
      }
    }).promise()

    return !!result.Item
  }

  async getCategory(categoryId: string): Promise<CategoryItem> {
    const result = await this.docClient.get({
      TableName: this.categoriesTable,
      Key: {
        id: categoryId
      }
    }).promise()

    return result.Item as CategoryItem
  }
}

function createDynamoDBClient() {
    logger.debug('Creating a DynamoDB instance')
    if (process.env.IS_OFFLINE) {
      logger.debug('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
    logger.debug('Creating a DynamoDB instance in AWS')
    return new XAWS.DynamoDB.DocumentClient()
  }