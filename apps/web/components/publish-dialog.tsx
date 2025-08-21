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
import { Badge } from '@workspace/ui/components/badge'
import { Calendar, Send, Loader2 } from 'lucide-react'

interface PublishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onPublish: () => Promise<void>
  onSchedule: () => void
}

export function PublishDialog({
  open,
  onOpenChange,
  title,
  onPublish,
  onSchedule,
}: PublishDialogProps) {
  const [publishing, setPublishing] = useState(false)

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await onPublish()
      onOpenChange(false)
    } finally {
      setPublishing(false)
    }
  }

  const handleSchedule = () => {
    onSchedule()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publish Article</DialogTitle>
          <DialogDescription>Choose how you want to publish your article.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-border bg-card rounded-lg border p-4">
            <h3 className="text-card-foreground mb-2 font-medium">{title || 'Untitled Article'}</h3>
            <Badge variant="secondary">Ready to publish</Badge>
          </div>

          <div className="text-muted-foreground text-sm">
            Choose to publish immediately or schedule for a specific date and time.
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleSchedule}
            className="w-full bg-transparent sm:w-auto"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule for Later
          </Button>
          <Button onClick={handlePublish} disabled={publishing} className="w-full sm:w-auto">
            {publishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Publish Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
