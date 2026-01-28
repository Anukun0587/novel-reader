import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { NovelGrid } from '@/components/novel-grid'
import { EmptyState } from '@/components/empty-state'
import { Bookmark } from 'lucide-react'

async function getBookmarks(clerkUserId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId }
  })

  if (!dbUser) return []

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: dbUser.id },
    include: {
      novel: {
        include: {
          author: {
            select: { name: true }
          },
          genres: {
            select: { name: true }
          },
          _count: {
            select: { chapters: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return bookmarks.map((b) => b.novel)
}

export default async function BookmarksPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const novels = await getBookmarks(userId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">บุ๊คมาร์คของฉัน</h1>
          </div>
          <p className="text-gray-600">
            {novels.length > 0
              ? `คุณมี ${novels.length} เรื่องในบุ๊คมาร์ค`
              : 'ยังไม่มีนิยายในบุ๊คมาร์ค'}
          </p>
        </div>

        {/* Novel Grid or Empty State */}
        {novels.length > 0 ? (
          <NovelGrid novels={novels} />
        ) : (
          <EmptyState
            title="ยังไม่มีบุ๊คมาร์ค"
            description="เริ่มบุ๊คมาร์คนิยายที่คุณชื่นชอบ"
            actionLabel="ดูนิยายทั้งหมด"
            actionHref="/novels"
          />
        )}
      </main>
    </div>
  )
}