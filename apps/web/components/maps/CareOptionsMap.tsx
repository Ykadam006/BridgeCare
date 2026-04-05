"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { LocateFixed, MapPinned, MapPinOff, Route, X } from "lucide-react";
import { fetchOsrmRoute, type LatLngTuple } from "@/lib/osrm-route";

export type CareMapMarker = {
  id: string;
  rank: number;
  label: string;
  subtitle?: string;
  lat: number;
  lng: number;
};

export type LocationMode = "demo" | "device" | "denied" | "loading";

// Keyless raster tiles. (CARTO now serves "API KEY REQUIRED" tiles; OSM's own servers block apps.)
// ponytail: Esri's free basemap is fine for non-commercial use; a commercial launch needs an
// ArcGIS key or a tile plan — set NEXT_PUBLIC_MAP_TILE_URL / _ATTRIBUTION to switch.
const DEFAULT_TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
const DEFAULT_TILE_ATTRIB = 'Tiles &copy; <a href="https://www.esri.com">Esri</a> — Esri, HERE, Garmin, OpenStreetMap contributors';

const tileUrl =
  typeof process.env.NEXT_PUBLIC_MAP_TILE_URL === "string" && process.env.NEXT_PUBLIC_MAP_TILE_URL.length > 0
    ? process.env.NEXT_PUBLIC_MAP_TILE_URL
    : DEFAULT_TILE_URL;

const tileAttrib =
  typeof process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION === "string" &&
  process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION.length > 0
    ? process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION
    : DEFAULT_TILE_ATTRIB;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildMarkerPopupContent(m: CareMapMarker, onRouteClick: (marker: CareMapMarker) => void): HTMLElement {
  const wrap = L.DomUtil.create("div");
  wrap.style.minWidth = "148px";

  const header = L.DomUtil.create("div", "", wrap);
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.gap = "8px";
  header.innerHTML = `<span style="display:flex;width:20px;height:20px;align-items:center;justify-content:center;border-radius:9999px;background:#0077b6;font-size:10px;font-weight:700;color:#fff">${m.rank}</span><span style="font-size:12px;font-weight:700;color:#03045e">${escapeHtml(m.label)}</span>`;

  if (m.subtitle) {
    const sub = L.DomUtil.create("p", "", wrap);
    sub.style.margin = "4px 0 0";
    sub.style.fontSize = "11px";
    sub.style.color = "#6b7280";
    sub.textContent = m.subtitle;
  }

  const btn = L.DomUtil.create("button", "", wrap);
  btn.type = "button";
  btn.textContent = "Show full route";
  btn.style.marginTop = "10px";
  btn.style.width = "100%";
  btn.style.borderRadius = "12px";
  btn.style.border = "1px solid #90e0ef";
  btn.style.background = "#f3fbfd";
  btn.style.padding = "6px 10px";
  btn.style.fontSize = "11px";
  btn.style.fontWeight = "600";
  btn.style.color = "#0077b6";
  btn.style.cursor = "pointer";

  L.DomEvent.on(btn, "click", (e) => {
    L.DomEvent.stopPropagation(e);
    L.DomEvent.preventDefault(e);
    onRouteClick(m);
  });

  return wrap;
}

