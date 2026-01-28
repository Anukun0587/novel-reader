import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
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

  return NextResponse.json(bookmarks)
}

// เพิ่มบุ๊คมาร์ค
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
  const { novelId } = body

  if (!novelId) {
    return NextResponse.json({ error: 'Novel ID is required' }, { status: 400 })
  }

  const novel = await prisma.novel.findUnique({
    where: { id: novelId }
  })

  if (!novel) {
    return NextResponse.json({ error: 'Novel not found' }, { status: 404 })
  }

  const existingBookmark = await prisma.bookmark.findUnique({
    where: {
      userId_novelId: {
        userId: dbUser.id,
        novelId
      }
    }
  })

  if (existingBookmark) {
    return NextResponse.json({ error: 'Already bookmarked' }, { status: 400 })
  }

  const bookmark = await prisma.bookmark.create({
    data: {
      userId: dbUser.id,
      novelId
    }
  })

  return NextResponse.json(bookmark)
}