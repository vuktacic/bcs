"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import ProvinceDisplay from "./components/ProvinceDisplay";
import Search from "./components/Search";
import type { GeoJsonObject } from "geojson";
import type { SchoolIndex, DistrictIndex, ProvincialData } from "./types";

const Map = dynamic(
  () => import("./components/Map"),
  { ssr: false }
);


export default function Home() {
  const [query, setQuery] = useState("");
  const [geojsonData, setGeojsonData] = useState<GeoJsonObject>(null as any);
  const [schoolIndex, setSchoolIndex] = useState<SchoolIndex[]>(null as any);
  const [districtIndex, setDistrictIndex] = useState<DistrictIndex[]>(null as any);
  const [provinceData, setProvinceData] = useState<ProvincialData>(null as any);
  const [publicData, setPublicData] = useState<ProvincialData>(null as any);
  const [independentData, setIndependentData] = useState<ProvincialData>(null as any);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(true);
  const [globalFilter, setGlobalFilter] = useState<any>({
    public: true,
    independent: true,
    district: true
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const [provinceRes, publicRes, independentRes, schoolIndexRes, districtIndexRes, geojsonRes] = await Promise.all([
        fetch("/province/bc.json"),
        fetch("/province/public.json"),
        fetch("/province/independent.json"),
        fetch("/indexes/schools.json"),
        fetch("/indexes/districts.json"),
        fetch("/districts.geojson")
      ]);

      if (!isMounted) {
        return;
      }

      const schoolIndexData = await schoolIndexRes.json();
      const filtered = schoolIndexData.filter((school: any) => school.AVERAGE !== null && school.LOCATION !== null).map((school: any) => ({
        schoolNumber: school.SCHOOL_NUMBER,
        schoolName: school.SCHOOL_NAME,
        districtNumber: school.DISTRICT_NUMBER,
        districtName: school.DISTRICT_NAME,
        public: school.PUBLIC,
        writers: school.WRITERS,
        average: school.AVERAGE,
        rank: school.RANK,
        location: school.LOCATION
      }));

      const districtIndexData = await districtIndexRes.json();
      const filteredDistricts = districtIndexData.map((district: any) => ({
        districtNumber: district.DISTRICT_NUMBER,
        districtName: district.DISTRICT_NAME,
        public: district.PUBLIC,
        writers: district.WRITERS,
        average: district.AVERAGE,
        rank: district.RANK
      }));

      const provinceData = await provinceRes.json();

      setGeojsonData(await geojsonRes.json());
      setSchoolIndex(filtered);
      setDistrictIndex(filteredDistricts);
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
      <div className="h-full">
        <Map
          geojsonData={geojsonData}
          schoolIndex={schoolIndex}
          districtIndex={districtIndex}
          provinceData={provinceData}
          publicData={publicData}
          independentData={independentData}
          query={query}
          globalFilter={globalFilter}
          onPopupOpen={() => setIsMobileDrawerOpen(false)}
        />
      </div>

      <ProvinceDisplay
        geojsonData={geojsonData}
        schoolIndex={schoolIndex}
        districtIndex={districtIndex}
        provinceData={provinceData}
        publicData={publicData}
        independentData={independentData}
        query={query}
        setQuery={setQuery}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        isMobileDrawerOpen={isMobileDrawerOpen}
        setIsMobileDrawerOpen={setIsMobileDrawerOpen}
      />
    </main>
  );
}
