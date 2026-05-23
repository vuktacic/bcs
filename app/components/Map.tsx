"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, useMap, GeoJSON, Marker, Popup } from "react-leaflet";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { createRoot, type Root } from "react-dom/client";
import L from "leaflet";

const na10 = "Numeracy Assessment 10";
const la10 = "Literacy Assessment 10";
const la12 = "Literacy Assessment 12";
const currentYear = "2024/2025";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type GeoJsonData = unknown;

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

function seedOffsets(lat: number, lng: number, schoolNumber: string): [number, number] {
    const seed = parseInt(schoolNumber, 10) || 0;
    const offsetLat = (Math.sin(seed) * 0.0005) || 0;
    const offsetLng = (Math.cos(seed) * 0.0005) || 0;
    return [lat + offsetLat, lng + offsetLng];
}

function formatDistrictNumber(districtNumber: string | number) {
    return String(districtNumber).padStart(3, "0");
}

function BaseMapLayer() {
    const map = useMap();

    useEffect(() => {
        const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        });

        tileLayer.addTo(map);

        return () => {
            map.removeLayer(tileLayer);
        };
    }, [map]);

    return null;
}

function buildScoreSeries(data: any) {
    return Object.entries(data)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([year, value]: any) => ({
            year,
            score: parseFloat(value.SCORE) / parseFloat(value.NUMBER_WRITERS) || 0,
        }));
}

function buildCombinedScoreSeries(assessments: any, provinceData?: any) {
    const allYears = new Set<string>();
    
    [na10, la10, la12].forEach(key => {
        Object.keys(assessments?.[key] || {}).forEach(year => allYears.add(year));
        Object.keys(provinceData?.assessments?.[key] || {}).forEach(year => allYears.add(year));
    });
    
    return Array.from(allYears)
        .sort()
        .map(year => {
            const obj: any = { year };
            
            [na10, la10, la12].forEach(key => {
                const value = assessments?.[key]?.[year];
                if (value) {
                    const score = parseFloat(value.SCORE) / parseFloat(value.NUMBER_WRITERS) || 0;
                    obj[key] = Math.round(score * 100) / 100;
                }
                
                const provValue = provinceData?.assessments?.[key]?.[year];
                if (provValue) {
                    const score = parseFloat(provValue.SCORE) / parseFloat(provValue.NUMBER_WRITERS) || 0;
                    obj[`${key}_prov`] = Math.round(score * 100) / 100;
                }
            });
            
            return obj;
        });
}

