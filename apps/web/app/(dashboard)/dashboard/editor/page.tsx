import EditorComponent from '@/components/dashboard/Editor/EditorComponent'
import { getArticles } from '@/lib/articles'
import { DASHBOARD_URL } from '@/lib/constants'
import { getUser } from '@/lib/user'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Editor',
  description: 'Editor',
}

export default async function EditorPage() {
  const user = await getUser()
  if (!user?.data?.linkedin_access_token) {
    redirect(DASHBOARD_URL)
  }

  const article = await getArticles()
  return (
    <main className="container mx-auto px-4 py-8">
      <EditorComponent article={article} />
    </main>
  )
}
