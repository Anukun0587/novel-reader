'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, User, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ProfileFormProps {
  user: {
    id: string
    name: string | null
    email: string
    avatar: string | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [name, setName] = useState(user.name || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'เกิดข้อผิดพลาด')
      }

      setSuccess('บันทึกเรียบร้อยแล้ว')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">รูปโปรไฟล์</h2>
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name || 'User'}
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-indigo-600" />
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">
              รูปโปรไฟล์จะใช้จากบัญชีที่ลงทะเบียน (Google/Email)
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">ข้อมูลส่วนตัว</h2>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
            {success}
          </div>
        )}

        {/* Email (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            อีเมล
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
          />
          <p className="text-xs text-gray-400 mt-1">ไม่สามารถเปลี่ยนอีเมลได้</p>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            ชื่อที่แสดง <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="ใส่ชื่อที่ต้องการแสดง"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>

          <Link
            href={`/authors/${user.id}`}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Eye className="h-5 w-5" />
            ดูหน้าโปรไฟล์
          </Link>
        </div>
      </form>
    </div>
  )
}