function CareOptionsLeafletPane({
  center,
  sorted,
  locationMode,
  userHint,
  routeLine,
  onRequestRoute,
}: {
  center: [number, number];
  sorted: CareMapMarker[];
  locationMode: LocationMode;
  userHint: string;
  routeLine: LatLngTuple[] | null;
  onRequestRoute: (m: CareMapMarker) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const routeHandlerRef = useRef(onRequestRoute);
  routeHandlerRef.current = onRequestRoute;

  const routeActive = Boolean(routeLine && routeLine.length >= 2);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, {
      scrollWheelZoom: false,
      zoomControl: false,
    }).setView(center, 14);

    mapRef.current = map;
    L.tileLayer(tileUrl, { attribution: tileAttrib }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    const routeLayer = L.layerGroup().addTo(map);
    routeLayerRef.current = routeLayer;

    return () => {
      routeLayerRef.current = null;
      markersLayerRef.current = null;
      mapRef.current = null;
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    L.circleMarker(center, {
      radius: 18,
      color: "#0077b6",
      fillColor: "#00b4d8",
      fillOpacity: 0.12,
      weight: 0,
    }).addTo(markersLayer);

    const refTitle = locationMode === "device" ? "Your area" : "Reference point";
    const refPopup = `<div style="min-width:140px"><span style="display:block;font-size:12px;font-weight:600;color:#03045e">${escapeHtml(refTitle)}</span><p style="margin:4px 0 0;font-size:11px;color:#6b7280">${escapeHtml(userHint)}</p></div>`;

    L.circleMarker(center, {
      radius: 7,
      color: "#ffffff",
      fillColor: "#0077b6",
      fillOpacity: 1,
      weight: 3,
    })
      .addTo(markersLayer)
      .bindPopup(refPopup);

    const onRoute = (m: CareMapMarker) => routeHandlerRef.current(m);

    for (const m of sorted) {
      L.circleMarker([m.lat, m.lng], {
        radius: 11,
        color: "#ffffff",
        fillColor: "#0077b6",
        fillOpacity: 1,
        weight: 2,
      })
        .addTo(markersLayer)
        .bindPopup(buildMarkerPopupContent(m, onRoute));
    }

    if (sorted.length === 0) {
      map.setView(center, 14);
    } else if (!routeActive) {
      const pts: L.LatLngExpression[] = [center, ...sorted.map((m) => [m.lat, m.lng] as L.LatLngExpression)];
      const b = L.latLngBounds(pts);
      map.fitBounds(b, { padding: [40, 40], maxZoom: 15, animate: true });
    }
  }, [center, sorted, locationMode, userHint, routeActive]);

  useEffect(() => {
    const map = mapRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !routeLayer) return;

    routeLayer.clearLayers();
    if (!routeLine || routeLine.length < 2) return;

    const poly = L.polyline(routeLine as L.LatLngExpression[], {
      color: "#0077b6",
      weight: 5,
      opacity: 0.9,
      lineJoin: "round",
      lineCap: "round",
    }).addTo(routeLayer);

    map.fitBounds(poly.getBounds(), { padding: [52, 52], maxZoom: 16, animate: true });
  }, [routeLine]);

  return (
    <div
      ref={containerRef}
      className="z-0 h-full w-full [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:bg-white/90"
    />
  );
}

