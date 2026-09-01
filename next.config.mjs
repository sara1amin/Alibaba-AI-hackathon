/**
 * Static export, so the dashboard can be served from GitHub Pages with no
 * server. Everything in this app is client-rendered against the recorded run
 * (or a gateway, when one is configured), so nothing is lost by exporting.
 *
 * BASE_PATH is set by the Pages workflow to the repository name, because a
 * project site is served from a sub-path, not the domain root. Left empty
 * locally so `npm run dev` still serves from `/`.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  // Emit `route/index.html` rather than `route.html`, which is what Pages'
  // static file server expects when resolving a directory URL.
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
};
export default nextConfig;
