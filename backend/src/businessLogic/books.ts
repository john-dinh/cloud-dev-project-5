import  { BookAccess, createS3Client } from '../dataLayer/booksAccess';
import { BookItem } from '../models/BookItem'

const bookData = new BookAccess();
export const getBooksForUser = async (userId: string) => {
    return await bookData.getBooks(userId);
}

export const getBooksForPublish = async (publish, createdAt) => {
  return await bookData.getBooksForPublish(publish, createdAt);
}

export const updateBook = async (payload: any) => {
    return await bookData.updateBook(payload);
}

export const updateAttachmentBook = async (payload: any) => {
    return await bookData.updateAttachmentBook(payload);
}

export const createBook = async (bookItem: BookItem) => {
    return await bookData.createBook(bookItem);
}

export const deleteBook = async (userId: string, bookId: string) => {
    const s3Client = createS3Client()
    s3Client.deleteObject({
        Bucket: process.env.ATTACHMENT_S3_BUCKET,
        Key: `${bookId}.jpg`,
      }, function(err, data) {
        if (err) console.log(err, err.stack);  // error
        else     console.log(`deleted ${bookId}.jpg`, data);
      });
    return await bookData.deleteBook(userId, bookId);
}

export const createAttachmentUrl = async (bookId: string) => {
    const s3Client = createS3Client()
      const write = s3Client.getSignedUrl('putObject', {
        Bucket: process.env.ATTACHMENT_S3_BUCKET,
        Key: `${bookId}.jpg`,
        ContentType: 'image/jpeg',
        Expires: 43200
      })

      const read = s3Client.getSignedUrl('getObject', {
        Bucket: process.env.ATTACHMENT_S3_BUCKET,
        Key: `${bookId}.jpg`,
        Expires: 43200
      })

      return {write, read};
}





