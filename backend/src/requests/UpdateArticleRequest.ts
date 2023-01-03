/**
 * Fields in a request to update a single ARTICLE item.
 */
export interface UpdateArticleRequest {
  name: string
  description: string
  createdAt: string
  publish: boolean
}