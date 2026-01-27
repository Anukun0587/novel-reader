'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'

interface Genre {
  id: string
  name: string
}

interface Novel {
  id: string
  title: string
  description: string
  status: string
  genres: Genre[]
}

interface EditNovelFormProps {
  novel: Novel
  genres: Genre[]
}

export function EditNovelForm({ novel, genres }: EditNovelFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [title, setTitle] = useState(novel.title)
  const [description, setDescription] = useState(novel.description)
  const [status, setStatus] = useState(novel.status)
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    novel.genres.map((g) => g.id)
  )

  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/novels/${novel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          status,
          genreIds: selectedGenres,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'เกิดข้อผิดพลาด')
      }

      router.push(`/novels/${novel.id}`)
      router.refresh()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/novels/${novel.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'เกิดข้อผิดพลาด')
      }

      router.push('/novels')
      router.refresh()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* ชื่อนิยาย */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          ชื่อนิยาย <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* เรื่องย่อ */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          เรื่องย่อ <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      {/* สถานะ */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          สถานะ
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="ONGOING">กำลังเขียน</option>
          <option value="COMPLETED">จบแล้ว</option>
          <option value="HIATUS">พักเขียน</option>
        </select>
      </div>

      {/* หมวดหมู่ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          หมวดหมู่
        </label>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              onClick={() => toggleGenre(genre.id)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedGenres.includes(genre.id)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* ปุ่ม */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
          {isLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
        </button>

        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <Trash2 className="h-5 w-5" />
          ลบ
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการลบ</h3>
            <p className="text-gray-600 mb-6">
              {`คุณต้องการลบนิยาย "${novel.title}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้ ตอนทั้งหมดจะถูกลบด้วย`}
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isDeleting ? 'กำลังลบ...' : 'ลบนิยาย'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}