"use client";

import Demo from "./components/Demo";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import ProvinceDisplay from "./components/ProvinceDisplay";
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

      // filter out schools with null averages
      const schoolIndexData = await schoolIndexRes.json();
      const filtered = schoolIndexData.filter((school: any) => school.AVERAGE !== null);

      setGeojsonData(await geojsonRes.json());
      setSchoolIndex(filtered);
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
    <main className="relative h-svh w-screen flex flex-col md:block md:h-screen md:w-screen">
      <div className="h-[60svh] md:h-full">
        <Map query={query} geojsonData={geojsonData} schoolIndex={schoolIndex} districtIndex={districtIndex} provinceData={provinceData} publicData={publicData} independentData={independentData} />
      </div>
      <ProvinceDisplay geojsonData={geojsonData} schoolIndex={schoolIndex} districtIndex={districtIndex} provinceData={provinceData} publicData={publicData} independentData={independentData} query={query} setQuery={setQuery} />
      <Demo />
    </main>
  );
}
