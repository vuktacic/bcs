"use client";

import { useState } from "react";
import RankingList from "./RankingList";
import Search from "./Search";
import { motion, stagger, type Variants } from "motion/react";

const na10 = "Numeracy Assessment 10";
const la10 = "Literacy Assessment 10";
const la12 = "Literacy Assessment 12";
const currentYear = "2024/2025";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 0 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: "easeOut",
    },
  },
};

export default function ProvinceDisplay({ geojsonData, schoolIndex, districtIndex, provinceData, publicData, independentData, query, setQuery, isMobileDrawerOpen, setIsMobileDrawerOpen }: { geojsonData: any | null; schoolIndex: any[] | null; districtIndex: any[] | null; provinceData: any | null; publicData: any | null; independentData: any | null; query: string; setQuery: (query: string) => void; isMobileDrawerOpen: boolean; setIsMobileDrawerOpen: (open: boolean) => void }) {
  const [list, setList] = useState<"all" | "public" | "independent" | "districts">("all");
  const averagesReady = Boolean(provinceData && publicData && independentData);

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
    <div
      className="fixed inset-x-0 bottom-0 z-1000 md:contents text-foreground">
      <div className="md:hidden pointer-events-none">
        <div
          className="pointer-events-auto relative overflow-hidden border-0 rounded-t-3xl bg-background m-0 p-0 transition-[height] duration-200 outline-none border-t-2 border-background-light"
          style={{ height: isMobileDrawerOpen ? "56svh" : "3.25rem" }}
        >
          <div className="flex h-full min-h-0 flex-col overflow-hidden text-sm">
            <div className="flex w-full shrink-0 items-center">
              <div className="flex-1 min-w-0 h-full">
                <Search query={query} setQuery={setQuery} onFocus={() => setIsMobileDrawerOpen(true)} />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isMobileDrawerOpen) setIsMobileDrawerOpen(false);
                  else setIsMobileDrawerOpen(true);
                }}
                className="shrink-0 px-3 py-3 text-gray-100 hover:text-gray-500 transition-colors"
                aria-label="Close province drawer"
              >
                {isMobileDrawerOpen ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {/* caret pointing up */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {/* caret pointing down */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )
                }
              </button>
            </div>

            {isMobileDrawerOpen && averagesReady && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0 px-3 py-2 text-2xs flex justify-center text-center border-t-2 border-background-light"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">Provincial Average</div>

                    <div className="mt-2 space-y-1">
                      <div>Numeracy 10: {provinceData?.assessments?.[na10]?.[currentYear]?.AVERAGE}%</div>
                      <div>Literacy 10: {provinceData?.assessments?.[la10]?.[currentYear]?.AVERAGE}%</div>
                      <div>Literacy 12: {provinceData?.assessments?.[la12]?.[currentYear]?.AVERAGE}%</div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">Public Average</div>

                    <div className="mt-2 space-y-1">
                      <div>Numeracy 10: {publicData?.assessments?.[na10]?.[currentYear]?.AVERAGE}%</div>
                      <div>Literacy 10: {publicData?.assessments?.[la10]?.[currentYear]?.AVERAGE}%</div>
                      <div>Literacy 12: {publicData?.assessments?.[la12]?.[currentYear]?.AVERAGE}%</div>
                    </div>

                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">Independent Average</div>

                    <div className="mt-2 space-y-1">
                      <div>Numeracy 10: {independentData?.assessments?.[na10]?.[currentYear]?.AVERAGE}%</div>
                      <div>Literacy 10: {independentData?.assessments?.[la10]?.[currentYear]?.AVERAGE}%</div>
                      <div>Literacy 12: {independentData?.assessments?.[la12]?.[currentYear]?.AVERAGE}%</div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}

            {isMobileDrawerOpen && (
              <>
                <div className="flex min-h-0 h-0 flex-1 flex-col bg-background">
                  <div className="shrink-0 flex justify-center border-y-2 border-background-light">
                    <button className={`flex-1 px-1 py-1 text-xs ${list === "all" ? "bg-background-light " : "bg-background "}`}
                      onClick={() => setList("all")}
                    >
                      All Schools
                    </button>

                    <button className={`flex-1 px-1 py-1 text-xs ${list === "public" ? "bg-background-light " : "bg-background "}`}
                      onClick={() => setList("public")}
                    >
                      Public
                    </button>

                    <button className={`flex-1 px-1 py-1 text-xs ${list === "independent" ? "bg-background-light " : "bg-background "}`}
                      onClick={() => setList("independent")}
                    >
                      Independent
                    </button>

                    <button className={`flex-1 px-1 py-1 text-xs ${list === "districts" ? "bg-background-light " : "bg-background "}`}
                      onClick={() => setList("districts")}
                    >
                      Districts
                    </button>
                  </div>

                  <div className="h-0 min-h-0 flex-1 overflow-y-auto overscroll-contain overflow-x-auto px-0 border-b-5 border-t-5 border-background">
                    <RankingList title={titleMap[list]} data={dataMap[list] || []} query={query} />
                  </div>
                </div>

                <div className="shrink-0 px-3 border-t-2 border-background-light">
                  <div className="rounded bg-background text-center text-3xs">
                    <div className="">Contains information licensed under the Open Government Licence – British Columbia.</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden md:block">
        <div className="bg-background rounded-t-2xl shadow-lg h-[50svh] md:h-0 overflow-hidden min-h-0 md:bg-transparent md:shadow-none md:max-h-none md:rounded-none  text-sm flex flex-col">
          <div className="w-full md:absolute md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:w-[22vw] md:max-w-xl md:mt-0 z-1000">
            <Search query={query} setQuery={setQuery} onFocus={() => setIsMobileDrawerOpen(true)} />
          </div>

          {averagesReady ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-3 py-2 md:absolute md:top-4 md:left-4 md:shadow md:rounded bg-background z-1000 text-2xs md:text-sm flex md:block justify-center text-center md:text-left border-background-light border-2"
            >
              <motion.div className="font-semibold">Provincial Average</motion.div>
              <motion.div className="">Numeracy 10: {provinceData?.assessments?.[na10]?.[currentYear]?.AVERAGE}%</motion.div>
              <motion.div className="">Literacy 10: {provinceData?.assessments?.[la10]?.[currentYear]?.AVERAGE}%</motion.div>
              <motion.div className="">Literacy 12: {provinceData?.assessments?.[la12]?.[currentYear]?.AVERAGE}%</motion.div>



              <motion.div className="font-semibold md:pt-7">Public Average</motion.div>
              <motion.div className="">Numeracy 10: {publicData?.assessments?.[na10]?.[currentYear]?.AVERAGE}%</motion.div>
              <motion.div className="">Literacy 10: {publicData?.assessments?.[la10]?.[currentYear]?.AVERAGE}%</motion.div>
              <motion.div className="">Literacy 12: {publicData?.assessments?.[la12]?.[currentYear]?.AVERAGE}%</motion.div>



              <motion.div className="font-semibold md:pt-7">Independent Average</motion.div>
              <motion.div className="">Numeracy 10: {independentData?.assessments?.[na10]?.[currentYear]?.AVERAGE}%</motion.div>
              <motion.div className="">Literacy 10: {independentData?.assessments?.[la10]?.[currentYear]?.AVERAGE}%</motion.div>
              <motion.div className="">Literacy 12: {independentData?.assessments?.[la12]?.[currentYear]?.AVERAGE}%</motion.div>
            </motion.div>
          ) : null}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-0 md:fixed md:top-4 md:right-4 md:bottom-4 w-full md:w-64 lg:w-96 md:shadow md:rounded bg-background z-1000 flex-1 overflow-hidden border-background-light border-2">
            <div className="p-0 h-full min-h-0">
              <div className="flex h-full flex-col min-h-0">
                <div className="m-auto w-full flex justify-center border-b-2 border-background-light">
                  <button className={`flex-1 px-1 lg:px-3 py-1 text-xs lg:text-sm ${list === "all" ? "bg-background-light " : "bg-background "}`}
                    onClick={() => setList("all")}
                  >
                    All Schools
                  </button>

                  <button className={`flex-1 px-1 lg:px-3 py-1 text-xs lg:text-sm ${list === "public" ? "bg-background-light " : "bg-background "}`}
                    onClick={() => setList("public")}
                  >
                    Public
                  </button>

                  <button className={`flex-1 px-1 lg:px-3 py-1 text-xs lg:text-sm ${list === "independent" ? "bg-background-light " : "bg-background "}`}
                    onClick={() => setList("independent")}
                  >
                    Independent
                  </button>

                  <button className={`flex-1 px-1 lg:px-3 py-1 text-xs lg:text-sm ${list === "districts" ? "bg-background-light " : "bg-background "}`}
                    onClick={() => setList("districts")}
                  >
                    Districts
                  </button>
                </div>
                <div className="mb-0 flex-1 overflow-y-auto min-h-0 overflow-x-auto lg:overflow-x-hidden flex justify-center md:justify-start border-b-5 border-t-5 border-background">
                  <RankingList title={titleMap[list]} data={dataMap[list] || []} query={query} />
                </div>
              </div>
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="md:p-0 md:absolute md:bottom-4 md:left-4 md:shadow md:rounded bg-background z-1000 w-full md:w-3xs lg:w-xs border-background-light border-2">
            <div className="bg-background md:p-3 md:rounded md:shadow text-center md:text-left text-3xs md:text-sm ">
              <div className="font">Contains information licensed under the Open Government Licence – British Columbia.</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}