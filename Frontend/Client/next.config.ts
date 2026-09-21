import type { NextConfig } from "next";

const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000");
const apiIsLocal = ["localhost", "127.0.0.1", "[::1]"].includes(apiUrl.hostname);

const nextConfig: NextConfig = {
  // The syllabus route reads the logo from disk when generating a PDF; keep it in the route's server bundle.
  outputFileTracingIncludes: {
    "/courses/\\[category\\]/\\[slug\\]/syllabus": ["./public/images/brand/logo-mark.png"],
  },
  images: {
    // Catalogue images are served by the backend (`/images/*` seeds, `/uploads/*` admin uploads).
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: "/**",
      },
    ],
    // The optimizer refuses private/loopback upstreams by default. Allow it for local
    // development, or opt in explicitly when the API lives on a private network.
    dangerouslyAllowLocalIP: apiIsLocal || process.env.IMAGES_ALLOW_LOCAL_IP === "true",
  },
};

export default nextConfig;
