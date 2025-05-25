"use client";

import { useEffect } from 'react';
import { sdk } from '@farcaster/frame-sdk';

export function FarcasterLoader() {
  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        // Check if we're in a Farcaster Mini App environment using multiple detection methods
        const url = new URL(window.location.href);
        const isMiniApp = 
          // Check for query parameter
          url.searchParams.get('miniApp') === 'true' ||
          // Check for Farcaster domains
          window.location.href.includes('warpcast.com') || 
          window.location.href.includes('farcaster.xyz');

        if (isMiniApp) {
          // Lazy-load the SDK only when needed in mini app mode
          console.log('Running in Mini App mode');
          // Call ready when the interface is ready to be displayed
          // This dismisses the splash screen
          await sdk.actions.ready();
          console.log('Farcaster Mini App ready');
        } else {
          console.log('Running in standalone website mode');
          // Add any standalone website-specific initialization here
        }
      } catch (error) {
        console.error('Error initializing Farcaster Mini App:', error);
      }
    };

    // Small delay to ensure the app has had time to render
    const timer = setTimeout(() => {
      initializeFarcaster();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything visible
  return null;
}
