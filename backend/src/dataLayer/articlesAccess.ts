import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as moment from 'moment';
import * as AWS from 'aws-sdk';
const AWSXRay = require('aws-xray-sdk');

export class ArticleAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly articlesTable = process.env.ARTICLES_TABLE
    ) { }
    async getArticles(userId: string) {
        const queryParams = {
            TableName: this.articlesTable,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId,
            },
            ScanIndexForward: false
        };
        return await this.docClient.query(queryParams).promise();
    }

    async getArticlesForPublish(publish, createdAt) {
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
            TableName: this.articlesTable,
            IndexName: process.env.ARTICLES_PUBLISH_INDEX,
            KeyConditionExpression,
            ExpressionAttributeValues,
        };
        return await this.docClient.query(queryParams).promise();
    }

    async createArticle(articleItem) {
        return await this.docClient.put({
            TableName: this.articlesTable,
            Item: articleItem
        }).promise()
    }

    async deleteArticle(userId: string, articleId: string) {

        const params = {
            TableName: this.articlesTable,
            Key: {
                userId,
                articleId
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

    async updateArticle(payload: any) {
        const { userId, articleId, name, description, publish } = payload
        const params = {
            TableName: this.articlesTable,
            Key: {
                userId,
                articleId
            },
            UpdateExpression: "set description =:description, publish=:publish, #name=:name, createdAt=:createdAt",
            ExpressionAttributeValues: {
                ":name": name,
                ":description": description,
                ":publish": publish,
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

    async updateAttachmentArticle(payload: any) {
        const { userId, articleId, attachmentUrl } = payload
        const params = {
            TableName: this.articlesTable,
            Key: {
                userId,
                articleId
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


