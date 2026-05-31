import { useState } from 'react'
import { Search } from 'lucide-react'

export function SearchBar() {
  const [query, setQuery] = useState('')

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search artists..."
        className="w-48 bg-[#282828] text-white text-sm rounded-lg pl-9 pr-3 py-2 border border-[#3a3a3a] focus:outline-none focus:border-[#1DB954] transition-all placeholder-gray-500"
      />
    </div>
  )
}
