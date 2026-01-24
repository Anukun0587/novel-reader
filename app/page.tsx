import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { BookOpen, PenTool } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-indigo-600">NovelTH</span>
            </Link>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              {/* แสดงเมื่อยังไม่ได้ Login */}
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
                    เข้าสู่ระบบ
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    สมัครสมาชิก
                  </button>
                </SignUpButton>
              </SignedOut>

              {/* แสดงเมื่อ Login แล้ว */}
              <SignedIn>
                <Link
                  href="/write"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <PenTool className="h-4 w-4" />
                  เขียนนิยาย
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            ยินดีต้อนรับสู่ <span className="text-indigo-600">NovelTH</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            แพลตฟอร์มอ่านและเขียนนิยายออนไลน์
          </p>

          {/* CTA Buttons */}
          <div className="flex justify-center gap-4">
            <Link
              href="/novels"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-lg font-medium"
            >
              เริ่มอ่านนิยาย
            </Link>
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 text-lg font-medium">
                  สมัครสมาชิกฟรี
                </button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>
      </main>
    </div>
  )
}