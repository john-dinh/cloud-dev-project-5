import 'source-map-support/register'

import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getBooksForPublish } from '../../businessLogic/books'


// export const getBooks: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
export const getBooks: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const publish = event.pathParameters.publish
  const createdAt = event.pathParameters.createdAt
  const result = await getBooksForPublish(publish, createdAt);
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


export const handler = middy(getBooks)
handler
  .use(
    cors({
      credentials: false
    })
  )
