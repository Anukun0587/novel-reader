'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { BookOpen, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface ContinueReadingButtonProps {
  novelId: string
  firstChapterId?: string
}

export function ContinueReadingButton({ novelId, firstChapterId }: ContinueReadingButtonProps) {
  const { isSignedIn } = useAuth()
  const [lastChapter, setLastChapter] = useState<{
    id: string
    number: number
    title: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isSignedIn) {
      setIsLoading(false)
      return
    }

    const fetchLastRead = async () => {
      try {
        const response = await fetch(`/api/reading-history/${novelId}`)
        const data = await response.json()
        setLastChapter(data.lastChapter)
      } catch (error) {
        console.error('Error fetching last read:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLastRead()
  }, [novelId, isSignedIn])

  if (isLoading) {
    return (
      <button
        disabled
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg flex items-center gap-2"
      >
        <Loader2 className="h-5 w-5 animate-spin" />
        กำลังโหลด...
      </button>
    )
  }

  // ถ้าไม่มีตอน
  if (!firstChapterId) {
    return (
      <span className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed">
        ยังไม่มีตอน
      </span>
    )
  }

  // ถ้ามีประวัติการอ่าน
  if (lastChapter) {
    return (
      <Link
        href={`/novels/${novelId}/chapters/${lastChapter.id}`}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
      >
        <BookOpen className="h-5 w-5" />
        อ่านต่อ ตอนที่ {lastChapter.number}
      </Link>
    )
  }

  // ถ้ายังไม่เคยอ่าน
  return (
    <Link
      href={`/novels/${novelId}/chapters/${firstChapterId}`}
      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
    >
      เริ่มอ่าน
    </Link>
  )
}