import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { NovelCard } from '@/components/novel-card'
import { FollowButton } from '@/components/follow-button'
import { BookOpen, BookText, Calendar, User, Users } from 'lucide-react'
import Image from 'next/image'

async function getAuthor(id: string) {
  const author = await prisma.user.findUnique({
    where: { id },
    include: {
      novels: {
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, name: true } },
          genres: { select: { id: true, name: true } },
          tags: { select: { id: true, name: true } },
          _count: { select: { chapters: true } }
        }
      },
      _count: {
        select: {
          novels: true,
          followers: true,
          following: true
        }
      }
    }
  })

  return author
}

async function getAuthorStats(authorId: string) {
  const totalChapters = await prisma.chapter.count({
    where: {
      novel: { authorId }
    }
  })

  const totalWords = await prisma.chapter.aggregate({
    where: {
      novel: { authorId }
    },
    _sum: { wordCount: true }
  })

  return {
    totalChapters,
    totalWords: totalWords._sum.wordCount || 0
  }
}

async function getCurrentUserId() {
  const { userId } = await auth()
  if (!userId) return null

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true }
  })

  return dbUser?.id || null
}

export default async function AuthorProfilePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [author, stats, currentUserId] = await Promise.all([
    getAuthor(id),
    getAuthorStats(id),
    getCurrentUserId()
  ])

  if (!author) {
    notFound()
  }

  const isOwnProfile = currentUserId === author.id

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {author.avatar ? (
                <Image
                  src={author.avatar}
                  alt={author.name || 'Author'}
                  width={120}
                  height={120}
                  className="rounded-full"
                />
              ) : (
                <div className="w-30 h-30 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="h-16 w-16 text-indigo-600" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {author.name || 'นักเขียน'}
                </h1>

                {/* Follow Button - ไม่แสดงถ้าเป็น profile ตัวเอง */}
                {!isOwnProfile && (
                  <FollowButton authorId={author.id} />
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start gap-4 text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{author._count.followers} ผู้ติดตาม</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    เข้าร่วมเมื่อ {new Date(author.createdAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto md:mx-0">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <BookText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{author._count.novels}</p>
                  <p className="text-sm text-gray-500">นิยาย</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalChapters}</p>
                  <p className="text-sm text-gray-500">ตอน</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-orange-600 font-bold">ก</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalWords.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">คำ</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Novels */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            ผลงานทั้งหมด ({author.novels.length} เรื่อง)
          </h2>

          {author.novels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {author.novels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>ยังไม่มีผลงาน</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}