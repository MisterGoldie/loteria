"use client";

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/frame-sdk';

// Override window.fetch in Farcaster Mini App environment to prevent CSP errors
function preventCspErrors() {
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
  // @ts-expect-error - Sentry is not typed in the window object
  window.__SENTRY__ = { enabled: false };
}

export function FarcasterLoader() {
  // Use a state to track if we're mounted on the client
  const [isMounted, setIsMounted] = useState(false);
  
  // First effect just to mark component as mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Second effect for Farcaster initialization - only runs after mounting
  useEffect(() => {
    // Skip if not mounted yet (avoids hydration mismatch)
    if (!isMounted) return;
    
    const initializeFarcaster = async () => {
      try {
        // Apply CSP error prevention regardless of environment
        preventCspErrors();
        
        // ALWAYS initialize the SDK first, regardless of environment
        // This ensures the SDK is ready to detect the environment
        try {
          // Initialize the SDK
          await sdk.actions.ready();
          console.log('Farcaster SDK initialized');
        } catch (error) {
          // If ready() fails, it might be because we're not in a Mini App
          // This is expected in standalone mode
          console.log('Farcaster SDK ready() failed, likely not in a Mini App:', error);
        }
        
        // Now check if we're in a Mini App environment
        const isMiniApp = await sdk.isInMiniApp();
        console.log('SDK isInMiniApp() result:', isMiniApp);
        
        // Log additional environment info for debugging
        console.log('Environment info:', {
          isIframe: window !== window.top,
          url: window.location.href,
          hasParentWindow: !!window.parent,
          hasPostMessage: typeof window.postMessage === 'function',
          userAgent: navigator.userAgent
        });
        
        if (isMiniApp) {
          console.log('Running in Farcaster Mini App mode');
          // SDK is already initialized above
        } else {
          console.log('Running in standalone website mode');
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
  }, [isMounted]); // Only run after mounting

  // This component doesn't render anything visible
  return null;
}
