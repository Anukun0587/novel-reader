'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { CommentForm } from './comment-form'
import { CommentList } from './comment-list'

interface CommentSectionProps {
  novelId: string
  chapterId?: string
  title?: string
  showChapterInfo?: boolean
}

export function CommentSection({ 
  novelId, 
  chapterId,
  title = 'ความคิดเห็น',
  showChapterInfo = false
}: CommentSectionProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleCommentAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-6 w-6 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>

      {/* Comment Form */}
      <div className="mb-6">
        <CommentForm
          novelId={novelId}
          chapterId={chapterId}
          onCommentAdded={handleCommentAdded}
        />
      </div>

      {/* Comment List */}
      <CommentList
        novelId={novelId}
        chapterId={chapterId}
        refreshTrigger={refreshTrigger}
        showChapterInfo={showChapterInfo}
      />
    </div>
  )
}