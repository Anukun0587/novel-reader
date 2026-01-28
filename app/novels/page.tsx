import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { NovelGrid } from '@/components/novel-grid'
import { EmptyState } from '@/components/empty-state'
import { Search } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ q?: string; genre?: string }>
}

async function getNovels(query?: string, genreId?: string) {
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
  return novels
}

async function getGenres() {
  const genres = await prisma.genre.findMany({
    orderBy: { name: 'asc' }
  })
  return genres
}

export default async function NovelsPage({ searchParams }: PageProps) {
  const { q: query, genre: genreId } = await searchParams
  const [novels, genres] = await Promise.all([
    getNovels(query, genreId),
    getGenres()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {query ? `ผลการค้นหา "${query}"` : 'นิยายทั้งหมด'}
          </h1>
          <p className="text-gray-600">
            {query
              ? `พบ ${novels.length} เรื่อง`
              : 'ค้นพบนิยายที่คุณชื่นชอบ'}
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-6">
          <form
            action="/novels"
            method="GET"
            className="relative max-w-md"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={query || ''}
              placeholder="ค้นหาชื่อนิยายหรือเรื่องย่อ..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {genreId && <input type="hidden" name="genre" value={genreId} />}
          </form>
        </div>

        {/* Genre Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Link
              href={query ? `/novels?q=${encodeURIComponent(query)}` : '/novels'}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                !genreId
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border'
              }`}
            >
              ทั้งหมด
            </Link>
            {genres.map((genre) => {
              const params = new URLSearchParams()
              if (query) params.set('q', query)
              params.set('genre', genre.id)

              return (
                <Link
                  key={genre.id}
                  href={`/novels?${params.toString()}`}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    genreId === genre.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border'
                  }`}
                >
                  {genre.name}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Novel Grid or Empty State */}
        {novels.length > 0 ? (
          <NovelGrid novels={novels} />
        ) : (
          <EmptyState
            title={query ? 'ไม่พบนิยาย' : 'ยังไม่มีนิยาย'}
            description={query ? 'ลองค้นหาด้วยคำอื่น' : 'เริ่มต้นเขียนนิยายเรื่องแรกของคุณ'}
          />
        )}
      </main>
    </div>
  )
}