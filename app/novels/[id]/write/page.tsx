import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { ChapterForm } from '@/components/chapter-form'

async function getNovel(id: string, userId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!dbUser) return null

  const novel = await prisma.novel.findUnique({
    where: { id },
    include: {
      _count: { select: { chapters: true } }
    }
  })

  if (!novel || novel.authorId !== dbUser.id) {
    return null
  }

  return novel
}

export default async function WriteChapterPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    redirect('/sign-in')
  }

  const novel = await getNovel(id, userId)

  if (!novel) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-gray-600 mb-1">เขียนตอนใหม่สำหรับ</p>
          <h1 className="text-2xl font-bold text-gray-900">{novel.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            ตอนที่ {novel._count.chapters + 1}
          </p>
        </div>

        <ChapterForm novelId={novel.id} />
      </main>
    </div>
  )
}