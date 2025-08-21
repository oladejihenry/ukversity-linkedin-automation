import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import ArticleList from '@/components/dashboard/ArticleList'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard',
}

export default function DashboardPage() {
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
              {/* <div className="text-2xl font-bold">{articles.length}</div> */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-primary text-2xl font-bold">
                {/* {articles.filter((a) => a.status === 'published').length} */}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-accent text-2xl font-bold">
                {/* {articles.filter((a) => a.status === 'scheduled').length} */}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-2xl font-bold">
                {/* {articles.filter((a) => a.status === 'draft').length} */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Articles List */}
        <ArticleList />
      </div>
    </main>
  )
}
