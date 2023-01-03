import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateBook } from '../../businessLogic/books'
import { UpdateBookRequest } from '../../requests/UpdateBookRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bookId = event.pathParameters.bookId
    const updatedBook: UpdateBookRequest = JSON.parse(event.body)
    const userId: string = getUserId(event)
    const payload = {...updatedBook, bookId, userId }

    return await updateBook(payload)
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
