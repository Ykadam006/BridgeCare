import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@bridgecare/ui"],
  /**
   * Rewrites to NEXT_PUBLIC_API_URL (e.g. /api/backend → localhost:8000) use an HTTP proxy
   * with a short default timeout. Triage follow-up waits on the LLM provider chain and can
   * exceed that, which surfaces as ECONNRESET / "socket hang up" in the Next dev server.
   */
  experimental: {
    proxyTimeout: 180_000,
    // Requests pass through proxy.ts, which buffers bodies (default 10 MB). The API accepts
    // 10 MB documents, so leave room for the multipart envelope.
    proxyClientMaxBodySize: "12mb",
  },
  images: {
    remotePatterns: [{ hostname: "*.supabase.co" }],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return [
      {
        source: "/api/backend/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
