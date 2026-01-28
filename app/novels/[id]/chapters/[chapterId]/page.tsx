import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { ChevronLeft, ChevronRight, BookOpen, Home, Edit } from 'lucide-react'
import Link from 'next/link'
import { ReadingTracker } from '@/components/reading-tracker'

async function getChapter(novelId: string, chapterId: string) {
    const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
            novel: {
                select: { id: true, title: true }
            }
        }
    })

    if (!chapter || chapter.novelId !== novelId) {
        return null
    }

    const [prevChapter, nextChapter] = await Promise.all([
        prisma.chapter.findFirst({
            where: {
                novelId,
                number: { lt: chapter.number },
                isPublished: true
            },
            orderBy: { number: 'desc' },
            select: { id: true, number: true, title: true }
        }),
        prisma.chapter.findFirst({
            where: {
                novelId,
                number: { gt: chapter.number },
                isPublished: true
            },
            orderBy: { number: 'asc' },
            select: { id: true, number: true, title: true }
        })
    ])

    return { chapter, prevChapter, nextChapter }
}

export default async function ReadChapterPage({
    params
}: {
    params: Promise<{ id: string; chapterId: string }>
}) {
    const { id: novelId, chapterId } = await params
    const data = await getChapter(novelId, chapterId)

    if (!data) {
        notFound()
    }

    const { chapter, prevChapter, nextChapter } = data

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <ReadingTracker chapterId={chapterId} />

            {/* Chapter Navigation Top */}
            <div className="bg-white border-b sticky top-16 z-40">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Link
                            href={`/novels/${novelId}`}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <Home className="h-4 w-4" />
                            <span className="hidden sm:inline">{chapter.novel.title}</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            {prevChapter ? (
                                <Link
                                    href={`/novels/${novelId}/chapters/${prevChapter.id}`}
                                    className="p-2 rounded-lg hover:bg-gray-100"
                                    title={`ตอนที่ ${prevChapter.number}`}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Link>
                            ) : (
                                <span className="p-2 text-gray-300">
                                    <ChevronLeft className="h-5 w-5" />
                                </span>
                            )}

                            <span className="text-sm text-gray-600">
                                ตอนที่ {chapter.number}
                            </span>

                            {nextChapter ? (
                                <Link
                                    href={`/novels/${novelId}/chapters/${nextChapter.id}`}
                                    className="p-2 rounded-lg hover:bg-gray-100"
                                    title={`ตอนที่ ${nextChapter.number}`}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Link>
                            ) : (
                                <span className="p-2 text-gray-300">
                                    <ChevronRight className="h-5 w-5" />
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chapter Content */}
            <main className="max-w-3xl mx-auto px-4 py-8">
                <article className="bg-white rounded-xl shadow-sm p-6 md:p-10">
                    {/* Chapter Title */}
                    <header className="mb-8 text-center">
                        <p className="text-gray-500 mb-2">ตอนที่ {chapter.number}</p>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            {chapter.title}
                        </h1>
                        <p className="text-sm text-gray-500 mt-3">
                            {chapter.wordCount} คำ
                        </p>
                        <Link
                            href={`/novels/${novelId}/chapters/${chapterId}/edit`}
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50"
                        >
                            <Edit className="h-4 w-4" />
                            แก้ไขตอน
                        </Link>
                    </header>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none">
                        {chapter.content.split('\n').map((paragraph, index) => (
                            paragraph.trim() ? (
                                <p
                                    key={index}
                                    className="text-gray-800 text-lg leading-loose text-justify indent-8 mb-0"
                                >
                                    {paragraph}
                                </p>
                            ) : (
                                <div key={index} className="h-6" />
                            )
                        ))}
                    </div>
                </article>

                {/* Bottom Navigation */}
                <div className="mt-8 flex justify-between items-center">
                    {prevChapter ? (
                        <Link
                            href={`/novels/${novelId}/chapters/${prevChapter.id}`}
                            className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <ChevronLeft className="h-5 w-5" />
                            <div className="text-left">
                                <p className="text-xs text-gray-500">ตอนก่อนหน้า</p>
                                <p className="font-medium text-gray-900">ตอนที่ {prevChapter.number}</p>
                            </div>
                        </Link>
                    ) : (
                        <div />
                    )}

                    {nextChapter ? (
                        <Link
                            href={`/novels/${novelId}/chapters/${nextChapter.id}`}
                            className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="text-right">
                                <p className="text-xs text-gray-500">ตอนถัดไป</p>
                                <p className="font-medium text-gray-900">ตอนที่ {nextChapter.number}</p>
                            </div>
                            <ChevronRight className="h-5 w-5" />
                        </Link>
                    ) : (
                        <Link
                            href={`/novels/${novelId}`}
                            className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            <BookOpen className="h-5 w-5" />
                            <span>กลับหน้านิยาย</span>
                        </Link>
                    )}
                </div>
            </main>
        </div>
    )
}