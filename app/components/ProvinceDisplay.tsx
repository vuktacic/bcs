"use client";

import { useState } from "react";
import RankingList from "./RankingList";
import Search from "./Search";

const na10 = "Numeracy Assessment 10";
const la10 = "Literacy Assessment 10";
const la12 = "Literacy Assessment 12";
const currentYear = "2024/2025";

export default function ProvinceDisplay({ geojsonData, schoolIndex, districtIndex, provinceData, publicData, independentData, query, setQuery }: { geojsonData: any | null; schoolIndex: any[] | null; districtIndex: any[] | null; provinceData: any | null; publicData: any | null; independentData: any | null; query: string; setQuery: (query: string) => void }) {
  const [list, setList] = useState<"all" | "public" | "independent" | "districts">("all");

  const titleMap: { [key in typeof list]: string } = {
    all: "All",
    public: "Public",
    independent: "Independent",
    districts: "Districts"
  };

  function rank(index: any, isSchool: boolean) {
    return index?.filter((object: any) => object.AVERAGE !== 0)
      .sort((a: any, b: any) => b.avg - a.avg)
      .map((object: any) => ({
        // conditional based on whether its a school or not
        schoolname: isSchool ? object.SCHOOL_NAME : object.DISTRICT_NAME,
        schoolnumber: isSchool ? object.SCHOOL_NUMBER : object.DISTRICT_NUMBER,
        avg: object.AVERAGE,
        writers: object.WRITERS,
        isPublic: isSchool ? object.PUBLIC : null
      }))
  };

  const dataMap: { [key in typeof list]: any[] | null } = {
    all: rank(schoolIndex, true),
    public: rank(schoolIndex?.filter((school) => school.PUBLIC === true), true),
    independent: rank(schoolIndex?.filter((school) => school.PUBLIC !== true), true),
    districts: rank(districtIndex, false)
  };

  return (

    <div className="fixed inset-x-0 bottom-0 z-1000 md:contents">
      <div>
        <div className="bg-white rounded-t-2xl shadow-lg h-[50svh] overflow-hidden min-h-0 md:bg-transparent md:shadow-none md:max-h-none md:rounded-none text-black text-sm flex flex-col">
          <div className="w-full md:absolute md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:w-[22vw] md:max-w-xl md:mt-0 z-1000">
            <Search query={query} setQuery={setQuery} />
          </div>

          <div className="px-3 py-2 md:absolute md:top-4 md:left-4 md:shadow md:rounded md:bg-white z-1000 text-2xs md:text-sm flex md:block justify-center text-center md:text-left">
            <div className="flex-1 min-w-0">
              <div className="font-semibold">Provincial Average</div>

              <div className="mt-2 space-y-1">
                <div>Numeracy 10: {provinceData?.assessments?.[na10]?.[currentYear]?.AVERAGE}%</div>
                <div>Literacy 10: {provinceData?.assessments?.[la10]?.[currentYear]?.AVERAGE}%</div>
                <div>Literacy 12: {provinceData?.assessments?.[la12]?.[currentYear]?.AVERAGE}%</div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-semibold md:pt-3">Public Average</div>

              <div className="mt-2 space-y-1">
                <div>Numeracy 10: {publicData?.assessments?.[na10]?.[currentYear]?.AVERAGE}%</div>
                <div>Literacy 10: {publicData?.assessments?.[la10]?.[currentYear]?.AVERAGE}%</div>
                <div>Literacy 12: {publicData?.assessments?.[la12]?.[currentYear]?.AVERAGE}%</div>
              </div>

            </div>

            <div className="flex-1 min-w-0">
              <div className="font-semibold md:pt-3">Independent Average</div>

              <div className="mt-2 space-y-1">
                <div>Numeracy 10: {independentData?.assessments?.[na10]?.[currentYear]?.AVERAGE}%</div>
                <div>Literacy 10: {independentData?.assessments?.[la10]?.[currentYear]?.AVERAGE}%</div>
                <div>Literacy 12: {independentData?.assessments?.[la12]?.[currentYear]?.AVERAGE}%</div>
              </div>
            </div>
          </div>

          <div className="p-0 md:fixed md:top-4 md:right-4 md:bottom-4 w-64 lg:w-96 md:shadow md:rounded md:bg-white z-1000 flex-1 overflow-hidden">
            <div className="p-0 h-full min-h-0">
              <div className="flex h-full flex-col min-h-0">
                <div className="m-auto w-full flex justify-center">
                  <button className={`flex-1 px-1 lg:px-3 py-1 text-xs lg:text-sm ${list === "all" ? "bg-white text-black" : "bg-gray-200 text-black"}`}
                    onClick={() => setList("all")}
                  >
                    All Schools
                  </button>

                  <button className={`flex-1 px-1 lg:px-3 py-1 text-xs lg:text-sm ${list === "public" ? "bg-white text-black" : "bg-gray-200 text-black"}`}
                    onClick={() => setList("public")}
                  >
                    Public
                  </button>

                  <button className={`flex-1 px-1 lg:px-3 py-1 text-xs lg:text-sm ${list === "independent" ? "bg-white text-black" : "bg-gray-200 text-black"}`}
                    onClick={() => setList("independent")}
                  >
                    Independent
                  </button>

                  <button className={`flex-1 px-1 lg:px-3 py-1 text-xs lg:text-sm ${list === "districts" ? "bg-white text-black" : "bg-gray-200 text-black"}`}
                    onClick={() => setList("districts")}
                  >
                    Districts
                  </button>
                </div>
                <div className="mb-0 flex-1 overflow-y-auto min-h-0 overscroll-contain">
                  <RankingList title={titleMap[list]} data={dataMap[list] || []} />
                </div>
              </div>
            </div>
          </div>

          <div className="md:p-0 md:absolute md:bottom-4 md:left-4 md:shadow md:rounded md:bg-white z-1000 w-3xs lg:w-xs">
            <div className="bg-white md:p-3 md:rounded md:shadow text-center md:text-left text-3xs md:text-sm text-black">
              <div className="font-semibold">Contains information licensed under the Open Government Licence – British Columbia.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}