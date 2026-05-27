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
const popupWidthPx = 325;
const tooltipOffsetX = popupWidthPx + 25;

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

function buildSeries(assessments: any, provinceData: any) {
    const yearCollector = new Set<string>();

    // add year keys
    [na10, la10, la12].forEach((assessment) => {
        Object.keys(assessments?.[assessment] || {}).forEach((year) => yearCollector.add(year));
    });

    const years = Array.from(yearCollector).sort();

    return years.map((year) => {
        const row: any = { year: year };

        [na10, la10, la12].forEach((assessment) => {
            if (assessments?.[assessment]?.[year]?.AVERAGE !== 0) {
                row[assessment] = assessments?.[assessment]?.[year]?.AVERAGE ;
            } else {
                row[assessment] = null;
            }

            row[`${assessment}_prov`] = provinceData.assessments?.[assessment]?.[year]?.AVERAGE || null;
        });

        return row;
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
        <div style={{ width: `${popupWidthPx}px`, maxWidth: `${popupWidthPx}px` }}>
            <strong>{districtName} ({districtNumber})</strong><br />
            {districtAssessments ? (
                <div>
                    <div><strong>Assessment Mean Scores ({currentYear}):</strong></div>
                    <div>Numeracy 10: {districtAssessments?.[na10]?.[currentYear]?.AVERAGE || "—"}% - {districtAssessments?.[na10]?.[currentYear]?.NUMBER_WRITERS || "—"} Exams</div>
                    <div>Literacy 10: {districtAssessments?.[la10]?.[currentYear]?.AVERAGE || "—"}% - {districtAssessments?.[la10]?.[currentYear]?.NUMBER_WRITERS || "—"} Exams</div>
                    <div>Literacy 12: {districtAssessments?.[la12]?.[currentYear]?.AVERAGE || "—"}% - {districtAssessments?.[la12]?.[currentYear]?.NUMBER_WRITERS || "—"} Exams</div>
                </div>
            ) : (
                <div><em>Loading district data...</em></div>
            )}
            <strong className="mt-2 block">Score Trends:</strong>
            {districtAssessments ? (
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={buildSeries(districtAssessments, provinceData)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip
                            position={{ x: tooltipOffsetX, y: 12 }}
                            allowEscapeViewBox={{ x: true, y: true }}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', padding: '10px', borderRadius: '4px', zIndex: 9000 }}
                            wrapperStyle={{ outline: 'none' }}
                        />
                        <Legend />
                        <Line connectNulls type="monotone" dataKey={na10} stroke="#8884d8" strokeWidth={2} />
                        <Line connectNulls type="monotone" dataKey={la10} stroke="#82ca9d" strokeWidth={2} />
                        <Line connectNulls type="monotone" dataKey={la12} stroke="#ffc658" strokeWidth={2} />
                        <Line connectNulls type="monotone" dataKey={`${na10}_prov`} stroke="#ababc8" strokeWidth={1} />
                        <Line connectNulls type="monotone" dataKey={`${la10}_prov`} stroke="#91b59e" strokeWidth={1} />
                        <Line connectNulls type="monotone" dataKey={`${la12}_prov`} stroke="#baba6e" strokeWidth={1} />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div><em>Loading district data...</em></div>
            )}
        </div>
    );
}

export default function Map({ query, geojsonData, schoolIndex, districtIndex, provinceData, publicData, independentData }: { query: string; geojsonData: any | null; schoolIndex: any[] | null; districtIndex: any[] | null; provinceData: any | null; publicData: any | null; independentData: any | null }) {
    const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<{ districtName: string; districtNumber: string; assessments: any | null } | null>(null);
    const schoolPopupOpenRef = useRef(false);
    const districtPopupOpenRef = useRef(false);
    const districtPopupRootRef = useRef<Root | null>(null);
    const activeDistrictNumberRef = useRef<string | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const justClosedPopupRef = useRef(false);

    const matches = schoolIndex?.filter((school) =>
        school.SCHOOL_NAME.toLowerCase().includes(query.toLowerCase()) ||
        school.SCHOOL_NUMBER.includes(query) ||
        school.DISTRICT_NAME.toLowerCase().includes(query.toLowerCase()) ||
        school.DISTRICT_NUMBER.includes(query)
    ) || [];

    const markJustClosed = useCallback(() => {
        console.log("popup just closed");
        justClosedPopupRef.current = true;
        setTimeout(() => {
            justClosedPopupRef.current = false;
            console.log("popup close window cleared");
        }, 0);
    }, []);

    const handleEachDistrict = useCallback((feature: any, layer: L.Layer) => {
        layer.on({
            popupclose: () => {
                const district = feature.properties;
                const districtNumber = formatDistrictNumber(district.SCHOOL_DISTRICT_NUMBER);
                if (activeDistrictNumberRef.current !== districtNumber) {
                    console.log("district popup close ignored (inactive)", { districtNumber, active: activeDistrictNumberRef.current });
                    return;
                }
                console.log("district popup close", { districtNumber });
                districtPopupOpenRef.current = false;
                activeDistrictNumberRef.current = null;
                markJustClosed();
                layer.unbindPopup();
            },
            click: async (e) => {
                e.originalEvent?.preventDefault();
                e.originalEvent?.stopPropagation();
                const district = feature.properties;
                const districtNumber = formatDistrictNumber(district.SCHOOL_DISTRICT_NUMBER);
                const districtName = district.SCHOOL_DISTRICT_NAME;

                console.log("district click", { districtNumber, districtName });

                if (justClosedPopupRef.current) {
                    console.log("district click skipped (just closed)", { districtNumber });
                    layer.unbindPopup();
                    mapRef.current?.closePopup();
                    return;
                }

                if (schoolPopupOpenRef.current) {
                    console.log("district click closing school popup", { districtNumber });
                    setSelectedSchool(null);
                    schoolPopupOpenRef.current = false;
                    mapRef.current?.closePopup();
                    return;
                }

                if (districtPopupOpenRef.current) {
                    console.log("district click closing district popup", { districtNumber });
                    mapRef.current?.closePopup();
                    return;
                }

                const popupContainer = document.createElement("div");
                popupContainer.style.width = `${popupWidthPx}px`;
                popupContainer.style.maxWidth = `${popupWidthPx}px`;
                districtPopupRootRef.current?.unmount();
                districtPopupRootRef.current = createRoot(popupContainer);
                activeDistrictNumberRef.current = districtNumber;

                setSelectedDistrict({
                    districtName,
                    districtNumber,
                    assessments: null,
                });

                layer.bindPopup(popupContainer, {
                    maxWidth: popupWidthPx,
                    minWidth: popupWidthPx,
                });
                layer.openPopup();
                districtPopupOpenRef.current = true;

                console.log("district popup opened", { districtNumber });

                const response = await fetch(`/districts/${districtNumber}.json`);
                const data = await response.json();

                console.log("district data loaded", { districtNumber });

                if (activeDistrictNumberRef.current !== districtNumber) {
                    console.log("district data ignored (stale)", { districtNumber, active: activeDistrictNumberRef.current });
                    return;
                }

                setSelectedDistrict({
                    districtName,
                    districtNumber,
                    assessments: data?.assessments,
                });
            }
        });
    }, [markJustClosed]);

    useEffect(() => {
        if (!selectedDistrict || !districtPopupRootRef.current) {
            return;
        }

        console.log("district popup render", { districtNumber: selectedDistrict.districtNumber });

        districtPopupRootRef.current.render(
            <DistrictPopupContent
                districtName={selectedDistrict.districtName}
                districtNumber={selectedDistrict.districtNumber}
                districtAssessments={selectedDistrict.assessments}
                provinceData={provinceData}
            />
        );
    }, [selectedDistrict, provinceData]);

    return (
        <MapContainer
            bounds={[[48.5, -124], [49.5, -122]]}
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
                        opacity={query ? (matches.includes(school) ? 1 : 0) : 1}
                        key={school.SCHOOL_NUMBER}
                        position={seedOffsets(
                            Number(school.LOCATION.lat),
                            Number(school.LOCATION.lng),
                            school.SCHOOL_NUMBER
                        )}
                        eventHandlers={{
                            click: async () => {
                                if (query && !matches.includes(school)) {
                                    return;
                                }

                                console.log("school marker clicked", {
                                    schoolNumber: school.SCHOOL_NUMBER,
                                    schoolName: school.SCHOOL_NAME,
                                });

                                schoolPopupOpenRef.current = true;
                                const response = await fetch(`/schools/${school.SCHOOL_NUMBER}.json`);
                                const data = await response.json();
                                setSelectedSchool(data);
                            }
                        }}
                    >
                        <Popup
                            minWidth={popupWidthPx}
                            maxWidth={popupWidthPx}
                            eventHandlers={{
                                popupopen: () => {
                                    console.log("school popup open", school.SCHOOL_NUMBER);
                                    schoolPopupOpenRef.current = true;
                                },
                                popupclose: () => {
                                    console.log("school popup close", school.SCHOOL_NUMBER);
                                    schoolPopupOpenRef.current = false;
                                    markJustClosed();
                                    if (selectedSchool?.SCHOOL_NUMBER === school.SCHOOL_NUMBER) {
                                        setSelectedSchool(null);
                                    }
                                },
                            }}
                        >
                            <div style={{ width: `${popupWidthPx}px`, maxWidth: `${popupWidthPx}px` }}>
                                <strong>{school.SCHOOL_NAME} ({school.SCHOOL_NUMBER})</strong><br />
                                District: {school.DISTRICT_NAME} {(school.DISTRICT_NUMBER ? `(${school.DISTRICT_NUMBER})` : "")}
                                <div>
                                    {selectedSchool && selectedSchool.SCHOOL_NUMBER === school.SCHOOL_NUMBER ? (
                                        <div>
                                            <div><strong>Assessment Mean Scores ({currentYear}):</strong></div>
                                            <div>Numeracy 10: {selectedSchool?.assessments?.[na10]?.[currentYear]?.AVERAGE || "—"}% - {selectedSchool?.assessments?.[na10]?.[currentYear]?.NUMBER_WRITERS || "—"} Exams</div>
                                            <div>Literacy 10: {selectedSchool?.assessments?.[la10]?.[currentYear]?.AVERAGE || "—"}% - {selectedSchool?.assessments?.[la10]?.[currentYear]?.NUMBER_WRITERS || "—"} Exams</div>
                                            <div>Literacy 12: {selectedSchool?.assessments?.[la12]?.[currentYear]?.AVERAGE || "—"}% - {selectedSchool?.assessments?.[la12]?.[currentYear]?.NUMBER_WRITERS || "—"} Exams</div>
                                        </div>
                                    ) : (
                                        <div><em>Click marker to load school data</em></div>
                                    )}
                                </div>
                                <strong className="mt-2 block">Score Trends:</strong>
                                {selectedSchool && selectedSchool.SCHOOL_NUMBER === school.SCHOOL_NUMBER ? (
                                    <ResponsiveContainer width="100%" height={350}>
                                        <LineChart data={buildSeries(selectedSchool.assessments, provinceData)}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="year" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip
                                                position={{ x: tooltipOffsetX, y: 12 }}
                                                allowEscapeViewBox={{ x: true, y: true }}
                                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}
                                                wrapperStyle={{ outline: 'none' }}
                                            />
                                            <Legend />
                                            <Line connectNulls type="monotone" dataKey={na10} stroke="#8884d8" strokeWidth={2} />
                                            <Line connectNulls type="monotone" dataKey={la10} stroke="#82ca9d" strokeWidth={2} />
                                            <Line connectNulls type="monotone" dataKey={la12} stroke="#ffc658" strokeWidth={2} />
                                            <Line connectNulls type="monotone" dataKey={`${na10}_prov`} stroke="#ababc8" strokeWidth={1} />
                                            <Line connectNulls type="monotone" dataKey={`${la10}_prov`} stroke="#91b59e" strokeWidth={1} />
                                            <Line connectNulls type="monotone" dataKey={`${la12}_prov`} stroke="#baba6e" strokeWidth={1} />
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