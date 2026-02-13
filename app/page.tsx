import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { NovelCard } from '@/components/novel-card'
import { BookOpen, TrendingUp, Grid3X3, Sparkles } from 'lucide-react'
import Link from 'next/link'

// ดึงนิยายมาใหม่
async function getLatestNovels() {
  return await prisma.novel.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true } },
      genres: { select: { id: true, name: true } },
      tags: { select: { id: true, name: true } },
      _count: { select: { chapters: true } }
    }
  })
}

// ดึงนิยายยอดนิยม (มีตอนเยอะที่สุด)
async function getPopularNovels() {
  return await prisma.novel.findMany({
    take: 10,
    orderBy: {
      chapters: { _count: 'desc' }
    },
    include: {
      author: { select: { name: true } },
      genres: { select: { id: true, name: true } },
      tags: { select: { id: true, name: true } },
      _count: { select: { chapters: true } }
    }
  })
}

// ดึงหมวดหมู่ทั้งหมด
async function getGenres() {
  return await prisma.genre.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { novels: true } }
    }
  })
}

export default async function HomePage() {
  const [latestNovels, popularNovels, genres] = await Promise.all([
    getLatestNovels(),
    getPopularNovels(),
    getGenres()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ยินดีต้อนรับสู่ NovelTH
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              แหล่งรวมนิยายออนไลน์ภาษาไทย
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/novels"
                className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                เริ่มอ่านนิยาย
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* นิยายมาใหม่ */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">นิยายมาใหม่</h2>
            </div>
            <Link
              href="/novels"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          {latestNovels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {latestNovels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">ยังไม่มีนิยาย</p>
            </div>
          )}
        </section>

        {/* นิยายยอดนิยม */}
        {popularNovels.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">นิยายยอดนิยม</h2>
              </div>
              <Link
                href="/novels"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                ดูทั้งหมด →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {popularNovels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          </section>
        )}

        {/* หมวดหมู่ */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Grid3X3 className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">หมวดหมู่ทั้งหมด</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {genres.map((genre) => (
              <Link
                key={genre.id}
                href={`/novels?genre=${genre.id}`}
                className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-shadow border hover:border-indigo-300"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{genre.name}</h3>
                <p className="text-sm text-gray-500">{genre._count.novels} เรื่อง</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <BookOpen className="h-6 w-6 text-indigo-500" />
              <span className="text-white font-bold text-lg">NovelTH</span>
            </div>
            <p className="text-sm">
              © 2024 NovelTH. นักอ่านและนักเขียนชาวไทย
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}