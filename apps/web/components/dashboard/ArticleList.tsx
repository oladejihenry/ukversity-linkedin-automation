'use client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Button } from '@workspace/ui/components/button'
import { MoreVertical, Edit, Eye, Trash2, Calendar, PenTool, Plus, Check } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Article, PaginatedResponse } from '@/types/articles'
import { Badge } from '@workspace/ui/components/badge'
import { deleteArticle } from '@/lib/articles'
import { toast } from 'sonner'
import { Separator } from '@workspace/ui/components/separator'

interface ArticleListProps {
  articles: PaginatedResponse<Article>
}

export default function ArticleList({ articles }: ArticleListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const handleDeleteArticle = async (id: string) => {
    try {
      const response = await deleteArticle(id)
      if (response.status === 200) {
        toast.success('Article deleted successfully')
        //refresh the page
        router.refresh()
      } else {
        toast.error(response.message || 'Failed to delete article')
      }
    } catch (error) {
      console.error(error)
    }
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'default'
      case 'scheduled':
        return 'secondary'
      case 'draft':
        return 'outline'
      default:
        return 'default'
    }
  }
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <Check className="h-4 w-4" />
      case 'scheduled':
        return <Calendar className="h-4 w-4" />
      case 'draft':
        return <PenTool className="h-4 w-4" />
      default:
        return <Plus className="h-4 w-4" />
    }
  }
  const handleNewArticle = () => {
    router.push('/dashboard/editor')
  }
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Articles</CardTitle>
          <CardDescription>Manage and organize your content</CardDescription>
        </CardHeader>
        <CardContent>
          {articles.data.length === 0 ? (
            <div className="py-12 text-center">
              <PenTool className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="text-foreground mb-2 text-lg font-medium">No articles yet</h3>
              <p className="text-muted-foreground mb-4">Start creating your first article</p>
              <Button onClick={handleNewArticle}>
                <Plus className="mr-2 h-4 w-4" />
                Create Article
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {articles?.data?.map((article) => (
                <div
                  key={article.id}
                  className="border-border hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      <h3 className="text-foreground truncate font-medium">
                        {article.title || 'Untitled Article'}
                      </h3>
                      <Badge variant={getStatusColor(article.status)}>
                        {getStatusIcon(article.status)}
                        {article.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground flex items-center space-x-4 text-sm">
                      {article.status === 'published' && article.published_at && (
                        <span className="flex items-center">
                          Published {formatDate(article.published_at)}
                        </span>
                      )}
                      {article.status === 'scheduled' && article.scheduled_for && (
                        <span className="flex items-center">
                          Scheduled for{' '}
                          {new Date(article.scheduled_for).toLocaleString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/editor?id=${article.id}`)}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <Separator className="my-1" />
                      <DropdownMenuItem
                        onClick={() => handleDeleteArticle(article.id)}
                        className="cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
