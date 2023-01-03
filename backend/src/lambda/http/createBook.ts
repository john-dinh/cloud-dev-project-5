import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import * as uuid from 'uuid'
import { cors } from 'middy/middlewares'
import { CreateBookRequest } from '../../requests/CreateBookRequest'
import { getUserId } from '../utils';
import { createBook } from '../../businessLogic/books'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newBook: CreateBookRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const bookId = uuid.v4()
    const bookItem = { ...newBook, userId, bookId, publish: "n", createdAt: new Date().toISOString() }

    await createBook(bookItem)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ item: bookItem })
  }
}

)

handler.use(
  cors({
    credentials: true
  })
)
