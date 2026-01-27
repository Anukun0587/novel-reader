import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// แก้ไขตอน
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  const { userId } = await auth()
  const { id: novelId, chapterId } = await params

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

  if (!novel || novel.authorId !== dbUser.id) {
    return NextResponse.json({ error: 'ไม่มีสิทธิ์แก้ไข' }, { status: 403 })
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId }
  })

  if (!chapter || chapter.novelId !== novelId) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
  }

  const body = await req.json()
  const { title, content, isPublished } = body

  const wordCount = content ? content.trim().split(/\s+/).length : chapter.wordCount

  const updatedChapter = await prisma.chapter.update({
    where: { id: chapterId },
    data: {
      ...(title && { title }),
      ...(content && { content, wordCount }),
      ...(typeof isPublished === 'boolean' && { isPublished })
    }
  })

  return NextResponse.json(updatedChapter)
}

// ลบตอน
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  const { userId } = await auth()
  const { id: novelId, chapterId } = await params

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

  if (!novel || novel.authorId !== dbUser.id) {
    return NextResponse.json({ error: 'ไม่มีสิทธิ์ลบ' }, { status: 403 })
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId }
  })

  if (!chapter || chapter.novelId !== novelId) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
  }

  await prisma.chapter.delete({
    where: { id: chapterId }
  })

  return NextResponse.json({ message: 'ลบตอนสำเร็จ' })
}