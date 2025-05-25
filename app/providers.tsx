"use client";

import { type ReactNode } from "react";
import { base } from "wagmi/chains";
import { http, createConfig } from 'wagmi';
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector';
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { WagmiProvider } from "wagmi";

// Configure Wagmi with the Farcaster frame connector
const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    miniAppConnector()
  ]
});

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <MiniKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={base}
        config={{
          appearance: {
            mode: "auto",
            theme: "mini-app-theme",
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
            logo: process.env.NEXT_PUBLIC_ICON_URL,
          },
        }}
      >
        {props.children}
      </MiniKitProvider>
    </WagmiProvider>
  );
}
