"use client";

import { useEffect } from 'react';
import { sdk } from '@farcaster/frame-sdk';

// Override window.fetch in Farcaster Mini App environment to prevent CSP errors
function preventCspErrors() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Store the original fetch function
  const originalFetch = window.fetch;
  
  // Override fetch to prevent requests to blocked domains
  window.fetch = function(input, init) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input instanceof Request ? input.url : '';
    
    // Check if the URL is for WalletConnect or other blocked services
    if (url.includes('walletconnect.com') || url.includes('explorer-api.walletconnect.com')) {
      console.log('Blocking request to:', url);
      // Return a resolved promise with empty data to prevent errors
      return Promise.resolve(new Response(JSON.stringify({ wallets: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    
    // Otherwise, use the original fetch
    return originalFetch(input, init);
  };
  
  // Also disable Sentry error reporting which can cause issues
  // @ts-ignore
  window.__SENTRY__ = { enabled: false };
}

export function FarcasterLoader() {
  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        // Check if we're in a Farcaster Mini App environment
        const url = new URL(window.location.href);
        const isMiniApp = 
          url.searchParams.get('miniApp') === 'true' ||
          window.location.href.includes('warpcast.com') || 
          window.location.href.includes('farcaster.xyz');

        if (isMiniApp) {
          // Apply CSP error prevention in Mini App mode
          preventCspErrors();
          
          console.log('Running in Farcaster Mini App mode');
          // Initialize the Farcaster SDK
          await sdk.actions.ready();
          console.log('Farcaster Mini App ready');
        } else {
          console.log('Running in standalone website mode');
          // No need to call ready() in standalone mode
        }
      } catch (error) {
        console.error('Error initializing Farcaster Mini App:', error);
      }
    };

    // Small delay to ensure the app has time to render
    const timer = setTimeout(() => {
      initializeFarcaster();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything visible
  return null;
}
