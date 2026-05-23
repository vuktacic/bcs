"use client";

import { useEffect, useState } from "react";

const na10 = "Numeracy Assessment 10";
const la10 = "Literacy Assessment 10";
const la12 = "Literacy Assessment 12";
const currentYear = "2024/2025";

export default function ProvincePopup() {
    const [provinceData, setProvinceData] = useState<any | null>(null);
    const [publicData, setPublicData] = useState<any | null>(null);
    const [independentData, setIndependentData] = useState<any | null>(null);

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

        loadProvinceData().catch(console.error);
        loadPublicData().catch(console.error);
        loadIndependentData().catch(console.error);

        return () => {
            isMounted = false;
        };
    }, []);

    return (
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
    )
}