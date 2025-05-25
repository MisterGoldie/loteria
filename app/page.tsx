"use client";

import {
  useMiniKit,
  useAddFrame,
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
import { useAccount } from "wagmi";
import {
  Transaction,
  TransactionButton,
  TransactionToast,
  TransactionToastAction,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionError,
  TransactionResponse,
  TransactionStatusAction,
  TransactionStatusLabel,
  TransactionStatus,
} from "@coinbase/onchainkit/transaction";
import { Button } from "./components/DemoComponents";
import { Icon } from "./components/DemoComponents";
import { LoteriaGame } from "./components/LoteriaComponents";

// Import the Mini App detection hook
import { useIsMiniApp } from "./hooks/useIsMiniApp";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const { address } = useAccount();
  const sendNotification = useNotification();
  
  // Detect if we're in a Farcaster Mini App environment
  const isMiniApp = useIsMiniApp();

  const addFrame = useAddFrame();
  
  // Transaction logic
  const calls = useMemo(() => address
    ? [
        {
          to: address,
          data: "0x" as `0x${string}`,
          value: BigInt(0),
        },
      ]
    : [], [address]);

  const handleTransactionSuccess = useCallback(async (response: TransactionResponse) => {
    const transactionHash = response.transactionReceipts[0].transactionHash;
    console.log(`Transaction successful: ${transactionHash}`);
    
    await sendNotification({
      title: "Transaction Successful!",
      body: `Transaction hash: ${transactionHash}`,
    });
  }, [sendNotification]);
  
  const handleTransactionError = useCallback((error: TransactionError) => {
    console.error("Transaction failed:", error);
  }, []);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
    
    // Log the environment detection for debugging
    if (isMiniApp !== null) {
      console.log(`Running in Farcaster Mini App: ${isMiniApp}`);
    }
  }, [setFrameReady, isFrameReady, isMiniApp]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

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
    <div className="flex flex-col items-center justify-center min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900">
      <div className="fixed top-0 left-0 right-0 px-4 py-3 bg-blue-900/80 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-11">
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
          <div>{saveFrameButton}</div>
        </div>
      </div>
      
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <main className="flex-1 mt-16">
          <LoteriaGame />
          
          {/* Keep transaction functionality available but don't render UI elements that cause errors */}
          <div style={{ display: 'none', visibility: 'hidden' }}>
            {address && (
              <Transaction
                calls={calls}
                onSuccess={handleTransactionSuccess}
                onError={handleTransactionError}
              >
                {/* Render only essential transaction components to avoid unnecessary method calls */}
                <TransactionButton />
              </Transaction>
            )}
          </div>
        </main>

        {/* Footer removed as requested */}
      </div>
    </div>
  );
}
