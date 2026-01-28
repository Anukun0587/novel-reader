import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// ดึงตอนล่าสุดที่อ่านของนิยาย
export async function GET(
  req: Request,
  { params }: { params: Promise<{ novelId: string }> }
) {
  const { userId } = await auth()
  const { novelId } = await params

  if (!userId) {
    return NextResponse.json({ lastChapter: null })
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!dbUser) {
    return NextResponse.json({ lastChapter: null })
  }

  // หาตอนล่าสุดที่อ่านของนิยายนี้
  const lastRead = await prisma.readingHistory.findFirst({
    where: {
      userId: dbUser.id,
      chapter: {
        novelId: novelId
      }
    },
    include: {
      chapter: {
        select: {
          id: true,
          number: true,
          title: true
        }
      }
    },
    orderBy: { readAt: 'desc' }
  })

  return NextResponse.json({
    lastChapter: lastRead?.chapter || null
  })
}