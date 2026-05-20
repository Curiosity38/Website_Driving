import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repositoryName = "Website_Driving";

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: "export" as const,
        basePath: `/${repositoryName}`,
        assetPrefix: `/${repositoryName}/`,
        images: {
          unoptimized: true
        },
        trailingSlash: true
      }
    : {}),
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb"
    }
  }
};

export default nextConfig;
