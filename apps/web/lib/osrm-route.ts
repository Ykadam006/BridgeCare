/** [lat, lng] tuples for Leaflet */
export type LatLngTuple = [number, number];

/**
 * Fetches a road route between two points using an OSRM-compatible API.
 * Default host is the public OSRM demo — OK for development; use your own OSRM for production.
 */
export async function fetchOsrmRoute(from: LatLngTuple, to: LatLngTuple): Promise<LatLngTuple[]> {
  const rawBase =
    typeof process.env.NEXT_PUBLIC_OSRM_URL === "string" && process.env.NEXT_PUBLIC_OSRM_URL.length > 0
      ? process.env.NEXT_PUBLIC_OSRM_URL
      : "https://router.project-osrm.org";
  const base = rawBase.replace(/\/$/, "");
  const profile =
    typeof process.env.NEXT_PUBLIC_OSRM_PROFILE === "string" && process.env.NEXT_PUBLIC_OSRM_PROFILE.length > 0
      ? process.env.NEXT_PUBLIC_OSRM_PROFILE
      : "driving";

  const [lat1, lng1] = from;
  const [lat2, lng2] = to;
  const url = `${base}/route/v1/${profile}/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Route request failed (${res.status})`);
  const data = (await res.json()) as {
    code?: string;
    routes?: { geometry?: { coordinates?: [number, number][] } }[];
  };

  if (data.code !== "Ok" || !data.routes?.[0]?.geometry?.coordinates?.length) {
    return [];
  }

  const coordinates = data.routes[0].geometry.coordinates;
  return coordinates.map(([lng, lat]) => [lat, lng] as LatLngTuple);
}
