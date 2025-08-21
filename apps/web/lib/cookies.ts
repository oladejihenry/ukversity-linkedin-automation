import { cookies } from 'next/headers'

export async function getLaravelCookie(name: string): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(name)?.value || null
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const laravelCookie = await getLaravelCookie(
    process.env.NEXT_PUBLIC_COOKIE_NAME || 'laravel-session',
  )
  const csrfToken = await getLaravelCookie('XSRF-TOKEN')

  const headers: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-XSRF-TOKEN': csrfToken || '',
    Referer: process.env.NEXT_PUBLIC_FRONTEND_URL || '',
  }
  if (laravelCookie && csrfToken) {
    headers['Cookie'] =
      `${process.env.NEXT_PUBLIC_COOKIE_NAME}=${laravelCookie};XSRF-TOKEN=${csrfToken}`
  }
  return headers
}
