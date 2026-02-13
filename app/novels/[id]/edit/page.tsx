import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { EditNovelForm } from '@/components/edit-novel-form'

async function getNovel(id: string, clerkUserId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId }
  })

  if (!dbUser) return null

  const novel = await prisma.novel.findUnique({
    where: { id },
    include: {
      genres: true,
      tags: true
    }
  })

  if (!novel || novel.authorId !== dbUser.id) {
    return null
  }

  return novel
}

async function getGenres() {
  return await prisma.genre.findMany({
    orderBy: { name: 'asc' }
  })
}

export default async function EditNovelPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    redirect('/sign-in')
  }

  const [novel, genres] = await Promise.all([
    getNovel(id, userId),
    getGenres()
  ])

  if (!novel) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">แก้ไขนิยาย</h1>
        <EditNovelForm novel={novel} genres={genres} />
      </main>
    </div>
  )
}