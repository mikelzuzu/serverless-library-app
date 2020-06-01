import * as AWS  from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
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
    console.log('Getting all groups')

    const result = await this.docClient.scan({
      TableName: this.categoriesTable
    }).promise()

    const items = result.Items
    return items as CategoryItem[]
  }

  async createCategory(category: CategoryItem): Promise<CategoryItem> {
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