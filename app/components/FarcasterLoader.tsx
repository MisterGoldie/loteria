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
    
    // Block all MetaMask and WalletConnect requests
    if (url.includes('walletconnect.com') || 
        url.includes('explorer-api.walletconnect.com') || 
        url.includes('metamask') || 
        url.includes('infura') ||
        url.includes('ethereum')) {
      console.log('Blocking wallet request to:', url);
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
  
  // Safely block MetaMask detection without trying to redefine properties
  try {
    // Check if the ethereum property exists and if it's configurable
    const ethereumDesc = Object.getOwnPropertyDescriptor(window, 'ethereum');
    
    if (!ethereumDesc) {
      // Property doesn't exist yet, so we can define it
      Object.defineProperty(window, 'ethereum', {
        value: undefined,
        configurable: true,
        writable: false
      });
    } else if (ethereumDesc.configurable) {
      // Property exists but is configurable, so we can redefine it
      Object.defineProperty(window, 'ethereum', {
        value: undefined,
        configurable: true,
        writable: false
      });
    } else {
      // Property exists but isn't configurable, so we'll use a different approach
      console.log('ethereum property already exists and is not configurable');
      
      // Try to intercept calls to ethereum methods
      if (window.ethereum) {
        const originalEthereum = window.ethereum;
        const mockEthereum = {
          // Return empty values for any ethereum method calls
          request: () => Promise.resolve([]),
          enable: () => Promise.resolve([]),
          send: () => Promise.resolve([]),
          sendAsync: () => Promise.resolve([]),
          on: () => {},
          removeListener: () => {}
        };
        
        // Try to replace ethereum with our mock
        try {
          window.ethereum = mockEthereum;
        } catch (e) {
          console.log('Could not replace ethereum object:', e);
        }
      }
    }
  } catch (error) {
    console.log('Error handling ethereum property:', error);
  }
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
