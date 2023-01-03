import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as moment from 'moment';
import * as AWS from 'aws-sdk';
const AWSXRay = require('aws-xray-sdk');

export class BookAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly booksTable = process.env.BOOKS_TABLE
    ) { }
    async getBooks(userId: string) {
        const queryParams = {
            TableName: this.booksTable,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId,
            },
            ScanIndexForward: false
        };
        return await this.docClient.query(queryParams).promise();
    }

    async getBooksForPublish(publish, createdAt) {
        console.log('createdAt', createdAt)
        let KeyConditionExpression = ""
        let ExpressionAttributeValues:{} =  {}
        
        if(createdAt && moment(createdAt, "YYYY-MM-DD").isValid()) {
            const fromDate = moment(createdAt, "YYYY-MM-DD").format("YYYY-MM-DD")
            const toDate = moment(createdAt, "YYYY-MM-DD").add(1, 'day').format("YYYY-MM-DD")
            KeyConditionExpression="publish = :publish and createdAt BETWEEN :fromDate AND :toDate"
            ExpressionAttributeValues={":publish": publish, ":fromDate": fromDate, ":toDate": toDate}
        } else {
            KeyConditionExpression="publish = :publish"
            ExpressionAttributeValues={":publish": publish}
        }
        console.log('KeyConditionExpression=', KeyConditionExpression, ExpressionAttributeValues)
        const queryParams = {
            TableName: this.booksTable,
            IndexName: process.env.BOOKS_PUBLISH_INDEX,
            KeyConditionExpression,
            ExpressionAttributeValues,
        };
        return await this.docClient.query(queryParams).promise();
    }

    async createBook(bookItem) {
        return await this.docClient.put({
            TableName: this.booksTable,
            Item: bookItem
        }).promise()
    }

    async deleteBook(userId: string, bookId: string) {

        const params = {
            TableName: this.booksTable,
            Key: {
                userId,
                bookId
            },
        };

        await this.docClient.delete(params).promise()
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({ status: 'deleted' })
        }
    }

    async updateBook(payload: any) {
        const { userId, bookId, name, description} = payload
        const params = {
            TableName: this.booksTable,
            Key: {
                userId,
                bookId
            },
            UpdateExpression: "set description =:description, publish=:publish, #name=:name, createdAt=:createdAt",
            ExpressionAttributeValues: {
                ":name": name,
                ":description": description,
                ":createdAt": new Date().toISOString()
            },
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ReturnValues: "ALL_NEW"
        };

        const res = await this.docClient.update(params)
            .promise()
            .then(result => {
                return result.Attributes;
            })
            .catch(updateError => {
                console.log(`Oops, order is not updated :(`, updateError);
                throw updateError;
            });
        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(res)
        }
    }

    async updateAttachmentBook(payload: any) {
        const { userId, bookId, attachmentUrl } = payload
        const params = {
            TableName: this.booksTable,
            Key: {
                userId,
                bookId
            },
            UpdateExpression: "set attachmentUrl =:attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": attachmentUrl,
            },
            ReturnValues: "ALL_NEW"
        };


        const res = await this.docClient.update(params)
            .promise()
            .then(result => {
                return result.Attributes;
            })
            .catch(updateError => {
                console.log(`Oops, order is not updated :(`, updateError);
                throw updateError;
            });
        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(res)
        }
    }

}

function createDynamoDBClient() {
    AWS.config.update({region: 'us-east-1'});
    const XAWS = AWSXRay.captureAWS(AWS);
    return new XAWS.DynamoDB.DocumentClient()
}

export const createS3Client = () => {
    const XAWS = AWSXRay.captureAWS(AWS);
    return new XAWS.S3();
}


