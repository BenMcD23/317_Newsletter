import type { NextConfig } from "next";

// This site is retired: every newsletter issue now lives on the squadron
// website, which the SMS publishes to directly. These redirects keep links
// already shared with parents (issue pages and PDF downloads) working.
// Next.js checks redirects before pages and public/ files, so nothing below
// is served any more.
const WEBSITE = "https://www.317atc.co.uk";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/", destination: `${WEBSITE}/newsletter`, permanent: true },
      { source: "/archive", destination: `${WEBSITE}/newsletter`, permanent: true },
      { source: "/newsletter/:id", destination: `${WEBSITE}/newsletter/:id`, permanent: true },
      { source: "/newsletters/:file", destination: `${WEBSITE}/newsletters/:file`, permanent: true },
    ];
  },
};

export default nextConfig;
