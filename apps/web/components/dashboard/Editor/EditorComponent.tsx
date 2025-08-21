'use client'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Label } from '@workspace/ui/components/label'
import { Input } from '@workspace/ui/components/input'
import { useState } from 'react'
import { Calendar, Send, Sparkles } from 'lucide-react'
import { Article } from '@/types/articles'
import { TiptapEditor } from '@/components/tiptap-editor'
import { PublishDialog } from '@/components/publish-dialog'
import { ScheduleDialog } from '@/components/schedule-dialog'
import { AIContentDialog } from '@/components/ai-content-dialog'
import { createArticle } from '@/lib/articles'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { DASHBOARD_URL } from '@/lib/constants'

export default function EditorComponent() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('draft')
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined)
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)

  const handleGenerateAI = () => {
    console.log('Generate AI')
  }

  const handleScheduleClick = () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please add a title and content before scheduling.')
      return
    }
    setScheduleDialogOpen(true)
  }

  const handlePublishClick = () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please add a title and content before publishing.')
      return
    }
    setPublishDialogOpen(true)
  }

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) return

    try {
      const response = await createArticle(title, content, 'published')
      // console.log(response)
      if (response.data) {
        toast.success('Article published successfully')
        router.push(DASHBOARD_URL)
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      console.error('Error publishing article:', error)
    }
  }

  const handleSchedule = async () => {
    if (!title.trim() || !content.trim()) return

    try {
      const response = await createArticle(title, content, 'scheduled', scheduledDate)
      if (response.data) {
        toast.success('Article scheduled successfully')
        router.push(DASHBOARD_URL)
      }
    } catch (error) {
      console.error('Error scheduling article:', error)
    }
  }

  const handleInsertAIContent = () => {
    console.log('Insert AI Content')
  }

  const handleReplaceTitle = () => {
    console.log('Replace Title')
  }

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Title Section */}
        {/* <Card>
        <CardHeader>
          <CardTitle>Article Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4"> */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Enter your article title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium"
          />
        </div>
        {currentArticle?.data.scheduledFor && status === 'scheduled' && (
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center text-sm">
              <Calendar className="text-primary mr-2 h-4 w-4" />
              <span className="font-medium">Scheduled for:</span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {currentArticle.data.scheduledFor.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}
        {/* </CardContent>
      </Card> */}

        {/* Editor Section */}
        {/* <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent> */}
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <TiptapEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your amazing content..."
          />
        </div>
        {/* </CardContent>
      </Card> */}

        {/* Action Buttons */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleGenerateAI}
              variant="outline"
              className="flex-1 bg-transparent sm:flex-none"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Content
            </Button>
            <Button
              onClick={handleScheduleClick}
              variant="outline"
              className="flex-1 bg-transparent sm:flex-none"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {status === 'scheduled' ? 'Reschedule' : 'Schedule'}
            </Button>
          </div>

          <Button
            onClick={handlePublishClick}
            className="flex-1 sm:flex-none"
            disabled={!title.trim() || !content.trim()}
          >
            <Send className="mr-2 h-4 w-4" />
            {status === 'published' ? 'Update Published' : 'Publish Now'}
          </Button>
        </div>
      </div>

      <PublishDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        title={title}
        onPublish={handlePublish}
        onSchedule={() => {
          setPublishDialogOpen(false)
          setScheduleDialogOpen(true)
        }}
      />
      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        title={title}
        onSchedule={handleSchedule}
      />
      <AIContentDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        currentTitle={title}
        currentContent={content}
        onInsertContent={handleInsertAIContent}
        onReplaceTitle={handleReplaceTitle}
      />
    </>
  )
}
