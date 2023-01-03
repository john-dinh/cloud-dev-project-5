import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'

const logger = createLogger('Todos business logic')

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const todoAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();
export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  return todoAccess.getAllTodos(userId);
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
  const itemId = uuid.v4()
  logger.info('Created TODO Id', itemId)
  return await todoAccess.createTodo({
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString(),
    done: false
  })
}

export async function updateTodo(todoId: string, userId: string, updateTodoRequest: UpdateTodoRequest): Promise<TodoUpdate> {
  logger.info('Updating TODO Id', todoId)
  return await todoAccess.updateTodo(todoId, userId, {
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  })
}

export async function deleteTodo(todoId: string, userId: string) {
  logger.info('Deleting TODO Id', todoId)
  await todoAccess.deleteTodo(todoId, userId)
}

export async function createAttachmentUrl (todoId: string, userId: string) { 
  const timestamp = new Date().toISOString()
  const imageId = uuid.v4()
  const newItem = {
    todoId,
    timestamp,
    imageId,
    imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`
  }
  await attachmentUtils.updateAttachmentUrl(todoId, userId, newItem.imageUrl)

  logger.info('Created attachment url', newItem.imageUrl)
  return getUploadUrl(imageId)
}

function getUploadUrl(imageId: string) {
  logger.info('Uploading ImageID', imageId)
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: parseInt(urlExpiration)
  })
}