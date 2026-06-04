"use client";

import type { SearchProps } from "../types";

export default function Search(props: SearchProps) {
  const { query, setQuery, onFocus } = props;

  return (
    <div>
      <input
        type="text"
        placeholder="Search for a school..."
        className="z-1001 w-full h-10 rounded-t-3xl md:rounded-full px-6 py-6 md:shadow-lg md:border md:border-background-light bg-background focus:outline-none text-foreground"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={onFocus} />
    </div>
  )
}