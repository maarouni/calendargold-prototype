/** @type {import('next').NextConfig} */
module.exports = {
  // Oct 19: Cesar renamed Organizations to Connections. Old links keep working.
  async redirects() {
    return [
      { source: "/organizations", destination: "/connections", permanent: true },
      { source: "/organizations/:path*", destination: "/connections/:path*", permanent: true },
    ];
  },
};
