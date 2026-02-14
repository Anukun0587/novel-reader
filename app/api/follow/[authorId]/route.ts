import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// ตรวจสอบสถานะการติดตาม
export async function GET(
  req: Request,
  { params }: { params: Promise<{ authorId: string }> }
) {
  const { userId } = await auth()
  const { authorId } = await params

  if (!userId) {
    return NextResponse.json({ isFollowing: false })
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!dbUser) {
    return NextResponse.json({ isFollowing: false })
  }

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: dbUser.id,
        followingId: authorId
      }
    }
  })

  return NextResponse.json({ isFollowing: !!follow })
}

// ยกเลิกติดตาม
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ authorId: string }> }
) {
  const { userId } = await auth()
  const { authorId } = await params

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  await prisma.follow.deleteMany({
    where: {
      followerId: dbUser.id,
      followingId: authorId
    }
  })

  return NextResponse.json({ message: 'Unfollowed' })
}