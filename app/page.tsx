"use client";

import {
  useMiniKit,
  useAddFrame,
  useViewProfile,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Button, Icon, Home, Features } from "./components/DemoComponents";
import { useIsMiniApp } from "./hooks/useIsMiniApp";
import { fetchFarcasterUser } from "./utils/neynar";
import { SvgFixer } from "./components/SvgFixer";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const addFrame = useAddFrame();
  const viewProfile = useViewProfile();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const isMiniApp = useIsMiniApp();
  const [isMounted, setIsMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use useEffect to mark component as mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Track client-side rendering
  const [isClient, setIsClient] = useState(false);
  
  // Handler for viewing the user's profile
  const handleViewProfile = useCallback(() => {
    viewProfile();
  }, [viewProfile]);

  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Wait for both Mini App detection and context to be available before initializing
  useEffect(() => {
    if (!isClient) return;
    
    // Only proceed if we have a definitive answer on isMiniApp
    // This ensures we don't render with the initial false value
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000); // Wait 1 second to ensure SDK has time to initialize
    
    return () => clearTimeout(timer);
  }, [isMiniApp, context, isClient]);

  // First effect for Farcaster initialization
  useEffect(() => {
    // Only run after client-side hydration is complete
    if (!isClient) return;
    
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady, isMiniApp, isClient]);

  const handleAddFrame = useCallback(async () => {
    try {
      // Use the OnchainKit addFrame function
      const result = await addFrame();
      if (result) {
        // Frame added successfully
        setFrameAdded(true);
      }
    } catch (error) {
      console.error('Error adding frame:', error);
      setFrameAdded(false);
    }
  }, [addFrame]);

  // We'll keep this for future use but comment it out to avoid the unused variable error
  /* const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]); */

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      {/* Add SvgFixer to fix invalid SVG attributes */}
      <SvgFixer />
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-3 h-11">
          <div>
            <div className="flex items-center space-x-2">
              <Wallet className="z-10">
                <ConnectWallet>
                  {/* Show Farcaster profile picture and username in the top right */}
                  <div className="flex items-center space-x-2">
                    {context?.user?.pfpUrl ? (
                      <img 
                        src={context.user.pfpUrl}
                        alt={context.user.displayName || 'Profile'}
                        width="24"
                        height="24"
                        className="rounded-full"
                      />
                    ) : context?.user?.username ? (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        {context.user.username.substring(0, 1).toUpperCase()}
                      </div>
                    ) : null}
                    
                    {context?.user?.username ? (
                      <span className="text-inherit font-medium">{context.user.username}</span>
                    ) : (
                      <Name className="text-inherit" />
                    )}
                  </div>
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    {/* ULTRA SIMPLIFIED APPROACH - DIRECT HTML */}
                    {context?.user?.pfpUrl ? (
                      <div className="flex justify-center mb-2">
                        {/* Using direct HTML img tag instead of Next.js Image component */}
                        <img 
                          src={context.user.pfpUrl}
                          alt={context.user.displayName || 'Profile'}
                          width="64"
                          height="64"
                          className="rounded-full"
                        />
                      </div>
                    ) : context?.user?.fid ? (
                      <div className="flex justify-center mb-2">
                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                          {context.user.displayName?.substring(0, 2) || context.user.username?.substring(0, 2) || 'FC'}
                        </div>
                      </div>
                    ) : (
                      <Avatar />
                    )}
                    {/* Show Farcaster display name and username instead of wallet name */}
                    {context?.user ? (
                      <div className="flex flex-col items-center text-center mb-2">
                        <span className="font-bold text-lg">{context.user.displayName || context.user.username}</span>
                        <span className="text-sm text-gray-500">@{context.user.username}</span>
                      </div>
                    ) : (
                      <>
                        <Name />
                        <Address />
                      </>
                    )}
                    <EthBalance />
                  </Identity>
                  <div className="px-4 py-2 border-t border-[var(--app-gray)]">
                    {isMounted && isInitialized && (
                      <button
                        type="button"
                        onClick={handleViewProfile}
                        className="cursor-pointer bg-transparent font-semibold text-sm w-full text-left py-2 text-[#0052FF] hover:opacity-80"
                      >
                        View Farcaster Profile
                      </button>
                    )}
                  </div>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          </div>
          {/* Save Frame button removed from UI but logic kept intact */}
          <div></div>
        </header>

        <main className="flex-1">
          {activeTab === "home" && <Home setActiveTab={setActiveTab} />}
          {activeTab === "features" && <Features setActiveTab={setActiveTab} />}
        </main>

        <footer className="mt-2 pt-4 flex justify-center">
          {/* Footer content removed */}
        </footer>
      </div>
    </div>
  );
}
