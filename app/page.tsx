import { SignUpButton, SignedOut } from '@clerk/nextjs'
import { Navbar } from '../components/navbar'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

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

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">นิยายหลากหลาย</h3>
            <p className="text-gray-600">
              นิยายหลายแนว ทั้งแฟนตาซี โรแมนติก แอ็คชั่น และอีกมากมาย
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✍️</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">เขียนนิยายของคุณ</h3>
            <p className="text-gray-600">
              สร้างสรรค์ผลงานและแบ่งปันให้ผู้อ่านทั่วโลก
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🆓</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">ฟรีตลอดชีพ</h3>
            <p className="text-gray-600">
              อ่านและเขียนได้ฟรี ไม่มีค่าใช้จ่าย
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}