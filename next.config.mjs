/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silence warnings
  // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  
  // Add headers to allow Farcaster to embed the site
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' *.farcaster.xyz *.warpcast.com *.coinbase.com godaddy.com *.godaddy.com",
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM https://warpcast.com https://farcaster.xyz',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
