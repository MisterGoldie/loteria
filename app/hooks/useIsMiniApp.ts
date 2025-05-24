"use client";

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/frame-sdk';

/**
 * Hook to detect if the app is running in a Farcaster Mini App environment
 * Based on: https://miniapps.farcaster.xyz/docs/sdk/is-in-mini-app
 */
export function useIsMiniApp() {
  const [isMiniApp, setIsMiniApp] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkIsMiniApp = async () => {
      try {
        // Use the isInMiniApp method from the updated Farcaster SDK
        const result = await sdk.isInMiniApp();
        setIsMiniApp(result);
      } catch (error) {
        console.error('Error checking if in Mini App:', error);
        setIsMiniApp(false);
      }
    };
    
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      checkIsMiniApp();
    }
  }, []);
  
  return isMiniApp;
}
