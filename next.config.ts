import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for hosting on providers like Surge/Netlify/GitHub Pages
  // that only serve static files. Everything in this app runs client-side
  // (localStorage-backed), so a static export works with no server needed.
  // trailingSlash emits e.g. finder/index.html instead of finder.html, so
  // plain static file hosts resolve /finder without extension rewriting.
  ...(process.env.STATIC_EXPORT === "true" ? { output: "export", trailingSlash: true } : {}),
};

export default nextConfig;
