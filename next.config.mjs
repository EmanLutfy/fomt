/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // The old terminal page is now the Live Tape.
    return [{ source: "/terminal", destination: "/tape", permanent: true }];
  },
};

export default nextConfig;
