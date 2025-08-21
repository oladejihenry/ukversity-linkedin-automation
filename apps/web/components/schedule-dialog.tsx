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
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Badge } from '@workspace/ui/components/badge'
import { Calendar, Clock, Loader2 } from 'lucide-react'

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onSchedule: (scheduledDate: Date) => Promise<void>
}

export function ScheduleDialog({ open, onOpenChange, title, onSchedule }: ScheduleDialogProps) {
  const [scheduling, setScheduling] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  // Set default date to tomorrow and time to 9:00 AM
  const getDefaultDateTime = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const defaultDate = tomorrow.toISOString().split('T')[0]
    const defaultTime = '09:00'

    return { defaultDate, defaultTime }
  }

  const { defaultDate, defaultTime } = getDefaultDateTime()

  const handleSchedule = async () => {
    const date = selectedDate || defaultDate
    const time = selectedTime || defaultTime

    if (!date || !time) {
      alert('Please select both date and time')
      return
    }

    const scheduledDateTime = new Date(`${date}T${time}`)
    const now = new Date()

    if (scheduledDateTime <= now) {
      alert('Please select a future date and time')
      return
    }

    setScheduling(true)
    try {
      await onSchedule(scheduledDateTime)
      onOpenChange(false)
      // Reset form
      setSelectedDate('')
      setSelectedTime('')
    } finally {
      setScheduling(false)
    }
  }

  const formatScheduledDate = () => {
    const date = selectedDate || defaultDate
    const time = selectedTime || defaultTime

    if (date && time) {
      const scheduledDateTime = new Date(`${date}T${time}`)
      return scheduledDateTime.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }
    return ''
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Article</DialogTitle>
          <DialogDescription>Choose when you want your article to be published.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-border bg-card rounded-lg border p-4">
            <h3 className="text-card-foreground mb-2 font-medium">{title || 'Untitled Article'}</h3>
            <Badge variant="outline">
              <Clock className="mr-1 h-3 w-3" />
              Scheduled
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-date">Date</Label>
              <Input
                id="schedule-date"
                type="date"
                value={selectedDate || defaultDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-time">Time</Label>
              <Input
                id="schedule-time"
                type="time"
                value={selectedTime || defaultTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
          </div>

          {formatScheduledDate() && (
            <div className="bg-muted rounded-lg p-3">
              <div className="flex items-center text-sm">
                <Calendar className="text-primary mr-2 h-4 w-4" />
                <span className="font-medium">Scheduled for:</span>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">{formatScheduledDate()}</p>
            </div>
          )}

          <div className="text-muted-foreground text-sm">
            Your article will be automatically published at the scheduled time.
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={scheduling} className="w-full sm:w-auto">
            {scheduling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Article
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
