'use server'
import { getAuthHeaders } from './cookies'

export const createArticle = async (
  title: string,
  content: string,
  status: string,
  scheduledFor?: Date,
) => {
  const headers = await getAuthHeaders()
  const body: any = { title, content, status }
  if (scheduledFor) {
    body.scheduled_for = scheduledFor.toISOString()
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
