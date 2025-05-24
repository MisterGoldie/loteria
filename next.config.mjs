/** @type {import('next').NextConfig} */
const nextConfig = {
  // Handle www to non-www redirects
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.loteriagame.xyz',
          },
        ],
        destination: 'https://loteriagame.xyz/:path*',
        permanent: true,
      },
    ];
  },
  // Silence warnings
  // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  
  // Add headers to allow Farcaster to embed the site and fix CSP issues
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' wss://*.walletlink.org wss://* https://*.walletlink.org https://*.walletconnect.com https://explorer-api.walletconnect.com https://www.walletlink.org https://*.coinbase.com https://farcaster.xyz https://client.farcaster.xyz https://warpcast.com https://client.warpcast.com https://wrpcd.net https://*.wrpcd.net https://privy.farcaster.xyz https://privy.warpcast.com https://auth.privy.io https://*.rpc.privy.systems https://cloudflareinsights.com https://*; style-src 'self' 'unsafe-inline' https://*; img-src 'self' data: blob: https:; font-src 'self' data:; frame-ancestors 'self' *.farcaster.xyz farcaster.xyz *.warpcast.com warpcast.com *.coinbase.com coinbase.com godaddy.com *.godaddy.com; form-action 'self';",
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
