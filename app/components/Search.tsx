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

export default function Search({ query, setQuery }: { query: string; setQuery: (query: string) => void }) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-1000">
      <input
        type="text"
        placeholder="Search for a school..."
        className="w-full rounded-full px-4 py-3 shadow-lg border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  )
}