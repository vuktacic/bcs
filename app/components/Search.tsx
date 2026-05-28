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
    <div>
      <input
        type="text"
        placeholder="Search for a school..."
        className="z-1001 w-full rounded-t-2xl md:rounded-full px-4 py-3 md:shadow-lg md:border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  )
}