export interface Article {
  id: string
  title: string
  content: string
  status: 'draft' | 'published' | 'scheduled'
  published_at?: Date
  updated_at?: Date
  scheduled_for?: Date
  video_url?: string
  video_status?: 'pending' | 'processing' | 'completed' | 'failed'
}

export interface PaginatedResponse<T> {
  data: T[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    path: string
    links: any[]
    // Add other meta fields as needed
  }
}
