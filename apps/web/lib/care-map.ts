/** Serializable inputs to place demo care pins relative to a map center (demo or device GPS). */
export type CareMapMarkerSpec = {
  id: string;
  rank: number;
  label: string;
  subtitle: string;
  distanceKm: number;
  bearingDeg: number;
};
