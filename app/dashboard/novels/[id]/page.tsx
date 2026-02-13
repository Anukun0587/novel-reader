import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { BookOpen, Plus, Edit, Eye, ArrowLeft, Calendar } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

async function getNovelForManage(novelId: string, clerkUserId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId }
  })

  if (!dbUser) return null

  const novel = await prisma.novel.findUnique({
    where: { id: novelId },
    include: {
      genres: true,
      tags: true,
      chapters: {
        orderBy: { number: 'asc' },
        select: {
          id: true,
          number: true,
          title: true,
          wordCount: true,
          isPublished: true,
          createdAt: true
        }
      },
      _count: { select: { chapters: true } }
    }
  })

  if (!novel || novel.authorId !== dbUser.id) {
    return null
  }

  return novel
}

export default async function ManageNovelPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    redirect('/sign-in')
  }

  const novel = await getNovelForManage(id, userId)

  if (!novel) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไป Dashboard
        </Link>

        {/* Novel Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Cover */}
            <div className="w-32 flex-shrink-0 mx-auto md:mx-0">
              <div className="relative aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
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
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{novel.title}</h1>

              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">
                <span>{novel._count.chapters} ตอน</span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded ${novel.status === 'COMPLETED'
                  ? 'bg-green-100 text-green-800'
                  : novel.status === 'ONGOING'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                  }`}>
                  {novel.status === 'COMPLETED' ? 'จบแล้ว' : novel.status === 'ONGOING' ? 'กำลังเขียน' : 'พักเขียน'}
                </span>
              </div>

              {/* Genres */}
              {novel.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {novel.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Tags */}
              {novel.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {novel.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/novels?tag=${encodeURIComponent(tag.name)}`}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/novels/${novel.id}/write`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                  เขียนตอนใหม่
                </Link>
                <Link
                  href={`/novels/${novel.id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50"
                >
                  <Edit className="h-4 w-4" />
                  แก้ไขนิยาย
                </Link>
                <Link
                  href={`/novels/${novel.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  ดูหน้านิยาย
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              รายการตอน ({novel.chapters.length} ตอน)
            </h2>
            <Link
              href={`/novels/${novel.id}/write`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              เขียนตอนใหม่
            </Link>
          </div>

          {novel.chapters.length > 0 ? (
            <div className="divide-y">
              {novel.chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        ตอนที่ {chapter.number}: {chapter.title}
                      </span>
                      {!chapter.isPublished && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                          ฉบับร่าง
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{chapter.wordCount} คำ</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(chapter.createdAt).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/novels/${novel.id}/chapters/${chapter.id}/edit`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                    >
                      <Edit className="h-3 w-3" />
                      แก้ไข
                    </Link>
                    <Link
                      href={`/novels/${novel.id}/chapters/${chapter.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                    >
                      <Eye className="h-3 w-3" />
                      ดู
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">ยังไม่มีตอน</p>
              <Link
                href={`/novels/${novel.id}/write`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                เขียนตอนแรก
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}