"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, useMap, GeoJSON, Marker, Popup, CircleMarker } from "react-leaflet";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import L from "leaflet";
import DisplayPopup from "./DisplayPopup";
import MarkerClusterGroup from "react-leaflet-cluster";

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

function seedOffsets(lat: number, lng: number, schoolNumber: string): [number, number] {
  const seed = parseInt(schoolNumber, 10) || 0;
  const offsetLat = (Math.sin(seed * 24) * 0.0005) || 0;
  const offsetLng = (Math.cos(seed * 24) * 0.0005) || 0;
  return [lat + offsetLat, lng + offsetLng];
}

function formartDistrictNumber(districtNumber: Number) {
  return String(districtNumber).padStart(3, "0");
}

function BaseMapLayer() {
  const map = useMap();

  useEffect(() => {
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    });

    tileLayer.addTo(map);

    return () => {
      map.removeLayer(tileLayer);
    };
  }, [map]);

  return null;
}

export default function Map({ query, geojsonData, schoolIndex, districtIndex, provinceData, publicData, independentData, onPopupOpen }: { query: string; geojsonData: any | null; schoolIndex: any[] | null; districtIndex: any[] | null; provinceData: any | null; publicData: any | null; independentData: any | null; onPopupOpen?: () => void }) {

  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<{ districtName: string; districtNumber: string; assessments: any | null } | null>(null);
  const [openSchoolNumber, setOpenSchoolNumber] = useState<string | null>(null);
  const activeDistrictNumberRef = useRef<string | null>(null);
  const [districtPopupPosition, setDistrictPopupPosition] = useState<[number, number] | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const justClosedPopupRef = useRef(false);
  const isSchoolPopupOpen = openSchoolNumber !== null;
  const isDistrictPopupOpen = Boolean(selectedDistrict && districtPopupPosition);
  const isSchoolPopupOpenRef = useRef(isSchoolPopupOpen);
  const isDistrictPopupOpenRef = useRef(isDistrictPopupOpen);
  const [popupWidth, setPopupWidth] = useState(325);
  const tooltipOffsetX = popupWidth + 25;

  const matches = schoolIndex?.filter((school) =>
    school.SCHOOL_NAME.toLowerCase().includes(query.toLowerCase()) ||
    school.SCHOOL_NUMBER.includes(query) ||
    school.DISTRICT_NAME.toLowerCase().includes(query.toLowerCase()) ||
    school.DISTRICT_NUMBER.includes(query)
  ) || [];

  const markJustClosed = useCallback(() => {
    justClosedPopupRef.current = true;
    setTimeout(() => {
      justClosedPopupRef.current = false;
    }, 0);
  }, []);

  useEffect(() => {
    isSchoolPopupOpenRef.current = isSchoolPopupOpen;
  }, [isSchoolPopupOpen]);

  useEffect(() => {
    isDistrictPopupOpenRef.current = isDistrictPopupOpen;
  }, [isDistrictPopupOpen]);

  useEffect(() => {
    const update = () => {
      const next = Math.min(325, Math.floor(window.innerWidth * 0.6));
      setPopupWidth(next);
    };

    update();

    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
    };
  }, [popupWidth]);

  const handleEachDistrict = useCallback((feature: any, layer: L.Layer) => {
    layer.on({
      click: async (e) => {
        e.originalEvent?.preventDefault();
        e.originalEvent?.stopPropagation();
        const district = feature.properties;
        const districtNumber = formartDistrictNumber(district.SCHOOL_DISTRICT_NUMBER);
        const districtName = district.SCHOOL_DISTRICT_NAME;

        if (justClosedPopupRef.current) {
          layer.unbindPopup();
          mapRef.current?.closePopup();
          return;
        }

        if (isSchoolPopupOpenRef.current) {
          setSelectedSchool(null);
          setOpenSchoolNumber(null);
          mapRef.current?.closePopup();
          return;
        }

        if (isDistrictPopupOpenRef.current) {
          activeDistrictNumberRef.current = null;
          setSelectedDistrict(null);
          setDistrictPopupPosition(null);
          markJustClosed();
          mapRef.current?.closePopup();
          return;
        }

        activeDistrictNumberRef.current = districtNumber;
        setDistrictPopupPosition([e.latlng.lat, e.latlng.lng]);
        onPopupOpen?.();

        setSelectedDistrict({
          districtName,
          districtNumber,
          assessments: null,
        });

        const response = await fetch(`/districts/${districtNumber}.json`);
        const data = await response.json();

        if (activeDistrictNumberRef.current !== districtNumber) {
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

  return (
    <MapContainer
      bounds={[[48.5, -124], [49.5, -122]]}
      className="h-full w-full"
      style={{ height: "100%", width: "100%", background: "var(--color-background)" }}
      zoomControl={false}
      ref={mapRef}
      scrollWheelZoom={true}
      zoomSnap={0.25}
      zoomDelta={0.25}
    >
      <BaseMapLayer />

      {geojsonData ?
        <GeoJSON
          data={geojsonData as any}
          onEachFeature={handleEachDistrict}
          pathOptions={{ color: "#bbb", weight: 1, fillColor: "#444", fillOpacity: 0.0 }}
        />
        : null}

      {selectedDistrict && districtPopupPosition ? (
        <Popup
          position={districtPopupPosition}
          minWidth={popupWidth}
          maxWidth={popupWidth}
          eventHandlers={{
            popupclose: () => {
              activeDistrictNumberRef.current = null;
              setSelectedDistrict(null);
              setDistrictPopupPosition(null);
              markJustClosed();
            },
          }}
        >
          <DisplayPopup selected={selectedDistrict} object={{
            DISTRICT_NAME: selectedDistrict.districtName,
            DISTRICT_NUMBER: selectedDistrict.districtNumber,
          }} isSchool={false} provinceData={provinceData} popupWidth={popupWidth} />
        </Popup>
      ) : null}

      <MarkerClusterGroup chunkedLoading animate={true} animateAddingMarkers={false} disableClusteringAtZoom={11} zoomToBoundsOnClick={true} showCoverageOnHover={false} maxClusterRadius={80} spiderfyOnMaxZoom={false}>
        {schoolIndex?.filter((school) => (
          school.LOCATION
          && !isNaN(Number(school.LOCATION.lat))
          && !isNaN(Number(school.LOCATION.lng))
        )).map((school) => (

          <CircleMarker
            opacity={query ? (matches.includes(school) ? 1 : 0) : 1}
            key={`school-${school.SCHOOL_NUMBER}-${popupWidth}`}
            pathOptions={{ color: school.PUBLIC ? "#2563eb" : "#ea860c", fillColor: school.PUBLIC ? "#2563eb" : "#ea860c", fillOpacity: 0.25, weight: 1 }}
            radius={8}
            center={seedOffsets(
              Number(school.LOCATION.lat),
              Number(school.LOCATION.lng),
              school.SCHOOL_NUMBER
            )}
            eventHandlers={{
              click: async () => {
                if (query && !matches.includes(school)) {
                  return;
                }

                setOpenSchoolNumber(school.SCHOOL_NUMBER);
                onPopupOpen?.();
                const response = await fetch(`/schools/${school.SCHOOL_NUMBER}.json`);
                const data = await response.json();
                setSelectedSchool(data);
              }
            }}
          >
            <Popup
              minWidth={popupWidth}
              maxWidth={popupWidth}
              eventHandlers={{
                popupclose: () => {
                  setOpenSchoolNumber(null);
                  markJustClosed();
                  if (selectedSchool?.SCHOOL_NUMBER === school.SCHOOL_NUMBER) {
                    setSelectedSchool(null);
                  }
                },
              }}
            >
              <DisplayPopup selected={selectedSchool} object={school} isSchool={true} provinceData={provinceData} popupWidth={popupWidth} />
            </Popup>
          </CircleMarker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}