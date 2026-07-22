import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.103'],
  devIndicators: {
    appIsrStatus: false,
  } as any,
}

export default nextConfig
