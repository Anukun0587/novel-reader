import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// แก้ไขนิยาย
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
    return NextResponse.json({ error: 'ไม่มีสิทธิ์แก้ไขนิยายนี้' }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, status, coverImage, genreIds } = body

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
          connect: genreIds.map((gId: string) => ({ id: gId }))
        }
      })
    },
    include: {
      genres: true
    }
  })

  return NextResponse.json(updatedNovel)
}

// ลบนิยาย
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
    return NextResponse.json({ error: 'ไม่มีสิทธิ์ลบนิยายนี้' }, { status: 403 })
  }

  await prisma.novel.delete({
    where: { id }
  })

  return NextResponse.json({ message: 'ลบนิยายสำเร็จ' })
}