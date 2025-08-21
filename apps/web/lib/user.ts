import { getAuthHeaders } from './cookies'

export const getUser = async () => {
  const headers = await getAuthHeaders()
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`, {
    headers,
  })
  const data = await response.json()
  return data
}
