import { ImageResponse } from "next/og";

// Same mark as the site header: white Lucide heart on brand blue. Used for the favicon,
// the Android install icon (via manifest.ts) and, through apple-icon.tsx, iOS.
export function logo(px: number) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0077b6" }}>
        <svg width={px * 0.55} height={px * 0.55} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </div>
    ),
    { width: px, height: px }
  );
}

const SIZES = [32, 192, 512];

export function generateImageMetadata() {
  return SIZES.map((s) => ({ id: String(s), size: { width: s, height: s }, contentType: "image/png" }));
}

export default async function Icon({ id }: { id: Promise<string> }) {
  return logo(Number(await id));
}
