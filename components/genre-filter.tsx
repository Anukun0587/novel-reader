'use client'

interface Genre {
  id: string
  name: string
}

interface GenreFilterProps {
  genres: Genre[]
  selectedGenre?: string
  onSelect?: (genreId: string | null) => void
}

export function GenreFilter({ genres, selectedGenre, onSelect }: GenreFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect?.(null)}
        className={`px-4 py-2 rounded-full text-sm transition-colors ${
          !selectedGenre
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100 border'
        }`}
      >
        ทั้งหมด
      </button>
      {genres.map((genre) => (
        <button
          key={genre.id}
          onClick={() => onSelect?.(genre.id)}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            selectedGenre === genre.id
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          {genre.name}
        </button>
      ))}
    </div>
  )
}