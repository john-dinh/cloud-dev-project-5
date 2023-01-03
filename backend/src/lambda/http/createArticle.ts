import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import * as uuid from 'uuid'
import { cors } from 'middy/middlewares'
import { CreateArticleRequest } from '../../requests/CreateArticleRequest'
import { getUserId } from '../utils';
import { createArticle } from '../../businessLogic/articles'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newArticle: CreateArticleRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const articleId = uuid.v4()
    const articleItem = { ...newArticle, userId, articleId, publish: "n", createdAt: new Date().toISOString() }

    await createArticle(articleItem)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ item: articleItem })
  }
}

)

handler.use(
  cors({
    credentials: true
  })
)