export function CareOptionsMap({
  center,
  markers,
  locationMode = "demo",
  onUseMyLocation,
  onUseDemoArea,
}: {
  center: [number, number];
  markers: CareMapMarker[];
  locationMode?: LocationMode;
  onUseMyLocation?: () => void;
  onUseDemoArea?: () => void;
}) {
  const sorted = useMemo(
    () => [...markers].sort((a, b) => a.rank - b.rank),
    [markers]
  );

  const [routeTarget, setRouteTarget] = useState<CareMapMarker | null>(null);
  const [routeLine, setRouteLine] = useState<LatLngTuple[] | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const clearRoute = useCallback(() => {
    setRouteTarget(null);
    setRouteLine(null);
    setRouteError(null);
    setRouteLoading(false);
  }, []);

  const onRequestRoute = useCallback((m: CareMapMarker) => {
    setRouteTarget(m);
  }, []);

  const centerKey = `${center[0].toFixed(5)},${center[1].toFixed(5)}`;

  const [prevCenterKey, setPrevCenterKey] = useState(centerKey);
  if (prevCenterKey !== centerKey) {
    setPrevCenterKey(centerKey);
    setRouteTarget(null);
    setRouteLine(null);
    setRouteError(null);
    setRouteLoading(false);
  }

  /** Single stable dep (fixed array length) for route fetch — avoids Fast Refresh / hook mismatch when deps change shape. */
  const routeFetchKey = routeTarget ? `to:${routeTarget.id}@${centerKey}` : `off@${centerKey}`;

  useEffect(() => {
    if (!routeTarget) {
      setRouteLine(null);
      setRouteError(null);
      setRouteLoading(false);
      return;
    }

    let cancelled = false;
    setRouteLoading(true);
    setRouteError(null);
    setRouteLine(null);

    const from: LatLngTuple = [center[0], center[1]];
    const to: LatLngTuple = [routeTarget.lat, routeTarget.lng];

    fetchOsrmRoute(from, to)
      .then((coords) => {
        if (cancelled) return;
        if (coords.length < 2) {
          setRouteError("No drivable route was found between these points.");
          setRouteLine(null);
        } else {
          setRouteLine(coords);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRouteError("Could not load the route. Try again or check your connection.");
          setRouteLine(null);
        }
      })
      .finally(() => {
        if (!cancelled) setRouteLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [routeFetchKey]);

  const osmLink = useMemo(() => {
    const [lat, lng] = center;
    return `https://www.openstreetmap.org/#map=15/${lat}/${lng}`;
  }, [center]);

  const userHint =
    locationMode === "device"
      ? "Approximate device location — not a precise street address."
      : "Demo reference point — not your GPS.";

  const usingCustomTiles = tileUrl !== DEFAULT_TILE_URL;

  return (
    <section
      className="surface overflow-hidden border-2 border-[#90e0ef]/40 p-0 shadow-card"
      aria-label="Map of nearby care locations"
    >
      <div className="flex flex-col gap-3 border-b border-[#e5e7eb] px-4 py-3">
        <div className="min-w-0">
          <h2 className="font-heading text-sm font-bold text-[#03045e]">Nearby on the map</h2>
          <p className="mt-0.5 text-xs text-[#6b7280]">
            {locationMode === "device"
              ? "Real clinics, pharmacies and hospitals near you from OpenStreetMap — call ahead to confirm hours. "
              : "Demo care pins are placed at the listed distances from the blue dot. Telehealth has no fixed location. "}
            Pick a pin or use the menu to show a full road route from the blue dot.
          </p>
          {locationMode === "denied" && (
            <p className="mt-2 text-xs text-amber-800" role="status">
              Location unavailable. Check browser permissions or use the demo area.
            </p>
          )}
          {sorted.length > 0 && (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <label className="flex min-w-0 flex-1 items-center gap-2 text-xs font-medium text-[#374151]">
                <Route className="h-3.5 w-3.5 shrink-0 text-[#0077b6]" aria-hidden />
                <span className="sr-only">Show road route to</span>
                <select
                  id="care-map-route-to"
                  className="min-w-0 flex-1 rounded-xl border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#374151] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0077b6]"
                  value={routeTarget?.id ?? ""}
                  onChange={(e) => {
                    const id = e.target.value;
                    const m = sorted.find((x) => x.id === id);
                    setRouteTarget(m ?? null);
                  }}
                  disabled={routeLoading}
                  aria-describedby={routeError ? "care-map-route-err" : undefined}
                >
                  <option value="">Route to…</option>
                  {sorted.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.rank}. {m.label}
                    </option>
                  ))}
                </select>
              </label>
              {routeTarget && (
                <button
                  type="button"
                  onClick={clearRoute}
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#374151] transition-colors hover:bg-[#f3fbfd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0077b6]"
                  aria-label="Clear route from map"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                  Clear route
                </button>
              )}
            </div>
          )}
          {routeLoading && (
            <p className="mt-2 text-xs text-[#6b7280]" role="status">
              Loading route…
            </p>
          )}
          {routeError && (
            <p id="care-map-route-err" className="mt-2 text-xs text-amber-800" role="alert">
              {routeError}
            </p>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2">
          {onUseMyLocation && onUseDemoArea && (
            <>
              <button
                type="button"
                onClick={onUseMyLocation}
                disabled={locationMode === "loading"}
                className="inline-flex items-center gap-1 rounded-xl border border-[#90e0ef]/50 bg-[#f3fbfd] px-2.5 py-1.5 text-xs font-semibold text-[#0077b6] transition-colors hover:bg-[#90e0ef]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0077b6] disabled:cursor-wait disabled:opacity-60"
                aria-label="Center map on my location"
              >
                <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />
                {locationMode === "loading" ? "Locating…" : "My location"}
              </button>
              <button
                type="button"
                onClick={onUseDemoArea}
                className="inline-flex items-center gap-1 rounded-xl border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#374151] transition-colors hover:bg-[#f3fbfd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0077b6]"
                aria-label="Use demo map area instead of device location"
              >
                <MapPinOff className="h-3.5 w-3.5 text-[#6b7280]" aria-hidden="true" />
                Demo area
              </button>
            </>
          )}
          <a
            href={osmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-xl border border-[#90e0ef]/50 bg-[#f3fbfd] px-2.5 py-1.5 text-xs font-semibold text-[#0077b6] transition-colors hover:bg-[#90e0ef]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0077b6]"
          >
            <MapPinned className="h-3.5 w-3.5" aria-hidden="true" />
            Open in OSM
          </a>
        </div>
      </div>

      <div className="relative h-[min(320px,55vh)] w-full min-h-[240px] bg-[#f3fbfd]">
        <CareOptionsLeafletPane
          center={center}
          sorted={sorted}
          locationMode={locationMode}
          userHint={userHint}
          routeLine={routeLine}
          onRequestRoute={onRequestRoute}
        />
      </div>

      <p className="border-t border-[#e5e7eb] px-4 py-2.5 text-[11px] leading-relaxed text-[#6b7280]">
        {usingCustomTiles
          ? "Map tiles from your configured provider. Data may be based on OpenStreetMap or other sources — check attribution above. "
          : "Map tiles by Esri (OpenStreetMap and other open data). "}
        Road routes use OSRM with OpenStreetMap data (demo service — not for emergency navigation). Verify
        directions before you travel.{" "}
        <Link href="/safety" className="font-medium text-[#0077b6] hover:text-[#03045e]">
          Safety
        </Link>
      </p>
    </section>
  );
}
