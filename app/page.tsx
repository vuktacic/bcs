"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import ProvincePopup from "./components/ProvincePopup";
import Search from "./components/Search";

const Map = dynamic(
  () => import("./components/Map"),
  { ssr: false }
);

export default function Home() {
  const [query, setQuery] = useState("");

  return (
    <main className="relative h-screen w-screen">
      <ProvincePopup />
      <Map query={query} />
      <Search query={query} setQuery={setQuery} />
    </main>
  );
}
