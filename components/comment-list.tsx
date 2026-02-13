'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Trash2, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    avatar: string | null
  }
  chapter?: {
    id: string
    number: number
    title: string
  } | null
}

interface CommentListProps {
  novelId: string
  chapterId?: string
  refreshTrigger: number
  showChapterInfo?: boolean
}

export function CommentList({ 
  novelId, 
  chapterId, 
  refreshTrigger,
  showChapterInfo = false 
}: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    try {
      const params = new URLSearchParams({ novelId })
      if (chapterId) params.set('chapterId', chapterId)

      const response = await fetch(`/api/comments?${params.toString()}`)
      const data = await response.json()
      setComments(data.comments || [])
      setCurrentUserId(data.currentUserId || null)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoading(false)
    }
  }, [novelId, chapterId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments, refreshTrigger])

  const handleDelete = async (commentId: string) => {
    if (!confirm('ต้องการลบความคิดเห็นนี้หรือไม่?')) return

    setDeletingId(commentId)

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setComments(comments.filter((c) => c.id !== commentId))
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>ยังไม่มีความคิดเห็น</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          novelId={novelId}
          isOwner={currentUserId === comment.user.id}
          showChapterInfo={showChapterInfo}
          isDeleting={deletingId === comment.id}
          onDelete={() => handleDelete(comment.id)}
        />
      ))}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  novelId: string
  isOwner: boolean
  showChapterInfo: boolean
  isDeleting: boolean
  onDelete: () => void
}

function CommentItem({ 
  comment, 
  novelId,
  isOwner, 
  showChapterInfo,
  isDeleting, 
  onDelete 
}: CommentItemProps) {
  return (
    <div className="bg-white rounded-lg p-4 border">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.user.avatar ? (
            <Image
              src={comment.user.avatar}
              alt={comment.user.name || 'User'}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-semibold">
                {comment.user.name?.[0] || 'U'}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">
              {comment.user.name || 'ผู้ใช้'}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(comment.createdAt).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {/* Chapter Info */}
          {showChapterInfo && comment.chapter && (
            <Link
              href={`/novels/${novelId}/chapters/${comment.chapter.id}`}
              className="text-xs text-indigo-600 hover:text-indigo-700 mb-2 inline-block"
            >
              ตอนที่ {comment.chapter.number}: {comment.chapter.title}
            </Link>
          )}

          <p className="text-gray-700 whitespace-pre-line">{comment.content}</p>
        </div>

        {/* Delete Button - แสดงเฉพาะเจ้าของ */}
        {isOwner && (
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-500 p-1"
            title="ลบความคิดเห็น"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}