'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'

interface BookmarkButtonProps {
  novelId: string
  className?: string
}

export function BookmarkButton({ novelId, className = '' }: BookmarkButtonProps) {
  const { isSignedIn } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // ตรวจสอบสถานะบุ๊คมาร์คตอนโหลด
  useEffect(() => {
    if (!isSignedIn) {
      setIsChecking(false)
      return
    }

    const checkBookmark = async () => {
      try {
        const response = await fetch(`/api/bookmarks/${novelId}`)
        const data = await response.json()
        setIsBookmarked(data.isBookmarked)
      } catch (error) {
        console.error('Error checking bookmark:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkBookmark()
  }, [novelId, isSignedIn])

  const handleClick = async () => {
    if (!isSignedIn) {
      window.location.href = '/sign-in'
      return
    }

    setIsLoading(true)

    try {
      if (isBookmarked) {
        await fetch(`/api/bookmarks/${novelId}`, {
          method: 'DELETE'
        })
        setIsBookmarked(false)
      } else {
        await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ novelId })
        })
        setIsBookmarked(true)
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg ${className}`}
      >
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="hidden sm:inline">บุ๊คมาร์ค</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
        isBookmarked
          ? 'bg-yellow-100 border border-yellow-500 text-yellow-700 hover:bg-yellow-200'
          : 'border border-gray-300 hover:bg-gray-50'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="h-5 w-5" />
      ) : (
        <Bookmark className="h-5 w-5" />
      )}
      <span className="hidden sm:inline">
        {isBookmarked ? 'บุ๊คมาร์คแล้ว' : 'บุ๊คมาร์ค'}
      </span>
    </button>
  )
}