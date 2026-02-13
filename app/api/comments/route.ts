import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// ดึงความคิดเห็นทั้งหมดของนิยาย
export async function GET(req: Request) {
  const { userId: clerkUserId } = await auth()
  const { searchParams } = new URL(req.url)
  const novelId = searchParams.get('novelId')
  const chapterId = searchParams.get('chapterId')

  if (!novelId) {
    return NextResponse.json({ error: 'Novel ID is required' }, { status: 400 })
  }

  // ดึง currentUserId จาก database
  let currentUserId: string | null = null
  if (clerkUserId) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true }
    })
    currentUserId = dbUser?.id || null
  }

  const comments = await prisma.comment.findMany({
    where: {
      novelId,
      ...(chapterId ? { chapterId } : {})
    },
    include: {
      user: {
        select: { id: true, name: true, avatar: true }
      },
      chapter: {
        select: { id: true, number: true, title: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({ comments, currentUserId })
}

// สร้างความคิดเห็น
export async function POST(req: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const body = await req.json()
  const { novelId, chapterId, content } = body

  if (!novelId || !content) {
    return NextResponse.json(
      { error: 'Novel ID and content are required' },
      { status: 400 }
    )
  }


  const novel = await prisma.novel.findUnique({
    where: { id: novelId }
  })

  if (!novel) {
    return NextResponse.json({ error: 'Novel not found' }, { status: 404 })
  }

  if (chapterId) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId }
    })

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      userId: dbUser.id,
      novelId,
      chapterId: chapterId || null
    },
    include: {
      user: {
        select: { id: true, name: true, avatar: true }
      },
      chapter: {
        select: { id: true, number: true, title: true }
      }
    }
  })

  return NextResponse.json(comment)
}