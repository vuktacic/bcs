"use client";

import { useEffect, useState } from "react";
import RankingList from "./RankingList";

const na10 = "Numeracy Assessment 10";
const la10 = "Literacy Assessment 10";
const la12 = "Literacy Assessment 12";
const currentYear = "2024/2025";

type RankingRow = {
    schoolname: string;
    schoolnumber: string;
    avg: number;
    writers: number;
    public?: boolean;
};

export default function ProvincePopup() {
    const [provinceData, setProvinceData] = useState<any | null>(null);
    const [publicData, setPublicData] = useState<any | null>(null);
    const [independentData, setIndependentData] = useState<any | null>(null);
    const [schoolIndex, setSchoolIndex] = useState<any | null>(null);

    const [rankings, setRankings] = useState<RankingRow[]>([]);
    const [districtRankings, setDistrictRankings] = useState<RankingRow[]>([]);

    function formatMeanProvince(data: any, assessmentKey: string) {
        const entry = data?.assessments?.[assessmentKey]?.[currentYear];
        if (!entry) return "—";
        const score = parseFloat(entry.SCORE);
        const writers = parseFloat(entry.NUMBER_WRITERS);
        if (!Number.isFinite(score) || !Number.isFinite(writers) || writers === 0) return "—";
        return (score / writers).toFixed(2);
    }

    useEffect(() => {
        let isMounted = true;

        const loadProvinceData = async () => {
            const response = await fetch("/province/bc.json");
            const data = await response.json();

            if (isMounted) {
                setProvinceData(data);
            }
        };

        const loadPublicData = async () => {
            const response = await fetch("/province/public.json");
            const data = await response.json();

            if (isMounted) {
                setPublicData(data);
            }
        };

        const loadIndependentData = async () => {
            const response = await fetch("/province/independent.json");
            const data = await response.json();

            if (isMounted) {
                setIndependentData(data);
            }
        };

        const loadAll = async () => {
            try {
                const [provinceResp, publicResp, independentResp, schoolsIndexResp, districtsIndexResp] = await Promise.all([
                    fetch("/province/bc.json").then(r => r.json()),
                    fetch("/province/public.json").then(r => r.json()),
                    fetch("/province/independent.json").then(r => r.json()),
                    fetch("/indexes/schools.json").then(r => r.json()),
                    fetch("/indexes/districts.json").then(r => r.json()),
                ]);

                if (!isMounted) {
                    return;
                }

                setProvinceData(provinceResp);
                setPublicData(publicResp);
                setIndependentData(independentResp);
                setSchoolIndex(schoolsIndexResp);

                const computed: RankingRow[] = [];
                for (const schoolEntry of schoolsIndexResp) {
                    const SCHOOL_NUMBER = schoolEntry?.SCHOOL_NUMBER;
                    if (!SCHOOL_NUMBER) {
                        continue;
                    }
                    try {
                        const response = await fetch(`/schools/${SCHOOL_NUMBER}.json`);
                        const data = await response.json();
                        const formatted = formatMeanSchool({ school: data });
                        if (formatted !== "—") {
                            computed.push(formatted);
                        }
                    } catch (err) {
                        console.error(`Failed to load school ${SCHOOL_NUMBER}`, err);
                    }
                }

                computed.sort((a, b) => b.avg - a.avg);
                if (isMounted) {
                    setRankings(computed);
                }

                const computedDistricts: RankingRow[] = [];
                for (const districtEntry of districtsIndexResp) {
                    const districtNumberRaw = districtEntry?.DISTRICT_NUMBER;
                    if (!districtNumberRaw) {
                        continue;
                    }
                    const districtNumber = String(districtNumberRaw).padStart(3, "0");
                    try {
                        const response = await fetch(`/districts/${districtNumber}.json`);
                        const data = await response.json();
                        const formatted = formatMeanDistrict({ district: data });
                        if (formatted !== "—") {
                            computedDistricts.push(formatted);
                        }
                    } catch (err) {
                        console.error(`Failed to load district ${districtNumber}`, err);
                    }
                }

                computedDistricts.sort((a, b) => b.avg - a.avg);
                if (isMounted) {
                    setDistrictRankings(computedDistricts);
                }
            } catch (err) {
                console.error(err);
            }
        };

        loadAll();

        return () => {
            isMounted = false;
        };
    }, []);

    function formatMeanSchool({ school }: { school: any }): RankingRow | "—" {
        const safeAvg = (key: string) => {
            const entry = school?.assessments?.[key]?.[currentYear];
            if (!entry) {
                return NaN;
            }
            const score = parseFloat(entry.SCORE);
            const writers = parseFloat(entry.NUMBER_WRITERS);
            if (!Number.isFinite(score) || !Number.isFinite(writers) || writers === 0) {
                return NaN;
            }
            return score / writers;
        };

        const na10avg = safeAvg(na10);
        const la10avg = safeAvg(la10);
        const la12avg = safeAvg(la12);

        let total = 0;
        let count = 0;
        let writers = 0;

        if (Number.isFinite(na10avg) && na10avg !== 0) {
            total += na10avg;
            count++;
            writers += parseFloat(school.assessments?.[na10]?.[currentYear]?.NUMBER_WRITERS || "0");
        }
        if (Number.isFinite(la10avg) && la10avg !== 0) {
            total += la10avg;
            count++;
            writers += parseFloat(school.assessments?.[la10]?.[currentYear]?.NUMBER_WRITERS || "0");
        }
        if (Number.isFinite(la12avg) && la12avg !== 0) {
            total += la12avg;
            count++;
            writers += parseFloat(school.assessments?.[la12]?.[currentYear]?.NUMBER_WRITERS || "0");
        }

        if (count !== 3) {
            return "—";
        }
        const mean = total / count;

        return {
            schoolname: school.SCHOOL_NAME,
            schoolnumber: school.SCHOOL_NUMBER,
            avg: mean,
            public: school.PUBLIC_OR_INDEPENDENT === "Public School",
            writers: writers
        };
    }

    function formatMeanDistrict({ district }: { district: any }): RankingRow | "—" {
        const safeAvg = (key: string) => {
            const entry = district?.assessments?.[key]?.[currentYear];
            if (!entry) {
                return NaN;
            }
            const score = parseFloat(entry.SCORE);
            const writers = parseFloat(entry.NUMBER_WRITERS);
            if (!Number.isFinite(score) || !Number.isFinite(writers) || writers === 0) {
                return NaN;
            }
            return score / writers;
        };

        const na10avg = safeAvg(na10);
        const la10avg = safeAvg(la10);
        const la12avg = safeAvg(la12);

        let total = 0;
        let count = 0;
        let writers = 0;

        if (Number.isFinite(na10avg) && na10avg !== 0) {
            total += na10avg;
            count++;
            writers += parseFloat(district.assessments?.[na10]?.[currentYear]?.NUMBER_WRITERS || "0");
        }
        if (Number.isFinite(la10avg) && la10avg !== 0) {
            total += la10avg;
            count++;
            writers += parseFloat(district.assessments?.[la10]?.[currentYear]?.NUMBER_WRITERS || "0");
        }
        if (Number.isFinite(la12avg) && la12avg !== 0) {
            total += la12avg;
            count++;
            writers += parseFloat(district.assessments?.[la12]?.[currentYear]?.NUMBER_WRITERS || "0");
        }

        if (count !== 3) {
            return "—";
        }
        const mean = total / count;

        return {
            schoolname: district.DISTRICT_NAME,
            schoolnumber: district.DISTRICT_NUMBER,
            avg: mean,
            writers: writers
        };
    }

    return (
        <div>
            <div className="absolute top-4 left-4 z-1000 bg-white p-3 rounded shadow text-sm text-black">
                <div className="font-semibold">Provincial Average</div>

                <div className="mt-2 space-y-1">
                    <div>Numeracy 10: {formatMeanProvince(provinceData, na10)}</div>
                    <div>Literacy 10: {formatMeanProvince(provinceData, la10)}</div>
                    <div>Literacy 12: {formatMeanProvince(provinceData, la12)}</div>
                </div>

                <div className="font-semibold pt-3">Public School Average</div>

                <div className="mt-2 space-y-1">
                    <div>Numeracy 10: {formatMeanProvince(publicData, na10)}</div>
                    <div>Literacy 10: {formatMeanProvince(publicData, la10)}</div>
                    <div>Literacy 12: {formatMeanProvince(publicData, la12)}</div>
                </div>

                <div className="font-semibold pt-3">Independent School Average</div>

                <div className="mt-2 space-y-1">
                    <div>Numeracy 10: {formatMeanProvince(independentData, na10)}</div>
                    <div>Literacy 10: {formatMeanProvince(independentData, la10)}</div>
                    <div>Literacy 12: {formatMeanProvince(independentData, la12)}</div>
                </div>
            </div>

            <div>
                <div className="absolute top-4 right-4 z-1000 bg-white p-3 rounded shadow text-sm text-black">

                    <RankingList title="All Schools" data={rankings} />

                    <RankingList title="Public Schools" data={rankings.filter((school) => school.public)} />

                    <RankingList title="Independent Schools" data={rankings.filter((school) => !school.public)} />

                    <RankingList title="Districts" data={districtRankings} />


                </div>
            </div>

            <div>
                <div className="absolute bottom-4 left-4 z-1000 bg-white p-3 rounded shadow text-sm text-black w-128">
                    <div className="font-semibold">Contains information licensed under the Open Government Licence – British Columbia.</div>
                </div>
            </div>
        </div>
    )
}