"use client";

import { useState, useEffect, ReactNode } from "react";
import { Button, Icon } from "./DemoComponents";
import { useNotification } from "@coinbase/onchainkit/minikit";

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
  
  const sendNotification = useNotification();

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
    
    // Draw the first card
    drawNextCard();
  };

  // Draw the next card
  const drawNextCard = () => {
    if (remainingCards.length === 0) {
      sendNotification({
        title: "Game Over",
        body: "No more cards to draw!",
      });
      return;
    }

    const nextCard = remainingCards[0];
    setCurrentCard(nextCard);
    setRemainingCards(remainingCards.slice(1));

    // Check if the player has this card
    const hasMatch = playerCards.some(card => card.id === nextCard.id);
    if (hasMatch) {
      sendNotification({
        title: "¡Lotería!",
        body: `You have ${nextCard.name} on your tabla!`,
      });
    }
  };

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
      sendNotification({
        title: "¡LOTERÍA!",
        body: "You've completed your tabla!",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {!gameStarted ? (
        <Card title="LOTERIA!">
          <div className="space-y-4">
            <p className="text-white mb-4 text-center">
              Welcome to <span className="text-[#FFD700] font-bold">Loteria</span>! The traditional Mexican game of chance.
              Get your <span className="text-[#FFD700]">board</span> and start playing!
            </p>
            <Button 
              onClick={startGame}
              icon={<Icon name="star" size="sm" />}
              className="bg-[#E53935] hover:bg-[#C62828] text-white"
            >
              Start Game
            </Button>
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
          </Card>
        </>
      )}
    </div>
  );
}
