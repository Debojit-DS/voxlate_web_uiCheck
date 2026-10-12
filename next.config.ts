import type { NextConfig } from "next";

// API traffic is handled at runtime by app/api/[...path]/route.ts.
// Changing the upstream on the server no longer requires rebuilding rewrites.
const nextConfig: NextConfig = {};
export default nextConfig;
