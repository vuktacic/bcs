"use client";

import { useEffect, useState } from "react";
import { MapContainer, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";

type GeoJsonData = unknown;

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

    useEffect(() => {
        let isMounted = true;

        const loadGeojson = async () => {
            const response = await fetch("/districts.geojson");
            const data = await response.json();

            if (isMounted) {
                setGeojsonData(data);
            }
        };

        loadGeojson().catch(console.error);

        return () => {
            isMounted = false;
        };
    }, []);

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
        </MapContainer>

    );
}