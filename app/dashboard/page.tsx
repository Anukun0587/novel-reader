import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { BookOpen, Plus, Edit, Eye, BookText, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

async function getMyNovels(clerkUserId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId }
  })

  if (!dbUser) return []

  const novels = await prisma.novel.findMany({
    where: { authorId: dbUser.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      genres: { select: { name: true } },
      _count: { select: { chapters: true } }
    }
  })

  return novels
}

async function getStats(clerkUserId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId }
  })

  if (!dbUser) return { totalNovels: 0, totalChapters: 0 }

  const totalNovels = await prisma.novel.count({
    where: { authorId: dbUser.id }
  })

  const totalChapters = await prisma.chapter.count({
    where: {
      novel: { authorId: dbUser.id }
    }
  })

  return { totalNovels, totalChapters }
}

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const [novels, stats] = await Promise.all([
    getMyNovels(userId),
    getStats(userId)
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard นักเขียน</h1>
            <p className="text-gray-600">จัดการนิยายของคุณ</p>
          </div>
          <Link
            href="/write"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            <Plus className="h-5 w-5" />
            สร้างนิยายใหม่
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <BookText className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalNovels}</p>
                <p className="text-gray-500">นิยายทั้งหมด</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalChapters}</p>
                <p className="text-gray-500">ตอนทั้งหมด</p>
              </div>
            </div>
          </div>
        </div>

        {/* Novel List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">นิยายของฉัน</h2>
          </div>

          {novels.length > 0 ? (
            <div className="divide-y">
              {novels.map((novel) => (
                <NovelRow key={novel.id} novel={novel} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ยังไม่มีนิยาย</h3>
              <p className="text-gray-500 mb-6">เริ่มต้นเขียนนิยายเรื่องแรกของคุณ</p>
              <Link
                href="/write"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5" />
                สร้างนิยายใหม่
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

interface NovelRowProps {
  novel: {
    id: string
    title: string
    coverImage: string | null
    status: string
    updatedAt: Date
    genres: { name: string }[]
    _count: { chapters: number }
  }
}

function NovelRow({ novel }: NovelRowProps) {
  return (
    <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
      {/* Cover */}
      <Link href={`/dashboard/novels/${novel.id}`} className="flex-shrink-0">
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
        <Link href={`/dashboard/novels/${novel.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-indigo-600 line-clamp-1 mb-1">
            {novel.title}
          </h3>
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-2">
          <span>{novel._count.chapters} ตอน</span>
          <span>•</span>
          <span className={`px-2 py-0.5 rounded text-xs ${
            novel.status === 'COMPLETED'
              ? 'bg-green-100 text-green-800'
              : novel.status === 'ONGOING'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {novel.status === 'COMPLETED' ? 'จบแล้ว' : novel.status === 'ONGOING' ? 'กำลังเขียน' : 'พักเขียน'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          <span>อัพเดท {new Date(novel.updatedAt).toLocaleDateString('th-TH')}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex sm:flex-col gap-2">
        <Link
          href={`/dashboard/novels/${novel.id}`}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
        >
          <Edit className="h-4 w-4" />
          <span className="hidden sm:inline">จัดการ</span>
        </Link>
        <Link
          href={`/novels/${novel.id}`}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
        >
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">ดูหน้านิยาย</span>
        </Link>
      </div>
    </div>
  )
}