"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, useMap, GeoJSON, Marker, Popup } from "react-leaflet";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import L from "leaflet";
import DisplayPopup from "./DisplayPopup";

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

function formartDistrictNumber(districtNumber: Number) {
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

export default function Map({ query, geojsonData, schoolIndex, districtIndex, provinceData, publicData, independentData }: { query: string; geojsonData: any | null; schoolIndex: any[] | null; districtIndex: any[] | null; provinceData: any | null; publicData: any | null; independentData: any | null }) {

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
      zoomDelta={0.25}
      zoomSnap={0.25}
      className="h-full w-full"
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
      ref={mapRef}
    >
      <BaseMapLayer />

      {geojsonData ? <GeoJSON data={geojsonData as any} onEachFeature={handleEachDistrict} /> : null}

      {selectedDistrict && districtPopupPosition ? (
        <Popup
          position={districtPopupPosition}
          minWidth={popupWidthPx}
          maxWidth={popupWidthPx}
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
          }} isSchool={false} provinceData={provinceData} />
        </Popup>
      ) : null}

      {schoolIndex?.filter((school) => (
        school.LOCATION
        && !isNaN(Number(school.LOCATION.lat))
        && !isNaN(Number(school.LOCATION.lng))
      )).map((school) => (
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

              setOpenSchoolNumber(school.SCHOOL_NUMBER);
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
              popupclose: () => {
                setOpenSchoolNumber(null);
                markJustClosed();
                if (selectedSchool?.SCHOOL_NUMBER === school.SCHOOL_NUMBER) {
                  setSelectedSchool(null);
                }
              },
            }}
          >
            <DisplayPopup selected={selectedSchool} object={school} isSchool={true} provinceData={provinceData} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}