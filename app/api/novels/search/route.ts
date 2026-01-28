import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''
  const genreId = searchParams.get('genre') || ''

  const novels = await prisma.novel.findMany({
    where: {
      AND: [
        query ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ]
        } : {},
        genreId ? {
          genres: {
            some: { id: genreId }
          }
        } : {}
      ]
    },
    orderBy: { createdAt: 'desc' },
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
  })

  return NextResponse.json(novels)
}