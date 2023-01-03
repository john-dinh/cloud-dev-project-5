import  { ArticleAccess, createS3Client } from '../dataLayer/articlesAccess';
import { ArticleItem } from '../models/ArticleItem'
const articleData = new ArticleAccess();
export const getArticlesForUser = async (userId: string) => {
    return await articleData.getArticles(userId);
}

export const getArticlesForPublish = async (publish, createdAt) => {
  return await articleData.getArticlesForPublish(publish, createdAt);
}

export const createArticle = async (articleItem: ArticleItem) => {
    return await articleData.createArticle(articleItem);
}

export const deleteArticle = async (userId: string, articleId: string) => {
    const s3Client = createS3Client()
    s3Client.deleteObject({
        Bucket: process.env.ATTACHMENT_S3_BUCKET,
        Key: `${articleId}.jpg`,
      }, function(err, data) {
        if (err) console.log(err, err.stack);  // error
        else     console.log(`deleted ${articleId}.jpg`, data);
      });
    return await articleData.deleteArticle(userId, articleId);
}

export const updateArticle = async (payload: any) => {
    return await articleData.updateArticle(payload);
}

export const updateAttachmentArticle = async (payload: any) => {
    return await articleData.updateAttachmentArticle(payload);
}

export const createAttachmentPresignedUrl = async (articleId: string) => {

    const s3Client = createS3Client()

      const write = s3Client.getSignedUrl('putObject', {
        Bucket: process.env.ATTACHMENT_S3_BUCKET,
        Key: `${articleId}.jpg`,
        ContentType: 'image/jpeg',
        Expires: 43200
      })

      const read = s3Client.getSignedUrl('getObject', {
        Bucket: process.env.ATTACHMENT_S3_BUCKET,
        Key: `${articleId}.jpg`,
        Expires: 43200
      })

      return {write, read};

}





