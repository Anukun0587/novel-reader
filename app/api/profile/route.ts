import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
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
  const { name } = body

  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: 'กรุณาใส่ชื่อที่แสดง' },
      { status: 400 }
    )
  }

  const updatedUser = await prisma.user.update({
    where: { id: dbUser.id },
    data: { name: name.trim() }
  })

  return NextResponse.json(updatedUser)
}