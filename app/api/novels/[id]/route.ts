import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  const { id } = await params

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
    where: { id }
  })

  if (!novel) {
    return NextResponse.json({ error: 'Novel not found' }, { status: 404 })
  }

  if (novel.authorId !== dbUser.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, status, coverImage, genreIds, tags } = body

  const updatedNovel = await prisma.novel.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(status && { status }),
      ...(coverImage !== undefined && { coverImage }),
      ...(genreIds && {
        genres: {
          set: [],
          connect: genreIds.map((gid: string) => ({ id: gid }))
        }
      }),
      ...(tags !== undefined && {
        tags: {
          deleteMany: {},
          create: tags.map((name: string) => ({ name }))
        }
      })
    },
    include: {
      genres: true,
      tags: true
    }
  })

  return NextResponse.json(updatedNovel)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  const { id } = await params

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
    where: { id }
  })

  if (!novel) {
    return NextResponse.json({ error: 'Novel not found' }, { status: 404 })
  }

  if (novel.authorId !== dbUser.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  await prisma.novel.delete({
    where: { id }
  })

  return NextResponse.json({ message: 'Novel deleted' })
}