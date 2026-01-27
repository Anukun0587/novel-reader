import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { NovelForm } from '@/components/novel-form'

async function getGenres() {
  const genres = await prisma.genre.findMany({
    orderBy: { name: 'asc' }
  })
  return genres
}

export default async function WritePage() {
  // ตรวจสอบว่า Login หรือยัง
  const { userId } = await auth()

  // ถ้าไม่ได้ Login ให้ไปหน้า sign-in
  if (!userId) {
    redirect('/sign-in')
  }

  // ดึงหมวดหมู่ทั้งหมด
  const genres = await getGenres()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">สร้างนิยายใหม่</h1>
          <p className="text-gray-600">เริ่มต้นเขียนนิยายของคุณ</p>
        </div>

        {/* Form */}
        <NovelForm genres={genres} />
      </main>
    </div>
  )
}