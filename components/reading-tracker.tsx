'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'

interface ReadingTrackerProps {
  chapterId: string
}

export function ReadingTracker({ chapterId }: ReadingTrackerProps) {
  const { isSignedIn } = useAuth()

  useEffect(() => {
    if (!isSignedIn) return

    // บันทึกประวัติการอ่าน
    const saveHistory = async () => {
      try {
        await fetch('/api/reading-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapterId })
        })
      } catch (error) {
        console.error('Error saving reading history:', error)
      }
    }

    saveHistory()
  }, [chapterId, isSignedIn])

  return null
}