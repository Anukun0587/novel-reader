import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { EditChapterForm } from '@/components/edit-chapter-form'

async function getChapterForEdit(novelId: string, chapterId: string, clerkUserId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId }
  })

  if (!dbUser) return null

  const novel = await prisma.novel.findUnique({
    where: { id: novelId }
  })

  if (!novel || novel.authorId !== dbUser.id) {
    return null
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      novel: {
        select: { id: true, title: true }
      }
    }
  })

  if (!chapter || chapter.novelId !== novelId) {
    return null
  }

  return chapter
}

export default async function EditChapterPage({
  params
}: {
  params: Promise<{ id: string; chapterId: string }>
}) {
  const { userId } = await auth()
  const { id: novelId, chapterId } = await params

  if (!userId) {
    redirect('/sign-in')
  }

  const chapter = await getChapterForEdit(novelId, chapterId, userId)

  if (!chapter) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-gray-600 mb-1">แก้ไขตอนสำหรับ</p>
          <h1 className="text-2xl font-bold text-gray-900">{chapter.novel.title}</h1>
          <p className="text-sm text-gray-500 mt-1">ตอนที่ {chapter.number}</p>
        </div>

        <EditChapterForm chapter={chapter} novelId={novelId} />
      </main>
    </div>
  )
}