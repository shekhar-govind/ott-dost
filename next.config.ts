import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Beta: remove when the site should be publicly indexable.
  async headers() {
    const noIndex = [
      {
        key: "X-Robots-Tag",
        value: "noindex, nofollow, noarchive",
      },
    ];
    return [
      { source: "/", headers: noIndex },
      { source: "/:path*", headers: noIndex },
    ];
  },
};

export default nextConfig;
