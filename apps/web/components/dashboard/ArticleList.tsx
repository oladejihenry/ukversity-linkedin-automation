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
import { MoreVertical, Edit, Eye, Trash2, Calendar } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ArticleList() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Articles</CardTitle>
          <CardDescription>Manage and organize your content</CardDescription>
        </CardHeader>
        <CardContent>
          {/* {articles.length === 0 ? (
              <div className="py-12 text-center">
                <PenTool className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="text-foreground mb-2 text-lg font-medium">No articles yet</h3>
                <p className="text-muted-foreground mb-4">Start creating your first article</p>
                <Button onClick={() => router.push('/editor')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Article
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
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
                        <span>Updated {formatDate(article.updatedAt)}</span>
                        {article.publishedAt && (
                          <span>Published {formatDate(article.publishedAt)}</span>
                        )}
                        {article.scheduledFor && article.status === 'scheduled' && (
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            Scheduled for {formatDate(article.scheduledFor)}
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
                        <DropdownMenuItem onClick={() => router.push(`/editor?id=${article.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {article.status === 'published' && (
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDeleteArticle(article.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )} */}
        </CardContent>
      </Card>
    </>
  )
}
