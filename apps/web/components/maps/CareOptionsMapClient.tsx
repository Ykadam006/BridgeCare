"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { offsetFromCenter } from "@/lib/geo";
import { providersApi } from "@/lib/api";
import type { CareMapMarkerSpec } from "@/lib/care-map";
import type { CareMapMarker, LocationMode } from "./CareOptionsMap";

export type { CareMapMarker } from "./CareOptionsMap";

const CareOptionsMap = dynamic(() => import("./CareOptionsMap").then((m) => m.CareOptionsMap), {
  ssr: false,
  loading: () => (
    <div
      className="surface h-[min(320px,55vh)] min-h-[240px] w-full animate-pulse rounded-[20px] border-2 border-[#90e0ef]/40 bg-[#f3fbfd]"
      aria-hidden="true"
    />
  ),
});

function MapPlaceholder() {
  return (
    <div
      className="surface h-[min(320px,55vh)] min-h-[240px] w-full animate-pulse rounded-[20px] border-2 border-[#90e0ef]/40 bg-[#f3fbfd]"
      aria-hidden="true"
    />
  );
}

function buildMarkers(center: [number, number], specs: CareMapMarkerSpec[]): CareMapMarker[] {
  return specs.map((s) => {
    const { lat, lng } = offsetFromCenter(center[0], center[1], s.distanceKm, s.bearingDeg);
    return {
      id: s.id,
      rank: s.rank,
      label: s.label,
      subtitle: s.subtitle,
      lat,
      lng,
    };
  });
}

export type { CareMapMarkerSpec } from "@/lib/care-map";

export function CareOptionsMapClient({
  defaultCenter,
  markerSpecs,
  instanceKey,
}: {
  defaultCenter: [number, number];
  markerSpecs: CareMapMarkerSpec[];
  instanceKey?: string;
}) {
  const mapOwnerKey = instanceKey ?? "care-map";
  const [browserReady, setBrowserReady] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [locationMode, setLocationMode] = useState<LocationMode>("demo");
  const [nearby, setNearby] = useState<CareMapMarker[]>([]);

  useEffect(() => {
    setBrowserReady(true);
    return () => setBrowserReady(false);
  }, [mapOwnerKey]);

  const defaultLat = defaultCenter[0];
  const defaultLng = defaultCenter[1];

  useEffect(() => {
    setMapCenter([defaultLat, defaultLng]);
    setLocationMode("demo");
  }, [mapOwnerKey, defaultLat, defaultLng]);

  // Illustrative pins only around the demo point; at a real location show only real places.
  const demoMarkers = useMemo(() => buildMarkers(mapCenter, markerSpecs), [mapCenter, markerSpecs]);
  const markers = locationMode === "device" ? nearby : demoMarkers;

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationMode("denied");
      return;
    }
    setLocationMode("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setMapCenter([lat, lon]);
        setLocationMode("device");
        setNearby([]);
        providersApi
          .search({ lat, lon })
          .then(({ providers }) =>
            setNearby(
              providers
                .filter((p) => p.lat != null && p.lon != null)
                .slice(0, 8)
                .map((p, i) => ({
                  id: p.id,
                  rank: i + 1,
                  label: p.name,
                  subtitle: `${p.distance_km ?? "?"} km · ${p.type.replace("_", " ")}`,
                  lat: p.lat!,
                  lng: p.lon!,
                }))
            )
          )
          .catch(() => setNearby([]));
      },
      () => setLocationMode("denied"),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 }
    );
  }, []);

  const useDemoArea = useCallback(() => {
    setMapCenter([defaultLat, defaultLng]);
    setLocationMode("demo");
  }, [defaultLat, defaultLng]);

  if (!browserReady) {
    return <MapPlaceholder />;
  }

  return (
    <CareOptionsMap
      key={mapOwnerKey}
      center={mapCenter}
      markers={markers}
      locationMode={locationMode}
      onUseMyLocation={requestLocation}
      onUseDemoArea={useDemoArea}
    />
  );
}
