"use client";

import RankingList from "./RankingList";

const na10 = "Numeracy Assessment 10";
const la10 = "Literacy Assessment 10";
const la12 = "Literacy Assessment 12";
const currentYear = "2024/2025";

export default function ProvincePopup({ geojsonData, schoolIndex, districtIndex, provinceData, publicData, independentData }: { geojsonData: any | null; schoolIndex: any[] | null; districtIndex: any[] | null; provinceData: any | null; publicData: any | null; independentData: any | null }) {
    return (
        <div>
            <div className="absolute top-4 left-4 z-1000 bg-white p-3 rounded shadow text-sm text-black">
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

            <div>
                <div className="absolute top-4 right-4 z-1000 bg-white p-3 rounded shadow text-sm text-black w-md">
                    <RankingList title="All Schools" data={schoolIndex?.filter((school) => school.AVERAGE !== 0).sort((a, b) => b.avg - a.avg).map((school) => {
                        return {
                            schoolname: school.SCHOOL_NAME,
                            schoolnumber: school.SCHOOL_NUMBER,
                            avg: school.AVERAGE,
                            writers: school.WRITERS
                        }
                    })} />

                    <RankingList title="Public Schools" data={schoolIndex?.filter((school) => school.AVERAGE !== 0 && school.PUBLIC === true).sort((a, b) => b.avg - a.avg).map((school) => {
                        return {
                            schoolname: school.SCHOOL_NAME,
                            schoolnumber: school.SCHOOL_NUMBER,
                            avg: school.AVERAGE,
                            writers: school.WRITERS
                        }
                    })} />

                    <RankingList title="Independent Schools" data={schoolIndex?.filter((school) => school.AVERAGE !== 0 && school.PUBLIC !== true).sort((a, b) => b.avg - a.avg).map((school) => {
                        return {
                            schoolname: school.SCHOOL_NAME,
                            schoolnumber: school.SCHOOL_NUMBER,
                            avg: school.AVERAGE,
                            writers: school.WRITERS
                        }
                    })} />

                    <RankingList title="Districts" data={districtIndex?.filter((district) => district.AVERAGE !== 0).sort((a, b) => b.avg - a.avg).map((district) => {
                        return {
                            schoolname: district.DISTRICT_NAME,
                            schoolnumber: district.DISTRICT_NUMBER,
                            avg: district.AVERAGE,
                            writers: district.WRITERS
                        }
                    })} />

                </div>
            </div>

            <div>
                <div className="absolute bottom-4 left-4 z-1000 bg-white p-3 rounded shadow text-sm text-black w-sm">
                    <div className="font-semibold">Contains information licensed under the Open Government Licence – British Columbia.</div>
                </div>
            </div>
        </div>
    )
}