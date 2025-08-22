'use client'
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'

export function ArticleListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-32" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-48" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border-border flex items-center justify-between rounded-lg border p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center space-x-3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="text-muted-foreground flex items-center space-x-4 text-sm">
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
