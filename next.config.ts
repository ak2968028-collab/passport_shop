import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep these native/ONNX packages out of the webpack bundle — they must run
  // in the real Node.js runtime, not in the Next.js server bundle.
  serverExternalPackages: [
    "@imgly/background-removal-node",
    "sharp",
    "onnxruntime-node",
  ],
};

export default nextConfig;
