import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { BookOpen, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface HistoryItem {
  novel: {
    id: string
    title: string
    coverImage: string | null
    author: {
      name: string | null
    } | null
    _count: {
      chapters: number
    }
  }
  lastChapter: {
    id: string
    number: number
    title: string
  }
  readAt: Date
}

async function getReadingHistory(clerkUserId: string): Promise<HistoryItem[]> {
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId }
  })

  if (!dbUser) return []

  const history = await prisma.readingHistory.findMany({
    where: { userId: dbUser.id },
    include: {
      chapter: {
        include: {
          novel: {
            include: {
              author: {
                select: { name: true }
              },
              _count: {
                select: { chapters: true }
              }
            }
          }
        }
      }
    },
    orderBy: { readAt: 'desc' }
  })

  // กรุ๊ปตามนิยาย เอาแค่ตอนล่าสุด
  const novelMap = new Map<string, HistoryItem>()
  for (const item of history) {
    const novelId = item.chapter.novelId
    if (!novelMap.has(novelId)) {
      novelMap.set(novelId, {
        novel: item.chapter.novel,
        lastChapter: {
          id: item.chapter.id,
          number: item.chapter.number,
          title: item.chapter.title
        },
        readAt: item.readAt
      })
    }
  }

  return Array.from(novelMap.values())
}

export default async function HistoryPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const history = await getReadingHistory(userId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">ประวัติการอ่าน</h1>
          </div>
          <p className="text-gray-600">
            {history.length > 0
              ? `คุณอ่าน ${history.length} เรื่อง`
              : 'ยังไม่มีประวัติการอ่าน'}
          </p>
        </div>

        {/* History List */}
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item) => (
              <HistoryCard key={item.novel.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">ยังไม่มีประวัติการอ่าน</h3>
            <p className="text-gray-600 mb-6">เริ่มอ่านนิยายเรื่องแรกของคุณ</p>
            <Link
              href="/novels"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              ดูนิยายทั้งหมด
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

function HistoryCard({ item }: { item: HistoryItem }) {
  const { novel, lastChapter, readAt } = item

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex gap-4">
      {/* Cover */}
      <Link href={`/novels/${novel.id}`} className="flex-shrink-0">
        <div className="relative w-20 aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
          {novel.coverImage ? (
            <Image
              src={novel.coverImage}
              alt={novel.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/novels/${novel.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-indigo-600 line-clamp-1">
            {novel.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mb-2">
          {novel.author?.name || 'ไม่ระบุชื่อ'}
        </p>
        <p className="text-sm text-gray-600 mb-3">
          อ่านถึง: ตอนที่ {lastChapter.number} - {lastChapter.title}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {new Date(readAt).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          <Link
            href={`/novels/${novel.id}/chapters/${lastChapter.id}`}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
          >
            อ่านต่อ
          </Link>
        </div>
      </div>
    </div>
  )
}