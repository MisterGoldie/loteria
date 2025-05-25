"use client";

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/frame-sdk';

// Create a global state to ensure all components use the same Mini App status
let globalIsMiniApp = false;
let isDetectionComplete = false;

/**
 * Hook to detect if the app is running in a Farcaster Mini App environment
 * Uses the official SDK method for detection
 */
export function useIsMiniApp() {
  // Start with the current global state
  const [isMiniApp, setIsMiniApp] = useState(globalIsMiniApp);
  
  useEffect(() => {
    // If detection is already complete, use the global value
    if (isDetectionComplete) {
      setIsMiniApp(globalIsMiniApp);
      return;
    }
    
    // This code only runs on the client after hydration is complete
    const checkIsMiniApp = async () => {
      try {
        // Use the official SDK method to check if we're in a Mini App environment
        const isMini = await sdk.isInMiniApp();
        console.log('useIsMiniApp hook - SDK isInMiniApp() result:', isMini);
        
        // Update both local and global state
        globalIsMiniApp = isMini;
        isDetectionComplete = true;
        setIsMiniApp(isMini);
        
        // Log additional environment info
        console.log('Mini App Environment Details:', {
          isInIframe: window !== window.top,
          url: window.location.href,
          hasParentWindow: !!window.parent,
          hasPostMessage: typeof window.postMessage === 'function'
        });
      } catch (error) {
        console.error('Error checking if in Mini App:', error);
        globalIsMiniApp = false;
        isDetectionComplete = true;
        setIsMiniApp(false);
      }
    };
    
    checkIsMiniApp();
  }, []);
  
  return isMiniApp;
}
