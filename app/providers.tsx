"use client";

import { type ReactNode, useEffect } from "react";
import { base } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";

// Handle provider request errors for unsupported methods
const patchEthereumProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    const originalRequest = window.ethereum.request;
    window.ethereum.request = async function (args: {method: string, params?: any[]}) {
      try {
        return await originalRequest.call(this, args);
      } catch (error) {
        // For wallet_getCapabilities specifically, return a default response
        if (args.method === 'wallet_getCapabilities') {
          console.log('Farcaster wallet does not support wallet_getCapabilities, returning default capabilities');
          return { capabilities: {} };
        }
        throw error;
      }
    };
  }
};

export function Providers(props: { children: ReactNode }) {
  useEffect(() => {
    // Apply the patch after component mounts
    patchEthereumProvider();
  }, []);

  return (
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
  );
}
