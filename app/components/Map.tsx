"use client";

import { useEffect, useState } from "react";
import { MapContainer, useMap, GeoJSON, Marker, Popup } from "react-leaflet";
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

export default function Map() {
    const [geojsonData, setGeojsonData] = useState<GeoJsonData | null>(null);
    const [schoolIndex, setSchoolIndex] = useState<SchoolIndex[] | null>(null);
    const [selectedSchool, setSelectedSchool] = useState<any | null>(null);

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

        loadGeojson().catch(console.error);
        loadSchoolIndex().catch(console.error);

        return () => {
            isMounted = false;
        };
    }, []);

    function formatMean(assessmentKey: string) {
        const entry = selectedSchool?.assessments?.[assessmentKey]?.[currentYear];
        if (!entry) return "—";
        const score = parseFloat(entry.SCORE);
        const writers = parseFloat(entry.NUMBER_WRITERS);
        if (!Number.isFinite(score) || !Number.isFinite(writers) || writers === 0) return "—";
        return (score / writers).toFixed(2);
    }

    return (
        <MapContainer
            bounds={[[49, -130], [56, -120]]}
            zoomDelta={0.25}
            zoomSnap={0.25}
            className="h-full w-full"
            style={{ height: "100%", width: "100%" }}
        >
            <BaseMapLayer />
            {geojsonData ? <GeoJSON data={geojsonData as any} /> : null}
            {schoolIndex?.filter((school) => (
                school.LOCATION
                && !isNaN(Number(school.LOCATION.lat))
                && !isNaN(Number(school.LOCATION.lng))
            ))
                .map((school) => (
                    <Marker
                        key={school.SCHOOL_NUMBER}
                        position={seedOffsets(
                            Number(school.LOCATION.lat),
                            Number(school.LOCATION.lng),
                            school.SCHOOL_NUMBER
                        )}
                        eventHandlers={{
                            click: async () => {
                                const response = await fetch(`/schools/${school.SCHOOL_NUMBER}.json`);
                                const data = await response.json();
                                setSelectedSchool(data);
                            }
                        }}
                    >
                        <Popup>
                            <div>
                                <strong>{school.SCHOOL_NAME} ({school.SCHOOL_NUMBER})</strong><br />
                                District: {school.DISTRICT_NAME} ({school.DISTRICT_NUMBER})
                                <div>
                                    {selectedSchool && selectedSchool.SCHOOL_NUMBER === school.SCHOOL_NUMBER ? (
                                        <div>
                                            <div><strong>Assessment Mean Scores ({currentYear}):</strong></div>
                                            <div>Numeracy 10: {formatMean(na10)}</div>
                                            <div>Literacy 10: {formatMean(la10)}</div>
                                            <div>Literacy 12: {formatMean(la12)}</div>
                                        </div>
                                    ) : (
                                        <div><em>Click marker to load school data</em></div>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
        </MapContainer>
    );
}