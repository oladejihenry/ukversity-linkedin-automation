'use server'
import { revalidatePath } from 'next/cache'
import { getAuthHeaders } from './cookies'

export const createArticle = async (
  title: string,
  content: string,
  status: string,
  scheduledFor?: Date,
  generateVideo?: boolean,
) => {
  const headers = await getAuthHeaders()
  const body: any = { title, content, status }
  if (scheduledFor) {
    body.scheduled_for = scheduledFor.toISOString()
  }
  if (generateVideo) {
    body.generate_video = generateVideo
  }
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/articles`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const error = await response.json()
    return {
      success: false,
      message: error.message || 'Failed to create article',
    }
  }
  const data = await response.json()
  return data
}

export const getArticles = async () => {
  const headers = await getAuthHeaders()
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/articles`, {
    headers,
  })
  if (!response.ok) {
    const error = await response.json()
    return {
      success: false,
      message: error.message || 'Failed to get articles',
    }
  }
  const data = await response.json()
  return data
}

export const deleteArticle = async (id: string) => {
  const headers = await getAuthHeaders()
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/articles/${id}`, {
    headers,
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    return {
      success: false,
      message: error.message || 'Failed to delete article',
    }
  }

  revalidatePath('/dashboard')
  const data = await response.json()
  return data
}
