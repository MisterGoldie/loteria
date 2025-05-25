"use client";

import { useEffect, useState } from 'react';

/**
 * Hook to detect if the app is running in a Farcaster Mini App environment
 * Modified to avoid hydration errors
 */
export function useIsMiniApp() {
  // Start with false to ensure consistent server/client initial render
  const [isMiniApp, setIsMiniApp] = useState(false);
  
  useEffect(() => {
    // This code only runs on the client after hydration is complete
    const checkIsMiniApp = () => {
      try {
        const url = new URL(window.location.href);
        const isMini = 
          url.searchParams.get('miniApp') === 'true' ||
          window.location.href.includes('warpcast.com') || 
          window.location.href.includes('farcaster.xyz');
        
        setIsMiniApp(isMini);
      } catch (error) {
        console.error('Error checking if in Mini App:', error);
        setIsMiniApp(false);
      }
    };
    
    checkIsMiniApp();
  }, []);
  
  return isMiniApp;
}
