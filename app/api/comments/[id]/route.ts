import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// ลบความคิดเห็น
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

  const comment = await prisma.comment.findUnique({
    where: { id }
  })

  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  }

  if (comment.userId !== dbUser.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  await prisma.comment.delete({
    where: { id }
  })

  return NextResponse.json({ message: 'Comment deleted' })
}