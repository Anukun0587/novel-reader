import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  const { id: novelId } = await params

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const novel = await prisma.novel.findUnique({
    where: { id: novelId }
  })

  if (!novel) {
    return NextResponse.json({ error: 'Novel not found' }, { status: 404 })
  }

  if (novel.authorId !== dbUser.id) {
    return NextResponse.json({ error: 'ไม่มีสิทธิ์แก้ไขนิยายนี้' }, { status: 403 })
  }

  const body = await req.json()
  const { title, content } = body

  if (!title || !content) {
    return NextResponse.json(
      { error: 'กรุณากรอกชื่อตอนและเนื้อหา' },
      { status: 400 }
    )
  }

  const lastChapter = await prisma.chapter.findFirst({
    where: { novelId },
    orderBy: { number: 'desc' }
  })

  const nextNumber = (lastChapter?.number || 0) + 1

  const wordCount = content.trim().split(/\s+/).length

  const chapter = await prisma.chapter.create({
    data: {
      novelId,
      number: nextNumber,
      title,
      content,
      wordCount,
      isPublished: true,
    }
  })

  return NextResponse.json(chapter)
}