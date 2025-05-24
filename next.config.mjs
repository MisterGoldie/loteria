/** @type {import('next').NextConfig} */
const nextConfig = {
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
            value: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://*.walletconnect.com https://*.walletconnect.org https://*.farcaster.xyz https://*.warpcast.com https://*.coinbase.com https://*.base.org https://*.merkle.io https://*.privy.io https://*.privy.systems https://cloudflareinsights.com *; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline'; font-src * data:; frame-ancestors 'self' *.farcaster.xyz farcaster.xyz *.warpcast.com warpcast.com *.coinbase.com coinbase.com *.base.org *.merkle.io godaddy.com *.godaddy.com; worker-src * blob:;",
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
