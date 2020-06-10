import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { S3 } from 'aws-sdk';
import { createLogger } from '../utils/logger';

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('AttachmentsAccess')

/**
 * Class representing data layer where images are stored (S3)
 */
export class AttachmentAccess {

  constructor(
    private readonly s3: S3 = createS3Client(),
    private readonly bucketName = process.env.BOOKS_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
  }

  getAttachmentUploadUrl(isbn: string) {
    logger.info(`Creating a presigned url in S3 for book isbn ${isbn}`)

    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: isbn,
      Expires: isNaN(this.urlExpiration as any) ? 100 : +this.urlExpiration
    })
  }
}

function createS3Client() {
  if (process.env.IS_OFFLINE) {
    logger.debug('Creating a local S3 instance')
    return new XAWS.S3({
      s3ForcePathStyle: true,
      accessKeyId: 'S3RVER', // This specific key is required when working offline
      secretAccessKey: 'S3RVER',
      endpoint: 'http://localhost:8001',
    })
  }

  logger.debug('Creating an S3 instance')
  return new XAWS.S3({
    signatureVersion: 'v4'
  })
}