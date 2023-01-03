import 'source-map-support/register'

import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getBooksForUser as getBooksForUser } from '../../businessLogic/books'
import { getUserId } from '../utils';



export const getBooks: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event)

  const result = await getBooksForUser(userId);
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


export const handler = middy(getBooks)
handler
  .use(
    cors({
      credentials: true
    })
  )
