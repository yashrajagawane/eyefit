"use client";

import React, { useEffect, useRef, useState } from "react";
import { GameEngine, GameState } from "@/game/GameEngine";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  
  const [gameState, setGameState] = useState<GameState>(GameState.READY);
  const [score, setScore] = useState<number>(0);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize game engine
    const engine = new GameEngine(canvasRef.current, (state, newScore) => {
      setGameState(state);
      setScore(newScore);
    });
    
    engineRef.current = engine;
    
    // Setup keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault(); // Prevent page scrolling
        engine.input("FLAP");
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      engine.stop();
    };
  }, []);
  
  return (
    <div className="relative w-full max-w-4xl aspect-video mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl neon-glow">
      <canvas 
        ref={canvasRef}
        width={1280}
        height={720}
        className="w-full h-full object-cover"
      />
      
      {/* HUD Overlays */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none">
        <div className="text-3xl font-black text-white neon-text-glow">
          {score}
        </div>
      </div>
      
      {/* State Overlays */}
      {gameState === GameState.READY && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center pointer-events-none">
          <h2 className="text-4xl font-black text-white mb-4 tracking-wider neon-text-glow">READY?</h2>
          <p className="text-xl text-zinc-300 font-medium">Press SPACE to flap</p>
        </div>
      )}
      
      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center pointer-events-none">
          <h2 className="text-5xl font-black text-red-500 mb-2 tracking-wider neon-text-glow">GAME OVER</h2>
          <p className="text-2xl text-white font-bold mb-6">Score: {score}</p>
          <p className="text-lg text-zinc-400">Press SPACE to restart</p>
        </div>
      )}
    </div>
  );
}
