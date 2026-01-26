import { NovelCard } from './novel-card'

interface Novel {
  id: string
  title: string
  coverImage: string | null
  status: string
  author: {
    name: string | null
  } | null
  genres: {
    name: string
  }[]
  _count: {
    chapters: number
  }
}

interface NovelGridProps {
  novels: Novel[]
}

export function NovelGrid({ novels }: NovelGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {novels.map((novel) => (
        <NovelCard key={novel.id} novel={novel} />
      ))}
    </div>
  )
}