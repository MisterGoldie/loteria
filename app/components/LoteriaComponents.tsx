"use client";

import { useState, ReactNode, useCallback, useMemo, useEffect } from "react";
import { Button, Icon } from "./DemoComponents";
import { useNotification } from "@coinbase/onchainkit/minikit";
import { useAccount } from 'wagmi';
import { parseUnits, encodeFunctionData } from 'viem';
import { sdk } from '@farcaster/frame-sdk';
import Link from 'next/link';

// Card component since it's not exported from DemoComponents
type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

function Card({
  title,
  children,
  className = "",
  onClick,
}: CardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`bg-[#FFEB3B]/10 backdrop-blur-md rounded-xl shadow-lg border-2 border-[#FFD700] overflow-hidden transition-all hover:shadow-xl ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
    >
      {title && (
        <div className="px-5 py-3 border-b-2 border-[#FFD700] bg-[#E53935]/20">
          <h3 className="text-xl font-bold text-[#FFD700] uppercase tracking-wider text-center">
            {title}
          </h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

// Sample Lotería cards - in a real implementation, these would be images
const loteriaCards = [
  { id: 1, name: "El Gallo", selected: false },
  { id: 2, name: "El Diablito", selected: false },
  { id: 3, name: "La Dama", selected: false },
  { id: 4, name: "El Catrín", selected: false },
  { id: 5, name: "El Paraguas", selected: false },
  { id: 6, name: "La Sirena", selected: false },
  { id: 7, name: "La Escalera", selected: false },
  { id: 8, name: "La Botella", selected: false },
  { id: 9, name: "El Barril", selected: false },
  { id: 10, name: "El Árbol", selected: false },
  { id: 11, name: "El Melón", selected: false },
  { id: 12, name: "El Valiente", selected: false },
  { id: 13, name: "El Gorrito", selected: false },
  { id: 14, name: "La Muerte", selected: false },
  { id: 15, name: "La Pera", selected: false },
  { id: 16, name: "La Bandera", selected: false },
];

export function LoteriaGame() {
  const [playerCards, setPlayerCards] = useState<typeof loteriaCards>([]);
  const [currentCard, setCurrentCard] = useState<(typeof loteriaCards)[0] | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [remainingCards, setRemainingCards] = useState<typeof loteriaCards>([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [rewardSent, setRewardSent] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [isProcessingReward, setIsProcessingReward] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  
  const sendNotification = useNotification();
  const { address } = useAccount();

  // Initialize the game
  const startGame = () => {
    // Shuffle and assign 4 random cards to the player
    const shuffled = [...loteriaCards].sort(() => 0.5 - Math.random());
    const playerSelection = shuffled.slice(0, 4).map(card => ({...card, selected: false}));
    const remaining = shuffled.slice(4);
    
    setPlayerCards(playerSelection);
    setRemainingCards(remaining);
    setGameStarted(true);
    setSelectedCount(0);
    setHasWon(false);
    setRewardSent(false);
    
    // Draw the first card
    drawNextCard();
    
    // Try to send a notification, but don't block if it fails
    try {
      sendNotification({
        title: "Game Started",
        body: "Your Loteria game has begun!",
      }).catch(error => {
        console.log('Game start notification failed, but game continues:', error);
      });
    } catch (error) {
      console.log('Error sending game start notification, but game continues:', error);
    }
  };

  // Draw the next card
  const drawNextCard = () => {
    if (remainingCards.length === 0) {
      return;
    }
    
    // Get a random card from the remaining cards
    const randomIndex = Math.floor(Math.random() * remainingCards.length);
    const nextCard = remainingCards[randomIndex];
    
    // Set the current card and update remaining cards
    setCurrentCard(nextCard);
    setRemainingCards(remainingCards.filter((_, index) => index !== randomIndex));
    
    // Try to send a notification, but don't block if it fails
    try {
      sendNotification({
        title: "New Card Drawn",
        body: `${nextCard.name} has been drawn!`,
      }).catch(error => {
        console.log('Notification failed, but game continues:', error);
      });
    } catch (error) {
      console.log('Error sending notification, but game continues:', error);
    }
  };

  // Constants for the USDC reward
  const TREASURY_WALLET = '0xe06d2247eBA1e589Be85954eEEbE3285A692FAfA'; // Treasury wallet address
  const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base
  const REWARD_AMOUNT = '0.002'; // 0.002 USDC (6 decimals = 2000 units)
  
  // Send reward to the winner using our thirdweb-powered API endpoint
  const sendReward = useCallback(async () => {
    if (!address || rewardSent) return;
    
    console.log('sendReward function called');
    console.log('address:', address);
    console.log('rewardSent:', rewardSent);
    
    // Show notification and prepare to call API
    console.log('Showing notification and preparing to call API');
    try {
      sendNotification({
        title: "Processing Reward",
        body: "Your USDC reward is being processed...",
      }).catch(error => console.log('Processing notification failed, but continuing:', error));
    } catch (error) {
      console.log('Error showing processing notification, but continuing:', error);
    }
    
    // Set processing state to show spinner
    setIsProcessingReward(true);
    setTransactionHash(null);
    
    try {
      // Call the API to send the reward
      console.log('Calling API with recipient:', address);
      const response = await fetch('/api/send-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: address,
        }),
      });
      
      console.log('API response received:', response.status);
      const data = await response.json();
      console.log('API response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reward');
      }
      
      if (data.success) {
        // Mark as sent and store transaction hash
        console.log('Setting rewardSent to true');
        setRewardSent(true);
        setTransactionHash(data.transactionHash || null);
        
        // Show simple success notification with the transaction hash (safely)
        try {
          sendNotification({
            title: "USDC Reward Received!",
            body: `You've received ${REWARD_AMOUNT} USDC as a reward! ${data.transactionHash ? `Tx: ${data.transactionHash.slice(0, 10)}...` : ''}`,
          }).catch(err => console.log('Success notification failed, but reward was sent:', err));
        } catch (notifyError) {
          console.log('Error showing success notification, but reward was sent:', notifyError);
        }
      } else {
        throw new Error(data.error || 'Transaction failed');
      }
    } catch (error) {
      console.error('Error processing reward:', error);
      
      // Show error notification (safely)
      try {
        sendNotification({
          title: "Reward Error",
          body: typeof error === 'object' && error !== null && 'message' in error 
            ? (error.message as string)
            : "There was an error processing your reward. Please try again later.",
        }).catch(err => console.log('Error notification failed:', err));
      } catch (notifyError) {
        console.log('Error showing error notification:', notifyError);
      }
    } finally {
      // Always turn off processing state
      setIsProcessingReward(false);
    }
  }, [address, rewardSent, sendNotification]);

  // Select a card on the player's board
  const selectCard = (id: number) => {
    const updatedCards = playerCards.map(card => 
      card.id === id ? { ...card, selected: !card.selected } : card
    );
    
    setPlayerCards(updatedCards);
    
    // Count selected cards
    const newSelectedCount = updatedCards.filter(card => card.selected).length;
    setSelectedCount(newSelectedCount);
    
    // Check for win condition (all cards selected)
    if (newSelectedCount === 4) {
      setHasWon(true);
      
      // Try to send a notification, but don't block if it fails
      try {
        sendNotification({
          title: "LOTERIA!",
          body: "You've completed your board!",
        }).catch(error => {
          console.log('Win notification failed, but game continues:', error);
        });
      } catch (error) {
        console.log('Error sending win notification, but game continues:', error);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-md">
      {!gameStarted ? (
        <Card title="LOTERIA!">
          <div className="space-y-4">
            <p className="text-white mb-4 text-center">
              Welcome to <span className="text-[#FFD700] font-bold">Loteria</span>! The traditional Mexican game of chance.
              Get your <span className="text-[#FFD700]">board</span> and start playing!
            </p>
            <div className="flex justify-center w-full">
              <Button 
                onClick={startGame}
                icon={<Icon name="star" size="sm" />}
                className="bg-[#E53935] hover:bg-[#C62828] text-white"
              >
                Start Game
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <Card title="YOUR BOARD">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {playerCards.map((card) => (
                <div 
                  key={card.id}
                  onClick={() => selectCard(card.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    card.selected 
                      ? "border-[#E53935] bg-[#E53935]/20 text-white" 
                      : "border-[#FFD700] bg-[#FFD700]/10 text-white"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-bold text-[#FFD700]">{card.name}</div>
                    <div className="text-xs text-white/80 mt-1">Card #{card.id}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center text-white mb-2 border-t border-[#FFD700]/30 pt-2 mt-2">
              <span className="text-[#FFD700] font-bold">{selectedCount}</span>/4 cards marked
            </div>
          </Card>

          <Card title="CURRENT CARD">
            {currentCard ? (
              <div className="text-center p-4 border-2 border-[#E53935] rounded-lg bg-[#E53935]/10">
                <div className="text-2xl font-bold mb-2 text-[#FFD700]">{currentCard.name}</div>
                <div className="text-white/80">Card #{currentCard.id}</div>
              </div>
            ) : (
              <div className="text-center p-4 text-white">
                No card drawn yet
              </div>
            )}
            <div className="flex justify-between mt-4">
              <Button 
                variant="primary" 
                onClick={drawNextCard}
                disabled={remainingCards.length === 0}
                className="bg-[#E53935] hover:bg-[#C62828] text-white"
              >
                Draw Next Card ({remainingCards.length} left)
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setGameStarted(false)}
                className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]/20"
              >
                New Game
              </Button>
            </div>
            
            {/* Reward button that appears after winning */}
            {hasWon && !rewardSent && address && (
              <div className="mt-4 border-t border-[#FFD700]/30 pt-4">
                <div className="flex justify-center">
                  {isProcessingReward ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4CAF50] mb-2"></div>
                      <p className="text-white text-sm">Processing your reward...</p>
                    </div>
                  ) : (
                    <Button 
                      variant="primary" 
                      onClick={sendReward}
                      className="bg-[#4CAF50] hover:bg-[#388E3C] text-white"
                    >
                      Claim Your Reward
                    </Button>
                  )}
                </div>
                <p className="text-white text-xs text-center mt-2">
                  You won! Click to receive 0.2¢ worth of USDC as a reward.
                </p>
              </div>
            )}
            
            {/* Thank you message after reward is sent */}
            {hasWon && rewardSent && (
              <div className="mt-4 border-t border-[#FFD700]/30 pt-4 flex justify-center">
                <div className="bg-[#4CAF50]/20 rounded-lg p-4 w-full max-w-xs">
                  <p className="text-[#4CAF50] text-center font-bold mb-2">
                    Reward claimed! Thank you for playing Loteria.
                  </p>
                  
                  {transactionHash && (
                    <div className="mt-2 text-center">
                      <p className="text-white text-xs mb-1">Transaction Hash:</p>
                      <a 
                        href={`https://basescan.org/tx/${transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FFD700] text-xs hover:underline break-all inline-block"
                      >
                        {transactionHash}
                      </a>
                      <p className="text-white text-xs mt-2">
                        <span className="inline-block bg-[#FFD700]/20 text-[#FFD700] px-2 py-1 rounded text-xs">
                          Click to view on BaseScan
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
