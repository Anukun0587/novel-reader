import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!dbUser) {
    const { currentUser } = await import('@clerk/nextjs/server')
    const user = await currentUser()

    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: user?.emailAddresses[0]?.emailAddress || '',
        name: user?.firstName || user?.username || 'ไม่ระบุชื่อ',
        avatar: user?.imageUrl,
      }
    })
  }

  const body = await req.json()
  const { title, description, coverImage, genreIds, tags } = body

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
      ...(genreIds?.length > 0 && {
        genres: {
          connect: genreIds.map((id: string) => ({ id }))
        }
      }),
      ...(tags?.length > 0 && {
        tags: {
          create: tags.map((name: string) => ({ name }))
        }
      })
    },
    include: {
      genres: true,
      tags: true
    }
  })

  return NextResponse.json(novel)
}