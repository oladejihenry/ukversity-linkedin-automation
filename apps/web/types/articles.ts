export type Article = {
  data: {
    id: string
    title: string
    content: string
    status: 'draft' | 'published' | 'scheduled'
    createdAt: Date
    updatedAt: Date
    publishedAt?: Date
    scheduledFor?: Date
    author: string
    slug: string
  }
}
