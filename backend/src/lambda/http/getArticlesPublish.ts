import 'source-map-support/register'

import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getArticlesForPublish } from '../../businessLogic/articles'


// export const getArticles: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
export const getArticlesPublish: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const publish = event.pathParameters.publish
  const createdAt = event.pathParameters.createdAt
  const result = await getArticlesForPublish(publish, createdAt);
  const items = result.Items
  console.log('items:', items)

  const res = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
  return res
}


export const handler = middy(getArticlesPublish)
handler
  .use(
    cors({
      credentials: false
    })
  )
