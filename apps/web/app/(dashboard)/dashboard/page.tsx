import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import ArticleList from '@/components/dashboard/ArticleList'
import { Metadata } from 'next'
import { getArticles } from '@/lib/articles'
import { notFound } from 'next/navigation'
import { Article } from '@/types/articles'

export const metadata: Metadata = {
  title: 'Dashboard | UkVersity',
  description: 'Dashboard',
}

export default async function DashboardPage() {
  const articles = await getArticles()
  console.log(articles)
  if (!articles.data) {
    notFound()
  }
  const handleDeleteArticle = (id: string) => {
    console.log(id)
  }
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Total Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articles.data.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-primary text-2xl font-bold">
                {articles.data.filter((article: Article) => article.status === 'published').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {articles.data.filter((a: Article) => a.status === 'scheduled').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">Deleted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {articles.meta?.deleted_count || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Articles List */}
        <ArticleList articles={articles} />
      </div>
    </main>
  )
}
