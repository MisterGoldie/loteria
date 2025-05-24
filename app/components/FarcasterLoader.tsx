"use client";

import { useEffect } from 'react';
import { sdk } from '@farcaster/frame-sdk';

export function FarcasterLoader() {
  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        // Check if we're in a Farcaster Mini App environment
        const isFarcasterMiniApp = typeof window !== 'undefined' && 
          window.location.href.includes('warpcast.com') || 
          window.location.href.includes('farcaster.xyz');

        if (isFarcasterMiniApp) {
          // Call ready when the interface is ready to be displayed
          // This dismisses the splash screen
          await sdk.actions.ready();
          console.log('Farcaster Mini App ready');
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
