import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// ตรวจสอบสถานะบุ๊คมาร์ค
export async function GET(
  req: Request,
  { params }: { params: Promise<{ novelId: string }> }
) {
  const { userId } = await auth()
  const { novelId } = await params

  if (!userId) {
    return NextResponse.json({ isBookmarked: false })
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!dbUser) {
    return NextResponse.json({ isBookmarked: false })
  }

  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_novelId: {
        userId: dbUser.id,
        novelId
      }
    }
  })

  return NextResponse.json({ isBookmarked: !!bookmark })
}

// ลบบุ๊คมาร์ค
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ novelId: string }> }
) {
  const { userId } = await auth()
  const { novelId } = await params

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // ลบบุ๊คมาร์ค
  await prisma.bookmark.deleteMany({
    where: {
      userId: dbUser.id,
      novelId
    }
  })

  return NextResponse.json({ message: 'Bookmark removed' })
}