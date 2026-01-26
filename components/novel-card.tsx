import { BookOpen, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface NovelCardProps {
    novel: {
        id: string;
        title: string;
        coverImage: string | null;
        status: string;
        author: {
            name: string | null;
        } | null;
        genres: {
            name: string;
        }[]
        _count: {
            chapters: number;
        }
    }
}

export function NovelCard({ novel }: NovelCardProps) {
    return (
        <Link href={`/novels/${novel.id}`}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-md transition-shadow">
                {/* Cover Image */}
                <div className="relative aspect-[3/4] bg-gray-200">
                    {novel.coverImage ? (
                        <Image
                            src={novel.coverImage}
                            alt={novel.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <BookOpen className="h-12 w-12 text-gray-400" />
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${novel.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : novel.status === 'ONGOING'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {novel.status === 'COMPLETED' ? 'จบแล้ว' : novel.status === 'ONGOING' ? 'กำลังเขียน' : 'พักเขียน'}
                        </span>
                    </div>
                </div>

                {/* Info */}
                <div className="p-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-1">
                        {novel.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <User className="h-3 w-3" />
                        <span>{novel.author?.name || 'ไม่ระบุชื่อ'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{novel._count.chapters} ตอน</span>
                        {novel.genres[0] && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded">
                                {novel.genres[0].name}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}