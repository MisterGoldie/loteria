"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
  useClose,
  useViewProfile,
  useNotification,
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
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "./components/DemoComponents";
import { Icon } from "./components/DemoComponents";
import { Home } from "./components/DemoComponents";
import { Features } from "./components/DemoComponents";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [notificationSent, setNotificationSent] = useState(false);

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();
  const close = useClose();
  const viewProfile = useViewProfile();
  const sendNotification = useNotification();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const result = await addFrame();
    if (result) {
      console.log('Frame added:', result.url, result.token);
      setFrameAdded(true);
    }
  }, [addFrame]);

  const handleViewProfile = useCallback(() => {
    viewProfile();
  }, [viewProfile]);

  const handleSendNotification = useCallback(async () => {
    if (notificationSent) return;

    try {
      await sendNotification({
        title: 'Loteria Update! 🎮',
        body: 'Join us for a new game of Loteria!'
      });
      setNotificationSent(true);
      setTimeout(() => setNotificationSent(false), 30000);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }, [sendNotification, notificationSent]);

  const saveFrameButton = useMemo(() => {
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
  }, [context, frameAdded, handleAddFrame]);

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-3 h-11">
          <div>
            <div className="flex items-center space-x-2">
              <Wallet className="z-10">
                <ConnectWallet>
                  <Name className="text-inherit" />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <Address />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          </div>
          <div className="pr-1 flex items-center justify-end">
            {saveFrameButton}
            <button
              type="button"
              className="cursor-pointer bg-transparent font-semibold text-sm pl-2"
              onClick={close}
            >
              CLOSE
            </button>
            <button
              type="button"
              onClick={handleViewProfile}
              className="cursor-pointer bg-transparent font-semibold text-sm pl-2"
            >
              PROFILE
            </button>
            {context?.client.added && (
              <button
                type="button"
                onClick={handleSendNotification}
                disabled={notificationSent}
                className="cursor-pointer bg-transparent font-semibold text-sm pl-2 disabled:opacity-50"
              >
                {notificationSent ? 'SENT' : 'NOTIFY'}
              </button>
            )}
          </div>
        </header>

        <main className="flex-1">
          {activeTab === "home" && <Home setActiveTab={setActiveTab} />}
          {activeTab === "features" && <Features setActiveTab={setActiveTab} />}
        </main>

        <footer className="mt-2 pt-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--ock-text-foreground-muted)] text-xs"
            onClick={() => openUrl("https://base.org/builders/minikit")}
          >
            Built on Base with MiniKit
          </Button>
        </footer>
      </div>
    </div>
  );
}
