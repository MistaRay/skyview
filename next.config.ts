import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // skyhelper-networth reads bundled JSON/backup files relative to its own
  // module path, which breaks when bundled — keep it external.
  serverExternalPackages: ["skyhelper-networth"],
};

export default nextConfig;
