import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BridgeCare — Your calm health guide",
    short_name: "BridgeCare",
    description: "Understand urgency, care options, cost direction, and next steps.",
    start_url: "/check", // the home-screen icon opens straight into a check-in
    display: "standalone",
    background_color: "#f3fbfd",
    theme_color: "#0077b6",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
