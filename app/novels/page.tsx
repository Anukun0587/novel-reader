import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { NovelGrid } from '@/components/novel-grid'
import { EmptyState } from '@/components/empty-state'
import { Search, X } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ q?: string; genre?: string; tag?: string }>
}

async function getNovels(query?: string, genreId?: string, tagName?: string) {
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
        } : {},
        tagName ? {
          tags: {
            some: { name: { equals: tagName, mode: 'insensitive' } }
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
        select: { id: true, name: true }
      },
      tags: {
        select: { id: true, name: true }
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

async function getGenreById(id: string) {
  return await prisma.genre.findUnique({
    where: { id }
  })
}

export default async function NovelsPage({ searchParams }: PageProps) {
  const { q: query, genre: genreId, tag: tagName } = await searchParams
  const [novels, genres, selectedGenre] = await Promise.all([
    getNovels(query, genreId, tagName),
    getGenres(),
    genreId ? getGenreById(genreId) : null
  ])

  let pageTitle = 'นิยายทั้งหมด'
  let pageDescription = 'ค้นพบนิยายที่คุณชื่นชอบ'

  if (query) {
    pageTitle = `ผลการค้นหา "${query}"`
    pageDescription = `พบ ${novels.length} เรื่อง`
  } else if (selectedGenre) {
    pageTitle = `หมวดหมู่: ${selectedGenre.name}`
    pageDescription = `พบ ${novels.length} เรื่อง`
  } else if (tagName) {
    pageTitle = `Tag: #${tagName}`
    pageDescription = `พบ ${novels.length} เรื่อง`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {pageTitle}
          </h1>
          <p className="text-gray-600">{pageDescription}</p>
        </div>

        {/* Active Filters */}
        {(query || genreId || tagName) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-gray-600">กรองโดย:</span>
            
            {query && (
              <Link
                href={genreId ? `/novels?genre=${genreId}` : tagName ? `/novels?tag=${tagName}` : '/novels'}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
              >
                ค้นหา: {query}
                <X className="h-3 w-3" />
              </Link>
            )}

            {selectedGenre && (
              <Link
                href={query ? `/novels?q=${query}` : tagName ? `/novels?tag=${tagName}` : '/novels'}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300"
              >
                {selectedGenre.name}
                <X className="h-3 w-3" />
              </Link>
            )}

            {tagName && (
              <Link
                href={query ? `/novels?q=${query}` : genreId ? `/novels?genre=${genreId}` : '/novels'}
                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200"
              >
                #{tagName}
                <X className="h-3 w-3" />
              </Link>
            )}

            <Link
              href="/novels"
              className="text-red-600 hover:text-red-700 text-sm"
            >
              ล้างทั้งหมด
            </Link>
          </div>
        )}

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
            {tagName && <input type="hidden" name="tag" value={tagName} />}
          </form>
        </div>

        {/* Genre Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Link
              href={query ? `/novels?q=${query}` : tagName ? `/novels?tag=${tagName}` : '/novels'}
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
              if (tagName) params.set('tag', tagName)
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
            title={query || tagName || genreId ? 'ไม่พบนิยาย' : 'ยังไม่มีนิยาย'}
            description={query || tagName || genreId ? 'ลองค้นหาด้วยคำอื่น' : 'เริ่มต้นเขียนนิยายเรื่องแรกของคุณ'}
          />
        )}
      </main>
    </div>
  )
}