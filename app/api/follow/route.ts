import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// ดึงรายชื่อที่ติดตาม
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

  const following = await prisma.follow.findMany({
    where: { followerId: dbUser.id },
    include: {
      following: {
        select: {
          id: true,
          name: true,
          avatar: true,
          _count: { select: { novels: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(following)
}

// ติดตาม
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
  const { authorId } = body

  if (!authorId) {
    return NextResponse.json({ error: 'Author ID is required' }, { status: 400 })
  }

  if (authorId === dbUser.id) {
    return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
  }

  const author = await prisma.user.findUnique({
    where: { id: authorId }
  })

  if (!author) {
    return NextResponse.json({ error: 'Author not found' }, { status: 404 })
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: dbUser.id,
        followingId: authorId
      }
    }
  })

  if (existingFollow) {
    return NextResponse.json({ error: 'Already following' }, { status: 400 })
  }

  const follow = await prisma.follow.create({
    data: {
      followerId: dbUser.id,
      followingId: authorId
    }
  })

  return NextResponse.json(follow)
}