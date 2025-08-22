'use client'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Label } from '@workspace/ui/components/label'
import { Input } from '@workspace/ui/components/input'
import { useState } from 'react'
import { Calendar, Loader2, Send, Sparkles } from 'lucide-react'
import { Article } from '@/types/articles'
import { TiptapEditor } from '@/components/tiptap-editor'
import { PublishDialog } from '@/components/publish-dialog'
import { ScheduleDialog } from '@/components/schedule-dialog'
import { AIContentDialog } from '@/components/ai-content-dialog'
import { createArticle } from '@/lib/articles'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { DASHBOARD_URL } from '@/lib/constants'
import { Checkbox } from '@workspace/ui/components/checkbox'
import axiosInstance from '@/lib/axios'

interface EditorComponentProps {
  article: Article
}

export default function EditorComponent({ article }: EditorComponentProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('draft')
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined)
  const [currentArticle, setCurrentArticle] = useState<Article | null>(article)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [generateVideo, setGenerateVideo] = useState(false)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)

  const handleGenerateAI = () => {
    setAiDialogOpen(true)
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

  const handleSchedule = async (selectedDate: Date) => {
    if (!title.trim() || !content.trim() || !selectedDate) {
      toast.error('Please add a title, content and scheduled date before scheduling.')
      return
    }

    try {
      setScheduledDate(selectedDate)
      // if (generateVideo) {
      //   setIsGeneratingVideo(true)
      //   const videoResponse = await axiosInstance.post('/api/video/generate', {
      //     title: title,
      //     content: content,
      //     scheduled_for: selectedDate,
      //   })
      //   if (videoResponse.data.success) {
      //     toast.success('Video generation started')
      //     router.push(DASHBOARD_URL)
      //   } else {
      //     toast.error(videoResponse.data.message)
      //   }
      //   setIsGeneratingVideo(false)
      // }
      const response = await createArticle(title, content, 'scheduled', selectedDate, generateVideo)
      if (response.data) {
        toast.success('Article scheduled successfully')
        router.push(DASHBOARD_URL)
      }
    } catch (error) {
      console.error('Error scheduling article:', error)
    }
  }

  const handleUpdateAIContent = (newTitle: string, newContent: string) => {
    setTitle(newTitle)
    setContent(newContent)
    toast.success('Content updated with AI-generated text')
  }

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-6">
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
        {currentArticle?.scheduled_for && status === 'scheduled' && (
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center text-sm">
              <Calendar className="text-primary mr-2 h-4 w-4" />
              <span className="font-medium">Scheduled for:</span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {currentArticle.scheduled_for.toLocaleString('en-US', {
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
            onChange={(newContent) => {
              setContent(newContent)
            }}
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
            {/* check box to allow video */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="generateVideo"
                checked={generateVideo}
                onCheckedChange={(checked) => setGenerateVideo(checked === true)}
              />
              <Label htmlFor="generateVideo">Generate video for LinkedIn post</Label>
            </div>
          </div>

          {/* <Button
            onClick={handlePublishClick}
            className="flex-1 sm:flex-none"
            disabled={!title.trim() || !content.trim()}
          >
            <Send className="mr-2 h-4 w-4" />
            {status === 'published' ? 'Update Published' : 'Publish Now'}
          </Button> */}

          <Button
            onClick={handleScheduleClick}
            className="flex-1 sm:flex-none"
            disabled={isGeneratingVideo}
          >
            {isGeneratingVideo ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                {status === 'scheduled' ? 'Reschedule' : 'Schedule'}
              </>
            )}
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
        onUpdateContent={handleUpdateAIContent}
      />
    </>
  )
}
