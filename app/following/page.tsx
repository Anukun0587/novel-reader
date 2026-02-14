import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { Users, BookText, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

async function getFollowing(clerkUserId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId }
  })

  if (!dbUser) return []

  const following = await prisma.follow.findMany({
    where: { followerId: dbUser.id },
    include: {
      following: {
        select: {
          id: true,
          name: true,
          avatar: true,
          _count: { 
            select: { 
              novels: true,
              followers: true 
            } 
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return following
}

export default async function FollowingPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const following = await getFollowing(userId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Users className="h-6 w-6 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">นักเขียนที่ติดตาม</h1>
        </div>

        {following.length > 0 ? (
          <div className="grid gap-4">
            {following.map((follow) => (
              <Link
                key={follow.id}
                href={`/authors/${follow.following.id}`}
                className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                {/* Avatar */}
                {follow.following.avatar ? (
                  <Image
                    src={follow.following.avatar}
                    alt={follow.following.name || 'Author'}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-15 h-15 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-indigo-600" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900 mb-1">
                    {follow.following.name || 'นักเขียน'}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <BookText className="h-4 w-4" />
                      {follow.following._count.novels} นิยาย
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {follow.following._count.followers} ผู้ติดตาม
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">ยังไม่ได้ติดตามใคร</h2>
            <p className="text-gray-500 mb-6">ติดตามนักเขียนที่คุณชื่นชอบเพื่อไม่พลาดผลงานใหม่</p>
            <Link
              href="/novels"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              ค้นหานิยาย
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}