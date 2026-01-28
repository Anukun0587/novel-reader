import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// ดึงประวัติการอ่านทั้งหมด
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

  // ดึงประวัติการอ่าน กรุ๊ปตามนิยาย (เอาตอนล่าสุดที่อ่าน)
  const history = await prisma.readingHistory.findMany({
    where: { userId: dbUser.id },
    include: {
      chapter: {
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
        }
      }
    },
    orderBy: { readAt: 'desc' }
  })

  // กรุ๊ปตามนิยาย เอาแค่ตอนล่าสุด
  const novelMap = new Map()
  for (const item of history) {
    const novelId = item.chapter.novelId
    if (!novelMap.has(novelId)) {
      novelMap.set(novelId, {
        novel: item.chapter.novel,
        lastChapter: item.chapter,
        readAt: item.readAt
      })
    }
  }

  return NextResponse.json(Array.from(novelMap.values()))
}

// บันทึกประวัติการอ่าน
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
  const { chapterId } = body

  if (!chapterId) {
    return NextResponse.json({ error: 'Chapter ID is required' }, { status: 400 })
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId }
  })

  if (!chapter) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
  }

  // บันทึกหรืออัพเดทประวัติการอ่าน
  const history = await prisma.readingHistory.upsert({
    where: {
      userId_chapterId: {
        userId: dbUser.id,
        chapterId
      }
    },
    update: {
      readAt: new Date()
    },
    create: {
      userId: dbUser.id,
      chapterId
    }
  })

  return NextResponse.json(history)
}