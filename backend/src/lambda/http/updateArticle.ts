import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateArticle } from '../../businessLogic/articles'
import { UpdateArticleRequest } from '../../requests/UpdateArticleRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const articleId = event.pathParameters.articleId
    const updatedArticle: UpdateArticleRequest = JSON.parse(event.body)
    const userId: string = getUserId(event)
    const payload = {...updatedArticle, articleId, userId }

    return await updateArticle(payload)
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
