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
    <div className="w-full px-4 mt-3 md:absolute md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:w-[30vw] md:max-w-xl md:mt-0 z-1000">
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