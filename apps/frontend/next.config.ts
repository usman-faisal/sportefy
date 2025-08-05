import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "") || "",
        port: "",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
