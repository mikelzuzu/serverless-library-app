import * as AWS  from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient, Key } from 'aws-sdk/clients/dynamodb'
import { BookItem } from '../models/BookItem';
import { createLogger } from '../utils/logger';
import BookNotFoundException from '../utils/BookNotFoundException';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('BooksAccess')

/**
 * Class representing data layer where data about books is stored (DynamoDB)
 */
export class BookAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly booksTable = process.env.BOOKS_TABLE,
    private readonly booksIndex = process.env.BOOKS_ISBN_INDEX) {
  }

  async getAllBooks(): Promise<BookItem[]> {
    logger.info("Getting all books")

    const result = await this.docClient.scan({
      TableName: this.booksTable
    }).promise()

    const items = result.Items
    logger.info("List of Books", { Books:items })
    return items as BookItem[]
  }

  async getBook(isbn: string): Promise<BookItem> {
    logger.info("Get the book")

    const result = await this.docClient.query({
        TableName : this.booksTable,
        IndexName : this.booksIndex,
        KeyConditionExpression: 'isbn = :isbn',
        ExpressionAttributeValues: {
            ':isbn': isbn
        }
    }).promise()

    if (result.Count !== 0) {
        const item =result.Items[0]
        logger.info("List of Books", { Book:item })
        return item as BookItem
    } else {
        logger.error(`Book not found with id ${isbn}`)
        throw new BookNotFoundException(isbn)
    }
  }


  async getBooksFromCategory(categoryId: string, limit: number, nextKey: Key): Promise<DocumentClient.QueryOutput> {
    logger.info(`Getting all books from category: ${categoryId}`)

    const result = await this.docClient.query({
      TableName: this.booksTable,
      IndexName: this.booksIndex,
      KeyConditionExpression: "#categoryId = :categoryId_val",
      ExpressionAttributeNames: {
          "#categoryId": "categoryId"
      },
      ExpressionAttributeValues: { 
        ":categoryId_val": categoryId
      },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: nextKey
    }).promise()

    const items = result.Items
    logger.info(`List of Books from the category ${categoryId}`, { Books:items })
    return result
  }

  async getBooksFromLender(lenderId: string, limit: number, nextKey: Key): Promise<DocumentClient.QueryOutput> {
    logger.info(`Getting all books from lender: ${lenderId}`)

    const result = await this.docClient.query({
      TableName: this.booksTable,
      IndexName: this.booksIndex,
      KeyConditionExpression: "#lenderId = :lenderId_val and #borrowed = true",
      ExpressionAttributeNames: {
          "#lenderId": "lenderId",
          "#borrowed": "borrowed"
      },
      ExpressionAttributeValues: { 
        ":lenderId_val": lenderId
      },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: nextKey
    }).promise()

    const items = result.Items
    logger.info(`List of Books for the lender ${lenderId}`, { Books:items })
    return result
  }

  async getBookFromLender(isbn: string, lenderId: string): Promise<BookItem> {
    logger.info(`Getting the book ${isbn} from user: ${lenderId}`)

    const result = await this.docClient.query({
      TableName: this.booksTable,
      IndexName: this.booksIndex,
      KeyConditionExpression: "#isbn = :isbn_val and #lenderId = :lenderId_val and #borrowed = true",
      ExpressionAttributeNames: {
          "#lenderId": "lenderId",
          "#isbn": "isbn",
          "#borrowed": "borrowed"
      },
      ExpressionAttributeValues: { 
        ":isbn_val": isbn,
        ":lenderId_val": lenderId
      },
      ScanIndexForward: false,
      Limit: 1
    }).promise()

    const item = result.Items[0]
    if (item === undefined) {
      logger.error(`Book not found with id ${isbn}`)
      throw new BookNotFoundException(isbn)
    }
    logger.info(`Book for the lender ${lenderId}`, { Book:item })
    return item as BookItem
  }

  async createBook(book: BookItem): Promise<BookItem> {
    logger.info(`Creating book`)
    await this.docClient.put({
      TableName: this.booksTable,
      Item: book
    }).promise()
    logger.info(`Book created`, { Book:book})
    return book    
  }

  async updateBook(book: BookItem): Promise<void> {
    logger.info('Book for updating', { BookItem:book })
    try {
        await this.docClient.update({
        TableName: this.booksTable,
        Key: {
            categoryId: book.categoryId,
            publishedDate: book.publishDate
        },
        ConditionExpression: "#isbn = :isbn_val",
        UpdateExpression: 'SET #lenderId = :lenderId_val, #borrowed = :borrowed_val, #borrowedDate = :borrowedDate_val',
        ExpressionAttributeValues:{
            ":isbn_val": book.isbn,
            ":lenderId_val": book.lenderId,
            ":borrowed_val": book.borrowed,
            ":borrowedDate_val": book.borrowedDate
        },
        ExpressionAttributeNames: {
          "#isbn": "isbn",
          "#lenderId": "lenderId",
          "#borrowed": "borrowed",
          "#borrowedDate": "borrowedDate"
        },
        ReturnValues: "UPDATED_NEW"
        }).promise()
          
    } catch(error) {
        logger.error('Book not updated', { error:error.message} );
        throw error
    }
    logger.info('Book updated!')
  }

  async updateBookToBorrow(book: BookItem): Promise<void> {
    logger.info('Book to being borrowed', { BookItem:book })
    try {
        await this.docClient.update({
        TableName: this.booksTable,
        Key: {
            categoryId: book.categoryId,
            publishedDate: book.publishDate
        },
        ConditionExpression: "#isbn = :isbn_val and #borrowed = false",
        UpdateExpression: 'SET #lenderId = :lenderId_val, #borrowed = true, #borrowedDate = :borrowedDate_val',
        ExpressionAttributeValues:{
            ":isbn_val": book.isbn,
            ":lenderId_val": book.lenderId,
            ":borrowedDate_val": book.borrowedDate
        },
        ExpressionAttributeNames: {
          "#isbn": "isbn",
          "#lenderId": "lenderId",
          "#borrowed": "borrowed",
          "#borrowedDate": "borrowedDate"
        },
        ReturnValues: "UPDATED_NEW"
        }).promise()
          
    } catch(error) {
        logger.error('Book not updated', { error:error.message} );
        throw error
    }
    logger.info('Book updated!')
  }

  async updateBookToReturn(book: BookItem): Promise<void> {
    logger.info('Book to being return', { BookItem:book })
    try {
        await this.docClient.update({
        TableName: this.booksTable,
        Key: {
            categoryId: book.categoryId,
            publishedDate: book.publishDate
        },
        ConditionExpression: "#isbn = :isbn_val and #borrowed = true and #lenderId = :lenderId_val",
        UpdateExpression: 'SET #borrowed = false REMOVE #borrowedDate',
        ExpressionAttributeValues:{
            ":isbn_val": book.isbn,
            ":lenderId_val": book.lenderId,
        },
        ExpressionAttributeNames: {
          "#isbn": "isbn",
          "#lenderId": "lenderId",
          "#borrowed": "borrowed",
          "#borrowedDate": "borrowedDate"
        },
        ReturnValues: "UPDATED_NEW"
        }).promise()
          
    } catch(error) {
        logger.error('Book not updated', { error:error.message} );
        throw error
    }
    logger.info('Book updated!')
  }

  async updateAttachment(isbn: string, title: string, publishedDate: string, attachmentUrl: string): Promise<void> {
    logger.info(`Updating attachment for Book with isbn ${isbn}`)
    try {
        await this.docClient.update({
        TableName: this.booksTable,
        Key: {
            isbn,
            publishedDate
        },
        ConditionExpression: "#title = :title_val",
        UpdateExpression: 'SET #attachmentUrl = :attachmentUrl_val',
        ExpressionAttributeValues:{
            ":title_val": title,
            ":attachmentUrl_val": attachmentUrl,

        },
        ExpressionAttributeNames: {
          "#title": "title",
          "#attachmentUrl": "attachmentUrl"
        },
        ReturnValues: "UPDATED_NEW"
        }).promise()
          
    } catch(error) {
        logger.error('Attachment not updated', { error:error.message});
        throw error
    }
    logger.info('Attachment updated!')
  }

  async deleteBook(isbn: string, publishedDate: string): Promise<void> {
    logger.info(`Deleting Book with isbn ${isbn}`)
    try {
        await this.docClient.delete({
        TableName: this.booksTable,
        Key: {
            isbn,
            publishedDate
        },
        ConditionExpression:"borrowed = false"
        }).promise()
    } catch(error) {
        logger.error('Book not deleted', { error:error.message});
        throw error
    }
    logger.info('Book deleted!')
    
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