'use client'

import { useState, useRef } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพ')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('ไฟล์ต้องมีขนาดไม่เกิน 5MB')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const authRes = await fetch('/api/imagekit/auth')
      const authParams = await authRes.json()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!)
      formData.append('signature', authParams.signature)
      formData.append('expire', authParams.expire)
      formData.append('token', authParams.token)
      formData.append('fileName', `cover_${Date.now()}`)
      formData.append('folder', '/novel-covers')

      const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        throw new Error('อัพโหลดไม่สำเร็จ')
      }

      const uploadData = await uploadRes.json()
      onChange(uploadData.url)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        id="cover-upload"
      />

      {value ? (
        <div className="relative w-48 aspect-[3/4] rounded-lg overflow-hidden group">
          <Image
            src={value}
            alt="ปกนิยาย"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor="cover-upload"
          className={`flex flex-col items-center justify-center w-48 aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors ${
            isUploading ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">อัพโหลดปก</span>
              <span className="text-xs text-gray-400 mt-1">สูงสุด 5MB</span>
            </>
          )}
        </label>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}