"use client";

import { useEffect, useState } from "react";

type SchoolIndex = {
    SCHOOL_NUMBER: string;
    SCHOOL_NAME: string;
    DISTRICT_NUMBER: string;
    DISTRICT_NAME: string;

    LOCATION: {
        lat: string;
        lng: string;
    }
}

export default function RankingList({title, data = []}: {title: string, data: any[]}) {
    return (
        <div className="h-[25vh] bg-white z-1000 p-3 rounded shadow text-sm text-black mb-4">

            <div className="font-semibold">{title}</div>

            <div className="h-[21vh] overflow-y-auto p-4">
                {
                    data.map((school: { schoolname: string, schoolnumber: string, avg: number }, index: number) => (
                        <div key={school.schoolnumber}>
                            {index + 1}. {school.schoolname} ({school.schoolnumber}) - {school.avg.toFixed(2)}
                        </div>
                    ))
                }
            </div>
        </div>
    )
}