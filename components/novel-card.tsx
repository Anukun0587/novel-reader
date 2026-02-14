import Link from 'next/link'
import Image from 'next/image'
import { BookOpen } from 'lucide-react'

interface NovelCardProps {
  novel: {
    id: string
    title: string
    coverImage: string | null
    author: {
      id?: string
      name: string | null
    } | null
    genres: {
      id: string
      name: string
    }[]
    tags?: {
      id: string
      name: string
    }[]
    _count: {
      chapters: number
    }
  }
}

export function NovelCard({ novel }: NovelCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/novels/${novel.id}`}>
        <div className="relative aspect-[3/4] bg-gray-200">
          {novel.coverImage ? (
            <Image
              src={novel.coverImage}
              alt={novel.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/novels/${novel.id}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-indigo-600 mb-1">
            {novel.title}
          </h3>
        </Link>
        {novel.author && (
          <Link
            href={`/authors/${novel.author.id}`}
            className="text-sm text-gray-500 hover:text-indigo-600 mb-2 block"
          >
            {novel.author.name || 'ไม่ระบุชื่อ'}
          </Link>
        )}
        <p className="text-xs text-gray-400 mb-2">
          {novel._count.chapters} ตอน
        </p>

        {novel.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {novel.genres.slice(0, 2).map((genre) => {
              return (
                <Link
                  key={genre.id}
                  href={`/novels?genre=${genre.id}`}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200"
                >
                  {genre.name}
                </Link>
              )
            })}
          </div>
        )}

        {novel.tags && novel.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {novel.tags.slice(0, 2).map((tag) => {
              return (
                <Link
                  key={tag.id}
                  href={`/novels?tag=${encodeURIComponent(tag.name)}`}
                  className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs hover:bg-indigo-100"
                >
                  #{tag.name}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}