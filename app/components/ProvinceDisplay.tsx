"use client";

import { useState } from "react";
import RankingList from "./RankingList";

const na10 = "Numeracy Assessment 10";
const la10 = "Literacy Assessment 10";
const la12 = "Literacy Assessment 12";
const currentYear = "2024/2025";

export default function ProvinceDisplay({ geojsonData, schoolIndex, districtIndex, provinceData, publicData, independentData }: { geojsonData: any | null; schoolIndex: any[] | null; districtIndex: any[] | null; provinceData: any | null; publicData: any | null; independentData: any | null }) {
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
      <div className="bg-white rounded-t-2xl shadow-lg max-h-[50svh] overflow-hidden md:bg-transparent md:shadow-none md:max-h-none md:rounded-none text-black text-sm">
        <div className="p-3 md:absolute md:top-4 md:left-4 md:shadow md:rounded md:bg-white z-1000">
          <div className="font-semibold">Provincial Average</div>

          <div className="mt-2 space-y-1">
            <div>Numeracy 10: {provinceData?.assessments?.[na10]?.[currentYear]?.AVERAGE}%</div>
            <div>Literacy 10: {provinceData?.assessments?.[la10]?.[currentYear]?.AVERAGE}%</div>
            <div>Literacy 12: {provinceData?.assessments?.[la12]?.[currentYear]?.AVERAGE}%</div>
          </div>

          <div className="font-semibold pt-3">Public School Average</div>

          <div className="mt-2 space-y-1">
            <div>Numeracy 10: {publicData?.assessments?.[na10]?.[currentYear]?.AVERAGE}%</div>
            <div>Literacy 10: {publicData?.assessments?.[la10]?.[currentYear]?.AVERAGE}%</div>
            <div>Literacy 12: {publicData?.assessments?.[la12]?.[currentYear]?.AVERAGE}%</div>
          </div>

          <div className="font-semibold pt-3">Independent School Average</div>

          <div className="mt-2 space-y-1">
            <div>Numeracy 10: {independentData?.assessments?.[na10]?.[currentYear]?.AVERAGE}%</div>
            <div>Literacy 10: {independentData?.assessments?.[la10]?.[currentYear]?.AVERAGE}%</div>
            <div>Literacy 12: {independentData?.assessments?.[la12]?.[currentYear]?.AVERAGE}%</div>
          </div>
        </div>

        <div className="p-3 md:p-0 md:fixed md:top-4 md:right-4 md:bottom-4 md:w-96 md:shadow md:rounded md:bg-white z-1000">
          <div className="p-3 flex-1 overflow-hidden">
            <div className="flex h-full flex-col">
              <div className="m-auto">
                <button className={`px-3 py-1 text-sm ${list === "all" ? "bg-white text-black" : "bg-gray-200 text-black"}`}
                  onClick={() => setList("all")}
                >
                  All Schools
                </button>

                <button className={`px-3 py-1 text-sm ${list === "public" ? "bg-white text-black" : "bg-gray-200 text-black"}`}
                  onClick={() => setList("public")}
                >
                  Public
                </button>

                <button className={`px-3 py-1 text-sm ${list === "independent" ? "bg-white text-black" : "bg-gray-200 text-black"}`}
                  onClick={() => setList("independent")}
                >
                  Independent
                </button>

                <button className={`px-3 py-1 text-sm ${list === "districts" ? "bg-white text-black" : "bg-gray-200 text-black"}`}
                  onClick={() => setList("districts")}
                >
                  Districts
                </button>
              </div>
              <div className="mt-2 flex-1 overflow-y-auto">
                <RankingList title={titleMap[list]} data={dataMap[list] || []} />
              </div>
            </div>
          </div>
        </div>

        <div className="-3 md:p-0 md:absolute md:bottom-4 md:left-4 md:shadow md:rounded md:bg-white z-1000">
          <div className="absolute bottom-4 left-4 z-1000 bg-white p-3 rounded shadow text-sm text-black w-sm">
            <div className="font-semibold">Contains information licensed under the Open Government Licence – British Columbia.</div>
          </div>
        </div>
      </div>
    </div>

    // <div>
    //   <div className="absolute top-4 left-4 z-1000 bg-white p-3 rounded shadow text-sm text-black">
    //     <div className="font-semibold">Provincial Average</div>

    //     <div className="mt-2 space-y-1">
    //       <div>Numeracy 10: {provinceData?.assessments?.[na10]?.[currentYear]?.AVERAGE}%</div>
    //       <div>Literacy 10: {provinceData?.assessments?.[la10]?.[currentYear]?.AVERAGE}%</div>
    //       <div>Literacy 12: {provinceData?.assessments?.[la12]?.[currentYear]?.AVERAGE}%</div>
    //     </div>

    //     <div className="font-semibold pt-3">Public School Average</div>

    //     <div className="mt-2 space-y-1">
    //       <div>Numeracy 10: {publicData?.assessments?.[na10]?.[currentYear]?.AVERAGE}%</div>
    //       <div>Literacy 10: {publicData?.assessments?.[la10]?.[currentYear]?.AVERAGE}%</div>
    //       <div>Literacy 12: {publicData?.assessments?.[la12]?.[currentYear]?.AVERAGE}%</div>
    //     </div>

    //     <div className="font-semibold pt-3">Independent School Average</div>

    //     <div className="mt-2 space-y-1">
    //       <div>Numeracy 10: {independentData?.assessments?.[na10]?.[currentYear]?.AVERAGE}%</div>
    //       <div>Literacy 10: {independentData?.assessments?.[la10]?.[currentYear]?.AVERAGE}%</div>
    //       <div>Literacy 12: {independentData?.assessments?.[la12]?.[currentYear]?.AVERAGE}%</div>
    //     </div>
    //   </div>

    //   <div className="fixed right-4 top-4 bottom-4 h-[screen - 8] w-96 z-1000 bg-white rounded shadow flex flex-col">

    // <div className="p-3 flex-1 overflow-hidden">
    //     <div className="flex h-full flex-col">
    //       <div className="m-auto">
    //         <button className={`px-3 py-1 text-sm ${list === "all" ? "bg-white text-black" : "bg-gray-200 text-black"}`}
    //           onClick={() => setList("all")}
    //         >
    //           All Schools
    //         </button>

    //         <button className={`px-3 py-1 text-sm ${list === "public" ? "bg-white text-black" : "bg-gray-200 text-black"}`}
    //           onClick={() => setList("public")}
    //         >
    //           Public
    //         </button>

    //         <button className={`px-3 py-1 text-sm ${list === "independent" ? "bg-white text-black" : "bg-gray-200 text-black"}`}
    //           onClick={() => setList("independent")}
    //         >
    //           Independent
    //         </button>

    //         <button className={`px-3 py-1 text-sm ${list === "districts" ? "bg-white text-black" : "bg-gray-200 text-black"}`}
    //           onClick={() => setList("districts")}
    //         >
    //           Districts
    //         </button>
    //       </div>
    //       <div className="mt-2 flex-1 overflow-y-auto">
    //         <RankingList title={titleMap[list]} data={dataMap[list] || []} />
    //       </div>
    //     </div>
    // </div>
    //   </div>

    //   <div>
    // <div className="absolute bottom-4 left-4 z-1000 bg-white p-3 rounded shadow text-sm text-black w-sm">
    //   <div className="font-semibold">Contains information licensed under the Open Government Licence – British Columbia.</div>
    // </div>
    //   </div>
    // </div>
  )
}