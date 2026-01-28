import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { BookOpen, User, Calendar, ChevronRight, Edit } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ContinueReadingButton } from '@/components/continue-reading-button'
import { BookmarkButton } from '@/components/bookmark-button'

async function getNovel(id: string) {
    const novel = await prisma.novel.findUnique({
        where: { id },
        include: {
            author: {
                select: { id: true, name: true, avatar: true }
            },
            genres: true,
            chapters: {
                where: { isPublished: true },
                orderBy: { number: 'asc' },
                select: {
                    id: true,
                    number: true,
                    title: true,
                    createdAt: true,
                }
            },
            _count: {
                select: { chapters: true }
            }
        }
    })
    return novel
}

export default async function NovelDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const novel = await getNovel(id)

    if (!novel) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Novel Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Cover Image */}
                        <div className="w-48 flex-shrink-0 mx-auto md:mx-0">
                            <div className="relative aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
                                {novel.coverImage ? (
                                    <Image
                                        src={novel.coverImage}
                                        alt={novel.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <BookOpen className="h-16 w-16 text-gray-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Novel Info */}
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                                {novel.title}
                            </h1>

                            {/* Author */}
                            <div className="flex items-center gap-2 text-gray-600 mb-4">
                                <User className="h-4 w-4" />
                                <span>{novel.author?.name || 'ไม่ระบุชื่อ'}</span>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                                <span>{novel._count.chapters} ตอน</span>
                                <span>•</span>
                                <span className={`px-2 py-0.5 rounded ${novel.status === 'COMPLETED'
                                    ? 'bg-green-100 text-green-800'
                                    : novel.status === 'ONGOING'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {novel.status === 'COMPLETED' ? 'จบแล้ว' : novel.status === 'ONGOING' ? 'กำลังเขียน' : 'พักเขียน'}
                                </span>
                            </div>

                            {/* Genres */}
                            {novel.genres.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {novel.genres.map((genre) => (
                                        <span
                                            key={genre.id}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Description */}
                            <p className="text-gray-700 whitespace-pre-line mb-6">
                                {novel.description}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <ContinueReadingButton
                                    novelId={novel.id}
                                    firstChapterId={novel.chapters[0]?.id}
                                />
                                <BookmarkButton novelId={novel.id} />

                                <Link
                                    href={`/novels/${novel.id}/write`}
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                >
                                    เขียนตอนใหม่
                                </Link>
                                <Link
                                    href={`/novels/${novel.id}/edit`}
                                    className="flex items-center gap-2 px-6 py-3 border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50"
                                >
                                    <Edit className="h-5 w-5" />
                                    แก้ไขนิยาย
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chapter List */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        รายการตอน ({novel.chapters.length} ตอน)
                    </h2>

                    {novel.chapters.length > 0 ? (
                        <div className="divide-y">
                            {novel.chapters.map((chapter) => (
                                <Link
                                    key={chapter.id}
                                    href={`/novels/${novel.id}/chapters/${chapter.id}`}
                                    className="flex items-center justify-between py-4 hover:bg-gray-50 -mx-6 px-6 transition-colors"
                                >
                                    <div>
                                        <span className="font-medium text-gray-900">
                                            ตอนที่ {chapter.number}: {chapter.title}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {new Date(chapter.createdAt).toLocaleDateString('th-TH', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                        <ChevronRight className="h-4 w-4" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>ยังไม่มีตอน</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}