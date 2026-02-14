'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Loader2, UserPlus, UserCheck } from 'lucide-react'

interface FollowButtonProps {
  authorId: string
}

export function FollowButton({ authorId }: FollowButtonProps) {
  const { isSignedIn } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const response = await fetch(`/api/follow/${authorId}`)
        const data = await response.json()
        setIsFollowing(data.isFollowing)
      } catch (error) {
        console.error('Error checking follow status:', error)
      } finally {
        setIsChecking(false)
      }
    }

    if (isSignedIn) {
      checkFollowStatus()
    } else {
      setIsChecking(false)
    }
  }, [authorId, isSignedIn])

  const handleClick = async () => {
    if (!isSignedIn) {
      window.location.href = '/sign-in'
      return
    }

    setIsLoading(true)

    try {
      if (isFollowing) {
        const response = await fetch(`/api/follow/${authorId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setIsFollowing(false)
        }
      } else {
        const response = await fetch('/api/follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authorId })
        })

        if (response.ok) {
          setIsFollowing(true)
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>โหลด...</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isFollowing
          ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserCheck className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      <span>{isFollowing ? 'ติดตามแล้ว' : 'ติดตาม'}</span>
    </button>
  )
}