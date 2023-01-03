import 'source-map-support/register'

import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getArticlesForUser as getArticlesForUser } from '../../businessLogic/articles'
import { getUserId } from '../utils';



export const getArticles: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event)

  const result = await getArticlesForUser(userId);
  const items = result.Items

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


export const handler = middy(getArticles)
handler
  .use(
    cors({
      credentials: true
    })
  )