function DistrictPopupContent({
    districtName,
    districtNumber,
    districtAssessments,
    provinceData,
}: {
    districtName: string;
    districtNumber: string;
    districtAssessments: any;
    provinceData?: any;
}) {
    return (
        <div>
            <strong>{districtName} ({districtNumber})</strong><br />
            <div>
                <div><strong>Assessment Mean Scores ({currentYear}):</strong></div>
                <div>Numeracy 10: {formatMeanFromAssessments(districtAssessments, na10, currentYear)}</div>
                <div>Literacy 10: {formatMeanFromAssessments(districtAssessments, la10, currentYear)}</div>
                <div>Literacy 12: {formatMeanFromAssessments(districtAssessments, la12, currentYear)}</div>
            </div>
            <strong className="mt-2 block">Score Trends:</strong>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={buildCombinedScoreSeries(districtAssessments, provinceData)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip position={{ x: 20, y: 0 }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }} wrapperStyle={{ outline: 'none' }} />
                    <Legend />
                    <Line type="monotone" dataKey={na10} stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey={la10} stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey={la12} stroke="#ffc658" strokeWidth={2} />
                    <Line type="monotone" dataKey={`${na10}_prov`} stroke="#ababc8" strokeWidth={1} />
                    <Line type="monotone" dataKey={`${la10}_prov`} stroke="#91b59e" strokeWidth={1} />
                    <Line type="monotone" dataKey={`${la12}_prov`} stroke="#d9d9b3" strokeWidth={1} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function formatMeanFromAssessments(assessments: any, assessmentKey: string, year: string) {
    const entry = assessments?.[assessmentKey]?.[year];
    if (!entry) return "—";
    const score = parseFloat(entry.SCORE);
    const writers = parseFloat(entry.NUMBER_WRITERS);
    if (!Number.isFinite(score) || !Number.isFinite(writers) || writers === 0) return "—";
    return (score / writers).toFixed(2);
}

function onEachDistrict(feature: any, layer: L.Layer) {
    // Placeholder - will be defined inside component
}

export default function Map({query}: { query: string }) {
    const [geojsonData, setGeojsonData] = useState<GeoJsonData | null>(null);
    const [schoolIndex, setSchoolIndex] = useState<SchoolIndex[] | null>(null);
    const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
    const [provinceData, setProvinceData] = useState<any | null>(null);
    const schoolPopupOpenRef = useRef(false);
    const skipDistrictPopupRef = useRef(false);
    const districtPopupRootRef = useRef<Root | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadGeojson = async () => {
            const response = await fetch("/districts.geojson");
            const data = await response.json();

            if (isMounted) {
                setGeojsonData(data);
            }
        };

        const loadSchoolIndex = async () => {
            const response = await fetch("/indexes/schools.json");
            const data = await response.json();

            if (isMounted) {
                setSchoolIndex(data);
            }
        }

        const loadProvinceData = async () => {
            const response = await fetch("/province/bc.json");
            const data = await response.json();

            if (isMounted) {
                setProvinceData(data);
            }
        };

        loadGeojson().catch(console.error);
        loadSchoolIndex().catch(console.error);
        loadProvinceData().catch(console.error);

        return () => {
            isMounted = false;
        };
    }, []);

    function formatMeanSchool(assessmentKey: string) {
        const entry = selectedSchool?.assessments?.[assessmentKey]?.[currentYear];
        if (!entry) return "—";
        const score = parseFloat(entry.SCORE);
        const writers = parseFloat(entry.NUMBER_WRITERS);
        if (!Number.isFinite(score) || !Number.isFinite(writers) || writers === 0) return "—";
        return (score / writers).toFixed(2);
    }

    const matches = schoolIndex?.filter((school) =>
        school.SCHOOL_NAME.toLowerCase().includes(query.toLowerCase()) ||
        school.SCHOOL_NUMBER.includes(query) ||
        school.DISTRICT_NAME.toLowerCase().includes(query.toLowerCase()) ||
        school.DISTRICT_NUMBER.includes(query)
    ) || [];

    const handleEachDistrict = useCallback((feature: any, layer: L.Layer) => {
        layer.on({
            click: async (e) => {
                e.originalEvent?.preventDefault();
                e.originalEvent?.stopPropagation();
                const district = feature.properties;
                const districtNumber = formatDistrictNumber(district.SCHOOL_DISTRICT_NUMBER);
                
                // If we just closed a school popup, skip this district popup
                if (skipDistrictPopupRef.current) {
                    skipDistrictPopupRef.current = false;
                    return;
                }

                // If a school popup is open, close it and mark to skip district popup on the next click
                if (schoolPopupOpenRef.current) {
                    setSelectedSchool(null);
                    schoolPopupOpenRef.current = false;
                    skipDistrictPopupRef.current = true;
                    return;
                }

                const response = await fetch(`/districts/${districtNumber}.json`);
                const data = await response.json();

                const popupContainer = document.createElement("div");
                popupContainer.style.width = "300px";
                popupContainer.style.maxWidth = "300px";
                districtPopupRootRef.current?.unmount();
                districtPopupRootRef.current = createRoot(popupContainer);
                districtPopupRootRef.current.render(
                    <DistrictPopupContent
                        districtName={district.SCHOOL_DISTRICT_NAME}
                        districtNumber={districtNumber}
                        districtAssessments={data?.assessments}
                        provinceData={provinceData}
                    />
                );

                layer.bindPopup(popupContainer, {
                    maxWidth: 300,
                    minWidth: 300,
                });
                layer.openPopup();
            }
        });
    }, [provinceData]);

    return (
        <MapContainer
            bounds={[[49, -130], [56, -120]]}
            zoomDelta={0.25}
            zoomSnap={0.25}
            className="h-full w-full"
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
        >
            <BaseMapLayer />
            {geojsonData ? <GeoJSON data={geojsonData as any} onEachFeature={handleEachDistrict} /> : null}
            {schoolIndex?.filter((school) => (
                school.LOCATION
                && !isNaN(Number(school.LOCATION.lat))
                && !isNaN(Number(school.LOCATION.lng))
            ))
                .map((school) => (
                    <Marker
                        opacity={query ? (matches.includes(school) ? 1 : 0.1) : 1}
                        key={school.SCHOOL_NUMBER}
                        position={seedOffsets(
                            Number(school.LOCATION.lat),
                            Number(school.LOCATION.lng),
                            school.SCHOOL_NUMBER
                        )}
                        eventHandlers={{
                            click: async () => {
                                console.log("school marker clicked", {
                                    schoolNumber: school.SCHOOL_NUMBER,
                                    schoolName: school.SCHOOL_NAME,
                                });
                                schoolPopupOpenRef.current = true;
                                skipDistrictPopupRef.current = false;
                                const response = await fetch(`/schools/${school.SCHOOL_NUMBER}.json`);
                                const data = await response.json();
                                setSelectedSchool(data);
                            }
                        }}
                    >
                        <Popup
                            eventHandlers={{
                                popupopen: () => {
                                    console.log("school popup open", school.SCHOOL_NUMBER);
                                    schoolPopupOpenRef.current = true;
                                },
                                popupclose: () => {
                                    console.log("school popup close", school.SCHOOL_NUMBER);
                                    schoolPopupOpenRef.current = false;
                                    skipDistrictPopupRef.current = false;
                                    if (selectedSchool?.SCHOOL_NUMBER === school.SCHOOL_NUMBER) {
                                        setSelectedSchool(null);
                                    }
                                },
                            }}
                        >
                            <div>
                                <strong>{school.SCHOOL_NAME} ({school.SCHOOL_NUMBER})</strong><br />
                                District: {school.DISTRICT_NAME} ({school.DISTRICT_NUMBER})
                                <div>
                                    {selectedSchool && selectedSchool.SCHOOL_NUMBER === school.SCHOOL_NUMBER ? (
                                        <div>
                                            <div><strong>Assessment Mean Scores ({currentYear}):</strong></div>
                                            <div>Numeracy 10: {formatMeanSchool(na10)}</div>
                                            <div>Literacy 10: {formatMeanSchool(la10)}</div>
                                            <div>Literacy 12: {formatMeanSchool(la12)}</div>
                                        </div>
                                    ) : (
                                        <div><em>Click marker to load school data</em></div>
                                    )}
                                </div>
                                <strong className="mt-2 block">Score Trends:</strong>
                                {selectedSchool && selectedSchool.SCHOOL_NUMBER === school.SCHOOL_NUMBER ? (
                                    <ResponsiveContainer width="100%" height={350}>
                                        <LineChart data={buildCombinedScoreSeries(selectedSchool.assessments || {}, provinceData)}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="year" />
                                            <YAxis />
                                            <Tooltip position={{ x: 20, y: 0 }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }} wrapperStyle={{ outline: 'none' }} />
                                            <Legend />
                                            <Line type="monotone" dataKey={na10} stroke="#8884d8" strokeWidth={2} />
                                            <Line type="monotone" dataKey={la10} stroke="#82ca9d" strokeWidth={2} />
                                            <Line type="monotone" dataKey={la12} stroke="#ffc658" strokeWidth={2} />
                                            <Line type="monotone" dataKey={`${na10}_prov`} stroke="#ababc8" strokeWidth={1} />
                                            <Line type="monotone" dataKey={`${la10}_prov`} stroke="#91b59e" strokeWidth={1} />
                                            <Line type="monotone" dataKey={`${la12}_prov`} stroke="#d9d9b3" strokeWidth={1} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div><em>Click marker to load school data</em></div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
        </MapContainer>
    );
}