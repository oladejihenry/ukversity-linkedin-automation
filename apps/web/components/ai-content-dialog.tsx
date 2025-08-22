'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { RadioGroup, RadioGroupItem } from '@workspace/ui/components/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Sparkles, Loader2, Copy, Check, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import axiosInstance from '@/lib/axios'
import { AxiosError } from 'axios'

interface AIContentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTitle: string
  currentContent: string
  onUpdateContent: (title: string, content: string) => void
}

export function AIContentDialog({
  open,
  onOpenChange,
  currentTitle,
  currentContent,
  onUpdateContent,
}: AIContentDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    try {
      const response = await axiosInstance.post('/api/ai/generate', {
        prompt,
        currentTitle,
        currentContent,
      })
      if (response.data.success) {
        const { title, content } = response.data
        const formattedContent = content.replace(/\n/g, '<br>')
        onUpdateContent(title, formattedContent)
        toast.success('Content generated successfully')
        onOpenChange(false)
        setPrompt('')
      } else {
        toast.error(response.data.message || 'Failed to generate content')
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message)
      } else {
        toast.error('Failed to generate content')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary h-5 w-5" />
            AI Content Generator
          </DialogTitle>
          <DialogDescription>
            Enter a prompt and let AI help you create engaging content.
          </DialogDescription>
          <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">
            <strong>N.B:</strong> After content is generated, it will replace any existing title and
            content on your article.
          </div>
        </DialogHeader>

        {/* Left Panel - Configuration */}
        <div className="space-y-6">
          <label htmlFor="ai-prompt" className="mb-2 block text-sm font-medium">
            Enter your prompt
          </label>
          <Textarea
            id="ai-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Create content for a linkedin post about UKVersity or Anything else"
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-emerald-500 text-white hover:bg-emerald-600"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">Generate</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
