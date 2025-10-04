"use client"
import { useEffect, useState } from "react"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Event = {
  id: string
  title: string
  slug: string
  startDate: string
  endDate: string
  location: string
  description: string
}

interface EventCalendarProps {
  onDateSelect?: (date: Date | undefined) => void
}

export default function EventCalendar({ onDateSelect }: EventCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState(false)

  const handleDateSelect = (newDate: Date | undefined) => {
    console.log('Calendar: Selected date:', newDate)
    setDate(newDate)
    onDateSelect?.(newDate)
  }

  // Select current date on mount
  useEffect(() => {
    if (date && onDateSelect) {
      onDateSelect(date)
    }
  }, [])

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5" />
          <span>Event Calendar</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <Calendar 
            mode="single" 
            selected={date} 
            onSelect={handleDateSelect} 
            className="rounded-md" 
          />
        </div>
      </CardContent>
    </Card>
  )
}

