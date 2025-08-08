import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: "https",
            hostname: supabaseUrl.replace("https://", ""),
            port: "",
            pathname: "/storage/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
