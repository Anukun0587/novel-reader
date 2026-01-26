import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { NovelGrid } from '@/components/novel-grid'
import { GenreFilter } from '@/components/genre-filter'
import { EmptyState } from '@/components/empty-state'

async function getNovels() {
  const novels = await prisma.novel.findMany({
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

export default async function NovelsPage() {
  const [novels, genres] = await Promise.all([getNovels(), getGenres()])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">นิยายทั้งหมด</h1>
          <p className="text-gray-600">ค้นพบนิยายที่คุณชื่นชอบ</p>
        </div>

        {/* Genre Filter */}
        <div className="mb-8">
          <GenreFilter genres={genres} />
        </div>

        {/* Novel Grid or Empty State */}
        {novels.length > 0 ? (
          <NovelGrid novels={novels} />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  )
}