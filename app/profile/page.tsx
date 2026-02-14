import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { ProfileForm } from '@/components/profile-form'

async function getUser(clerkId: string) {
  return await prisma.user.findUnique({
    where: { clerkId },
    include: {
      _count: {
        select: { novels: true }
      }
    }
  })
}

export default async function ProfilePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const user = await getUser(userId)

  if (!user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">แก้ไขโปรไฟล์</h1>
        <ProfileForm user={user} />
      </main>
    </div>
  )
}