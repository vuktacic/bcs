"use client";

import { useEffect, useState } from "react";

type SchoolIndex = {
  SCHOOL_NUMBER: string;
  SCHOOL_NAME: string;
  DISTRICT_NUMBER: string;
  DISTRICT_NAME: string;

  LOCATION: {
    lat: string;
    lng: string;
  }
}

export default function Search({ query, setQuery, onFocus }: { query: string; setQuery: (query: string) => void; onFocus?: () => void }) {
  return (
    <div>
      <input
        type="text"
        placeholder="Search for a school..."
        className="z-1001 w-full h-10 rounded-t-3xl md:rounded-full px-6 py-6 md:shadow-lg md:border bg-white focus:outline-none text-black"
        value={query}
        onChange={(e) => setQuery(e.target.value)}        onFocus={onFocus}      />
    </div>
  )
}