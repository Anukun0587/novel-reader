import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // ตรวจสอบว่า Login หรือยัง
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!dbUser) {
    const { currentUser } = await import('@clerk/nextjs/server')
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
        avatar: clerkUser.imageUrl,
      }
    })
  }

  const body = await req.json()
  const { title, description, coverImage, genreIds } = body

  if (!title || !description) {
    return NextResponse.json(
      { error: 'กรุณากรอกชื่อนิยายและเรื่องย่อ' },
      { status: 400 }
    )
  }

  const novel = await prisma.novel.create({
    data: {
      title,
      description,
      coverImage,
      authorId: dbUser.id,
      genres: {
        connect: genreIds?.map((id: string) => ({ id })) || []
      }
    },
    include: {
      author: true,
      genres: true
    }
  })

  return NextResponse.json(novel)
}