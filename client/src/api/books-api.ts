import { apiEndpoint } from '../config'
import { Book } from '../types/Book'
import Axios from 'axios'

import { CreateBookRequest } from '../types/CreateBookRequest'
import { UpdateBookRequest } from '../types/UpdateBookRequest'

export async function getBooksForPublish(createdAt: string): Promise<Book[]> {
  console.log('Getting books')
  const response = await Axios.get(`${apiEndpoint}/books-publish/y/${createdAt}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.data.items
}

export async function getBooks(idToken: string): Promise<Book[]> {
  console.log('Getting books')
  const response = await Axios.get(`${apiEndpoint}/books`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  return response.data.items
}

export async function createBook(
  idToken: string,
  newBook: CreateBookRequest
): Promise<Book> {
  const response = await Axios.post(`${apiEndpoint}/books`,  JSON.stringify(newBook), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchBook(
  idToken: string,
  bookId: string,
  updatedBook: UpdateBookRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/books/${bookId}`, JSON.stringify(updatedBook), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteBook(
  idToken: string,
  bookId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/books/${bookId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getBook(
  idToken: string,
  bookId: string
): Promise<void> {
  await Axios.get(`${apiEndpoint}/books/${bookId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  bookId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/books/${bookId}/attachment`, '', {
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
