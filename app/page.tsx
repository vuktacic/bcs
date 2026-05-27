"use client";

import MVP from "./components/MVP";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import ProvincePopup from "./components/ProvincePopup";
import Search from "./components/Search";

const Map = dynamic(
  () => import("./components/Map"),
  { ssr: false }
);


export default function Home() {
  const [query, setQuery] = useState("");
  const [geojsonData, setGeojsonData] = useState<any | null>(null);
  const [schoolIndex, setSchoolIndex] = useState<any[] | null>(null);
  const [districtIndex, setDistrictIndex] = useState<any[] | null>(null);
  const [provinceData, setProvinceData] = useState<any | null>(null);
  const [publicData, setPublicData] = useState<any | null>(null);
  const [independentData, setIndependentData] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const [geojsonRes, schoolIndexRes, districtIndexRes, provinceRes, publicRes, independentRes] = await Promise.all([
        fetch("/districts.geojson"),
        fetch("/indexes/schools.json"),
        fetch("/indexes/districts.json"),
        fetch("/province/bc.json"),
        fetch("/province/public.json"),
        fetch("/province/independent.json")
      ]);

      if (!isMounted) {
        return;
      }

      setGeojsonData(await geojsonRes.json());
      setSchoolIndex(await schoolIndexRes.json());
      setDistrictIndex(await districtIndexRes.json());
      setProvinceData(await provinceRes.json());
      setPublicData(await publicRes.json());
      setIndependentData(await independentRes.json());
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="relative h-screen w-screen">
      <ProvincePopup geojsonData={geojsonData} schoolIndex={schoolIndex} districtIndex={districtIndex} provinceData={provinceData} publicData={publicData} independentData={independentData} />
      <Map query={query} geojsonData={geojsonData} schoolIndex={schoolIndex} districtIndex={districtIndex} provinceData={provinceData} publicData={publicData} independentData={independentData} />
      <Search query={query} setQuery={setQuery} />
      <MVP />
    </main>
  );
}
