import { BookOpen } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({
  title = 'ยังไม่มีนิยาย',
  description = 'เริ่มต้นเขียนนิยายเรื่องแรกของคุณ',
  actionLabel = 'เขียนนิยาย',
  actionHref = '/write'
}: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <Link
        href={actionHref}
        className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        {actionLabel}
      </Link>
    </div>
  )
}