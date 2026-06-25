import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (memory wall photos)
      { protocol: "https", hostname: "*.supabase.co" },
      // QR code generator (admin memory page)
      { protocol: "https", hostname: "api.qrserver.com" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  turbopack: {
    root: __dirname,
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff"          },
          { key: "X-Frame-Options",           value: "DENY"             },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(self), geolocation=()" },
        ],
      },
    ];
  },
};

// withSentryConfig wraps the build to upload source maps and enable Sentry.
// When ENABLE_SENTRY is not "true", the SDK never initialises (see sentry.*.config.ts),
// but the build wrapper itself is always present — it is a no-op when DSN is absent.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Upload source maps only in CI/CD to avoid leaking them locally.
  // Source maps are deleted from the Vercel output after upload.
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
  // Disable automatic instrumentation we don't need.
  autoInstrumentServerFunctions: false,
});
