import { apiEndpoint } from '../config'
import { Article } from '../types/Article';
import { CreateArticleRequest } from '../types/CreateArticleRequest';
import Axios from 'axios'
import { UpdateArticleRequest } from '../types/UpdateArticleRequest';

export async function getArticlesForPublish(createdAt: string): Promise<Article[]> {
  console.log('Fetching articles')

  const response = await Axios.get(`${apiEndpoint}/articles-publish/y/${createdAt}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.data.items
}

export async function getArticles(idToken: string): Promise<Article[]> {
  console.log('Fetching articles')

  const response = await Axios.get(`${apiEndpoint}/articles`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  return response.data.items
}

export async function createArticle(
  idToken: string,
  newArticle: CreateArticleRequest
): Promise<Article> {
  const response = await Axios.post(`${apiEndpoint}/articles`,  JSON.stringify(newArticle), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchArticle(
  idToken: string,
  articleId: string,
  updatedArticle: UpdateArticleRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/articles/${articleId}`, JSON.stringify(updatedArticle), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteArticle(
  idToken: string,
  articleId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/articles/${articleId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getArticle(
  idToken: string,
  articleId: string
): Promise<void> {
  await Axios.get(`${apiEndpoint}/articles/${articleId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  articleId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/articles/${articleId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file, {
    headers: {
      //'Content-Type': 'binary/octet-stream'
      'Content-Type': 'image/jpeg'
    }
  })
}
