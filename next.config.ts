import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.axcalle.dev",
        pathname: "/uploads/**",
      },
    ],
  },
  // Rewrites: en producción (Docker), el navegador envía requests al servidor Next.js
  // y este las reenvía internamente a los servicios backend por la red Docker.
  // En desarrollo local, las URLs absolutas en NEXT_PUBLIC_* se usan directamente.
  async rewrites() {
    const apiUrl = process.env.INTERNAL_API_URL || "http://localhost:8000";
    const aiUrl = process.env.INTERNAL_AI_URL || "http://localhost:8002";

    return [
      // REST API: /api/v1/* → backend interno
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
      // GraphQL: /graphql → backend interno
      {
        source: "/graphql",
        destination: `${apiUrl}/graphql`,
      },
      // AI Chatbot: /ai-api/* → microservicio IA interno
      {
        source: "/ai-api/:path*",
        destination: `${aiUrl}/:path*`,
      },
      // Proxy uploads para que se sirvan desde el dominio del frontend
      {
        source: "/uploads/:path*",
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
