"use client";

import React, { useEffect, useRef, useState } from "react";
import { GameEngine, GameState } from "@/game/GameEngine";
import { GazeState } from "@/vision/gaze/GazeAnalyzer";

import { SessionMetrics } from "@/hooks/useSessionAnalytics";
import { DifficultyLevel } from "@/game/DifficultyEngine";

interface GameCanvasProps {
  gazeState?: GazeState;
  pushUpRepCount?: number;
  difficultyLevel?: DifficultyLevel;
  onGameStateChange?: (state: GameState, score: number) => void;
  onEngineReady?: (engine: GameEngine) => void;
  sessionMetrics?: SessionMetrics | null;
}

export default function GameCanvas({ 
  gazeState = GazeState.CENTER,
  pushUpRepCount = 0,
  difficultyLevel = 'NORMAL',
  onGameStateChange,
  onEngineReady,
  sessionMetrics
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  
  const [gameState, setGameState] = useState<GameState>(GameState.READY);
  const [score, setScore] = useState<number>(0);
  const [shields, setShields] = useState<number>(0);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize game engine (3rd arg fires once when engine is ready)
    const engine = new GameEngine(
      canvasRef.current,
      (state, newScore, newShields) => {
        setGameState(state);
        setScore(newScore);
        setShields(newShields);
        if (onGameStateChange) {
          onGameStateChange(state, newScore);
        }
      },
      onEngineReady
    );
    
    engineRef.current = engine;
    
    // Setup keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault(); // Prevent page scrolling
        engine.input("FLAP");
      } else if (e.code === "KeyP" || e.code === "Escape") {
        e.preventDefault();
        engine.input("PAUSE");
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      engine.stop();
    };
  }, []);
  
  // Handle Gaze Input
  const prevGazeState = useRef<GazeState>(gazeState);
  
  useEffect(() => {
    if (engineRef.current) {
      if (gazeState === GazeState.UP && prevGazeState.current !== GazeState.UP) {
        engineRef.current.input("FLAP");
      }
    }
    prevGazeState.current = gazeState;
  }, [gazeState]);

  // Grant a shield when a new push-up rep is completed
  const prevRepCountRef = useRef<number>(0);
  useEffect(() => {
    if (pushUpRepCount > prevRepCountRef.current) {
      engineRef.current?.addShield();
    }
    prevRepCountRef.current = pushUpRepCount;
  }, [pushUpRepCount]);
  
  return (
    <div className="relative w-full max-w-4xl aspect-video mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl neon-glow">
      {/* 
        The canvas uses a fixed internal resolution (1280x720) for consistent physics, 
        and scales responsively using CSS w-full and aspect-video.
      */}
      <canvas 
        ref={canvasRef}
        width={1280}
        height={720}
        className="w-full h-full object-cover"
      />
      
      {/* HUD Overlays — score (left), difficulty + shields (right) */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none">
        <div className="text-3xl font-black text-white neon-text-glow">
          {score}
        </div>
        <div className="flex items-center gap-2">
          {/* Difficulty badge */}
          {gameState === GameState.PLAYING && (
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              difficultyLevel === 'EXTREME' ? 'bg-red-500/20 border-red-400/50 text-red-300' :
              difficultyLevel === 'HARD'    ? 'bg-orange-500/20 border-orange-400/50 text-orange-300' :
              difficultyLevel === 'EASY'    ? 'bg-blue-500/20 border-blue-400/50 text-blue-300' :
                                             'bg-zinc-500/20 border-zinc-400/30 text-zinc-400'
            } tracking-widest`}>
              {difficultyLevel}
            </div>
          )}
          {/* Shield indicator */}
          {shields > 0 && gameState === GameState.PLAYING && (
            <div className="flex items-center gap-1.5 bg-cyan-500/20 border border-cyan-400/50 rounded-full px-3 py-1">
              <span className="text-cyan-400 text-lg">🛡️</span>
              <span className="text-cyan-300 font-bold text-sm">{shields}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* State Overlays */}
      {gameState === GameState.READY && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center pointer-events-none">
          <h2 className="text-4xl font-black text-white mb-4 tracking-wider neon-text-glow">READY?</h2>
          <p className="text-xl text-zinc-300 font-medium">Look UP or press SPACE to flap</p>
        </div>
      )}
      
      {gameState === GameState.PAUSED && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center pointer-events-none backdrop-blur-sm">
          <h2 className="text-5xl font-black text-white mb-2 tracking-wider neon-text-glow">PAUSED</h2>
          <p className="text-xl text-zinc-400">Press P or ESC to resume</p>
        </div>
      )}
      
      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center pointer-events-none p-6">
          <h2 className="text-5xl font-black text-red-500 mb-2 tracking-wider neon-text-glow">GAME OVER</h2>
          <p className="text-3xl text-white font-bold mb-6">Score: {score}</p>
          
          {sessionMetrics && (
            <div className="bg-zinc-900/80 border border-white/10 rounded-xl p-4 mb-6 backdrop-blur-md min-w-[300px]">
              <h3 className="text-zinc-400 text-xs font-bold tracking-widest mb-3 text-center">SESSION SUMMARY</h3>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center p-2 bg-black/30 rounded-lg">
                  <span className="text-xl font-bold text-white">{sessionMetrics.totalReps}</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider mt-1 text-center">Total Reps</span>
                </div>
                
                <div className="flex flex-col items-center p-2 bg-black/30 rounded-lg">
                  <span className="text-xl font-bold text-green-400">{sessionMetrics.validReps}</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider mt-1 text-center">Valid Reps</span>
                </div>
                
                <div className="flex flex-col items-center p-2 bg-black/30 rounded-lg">
                  <span className="text-xl font-bold text-blue-400">{sessionMetrics.durationSeconds}s</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider mt-1 text-center">Duration</span>
                </div>
                
                <div className="flex flex-col items-center p-2 bg-black/30 rounded-lg">
                  <span className="text-xl font-bold text-amber-400">{sessionMetrics.averageForm}</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider mt-1 text-center">Avg Form</span>
                </div>

                <div className="flex flex-col items-center p-2 bg-black/30 rounded-lg">
                  <span className={`text-xl font-bold ${sessionMetrics.performanceScore >= 80 ? 'text-green-400' : sessionMetrics.performanceScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{sessionMetrics.performanceScore}</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider mt-1 text-center">Performance</span>
                </div>

                <div className="flex flex-col items-center p-2 bg-black/30 rounded-lg">
                  <span className={`text-xl font-bold ${sessionMetrics.fatigueIndicator >= 80 ? 'text-red-400' : sessionMetrics.fatigueIndicator >= 50 ? 'text-amber-400' : 'text-blue-400'}`}>{sessionMetrics.fatigueIndicator}</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider mt-1 text-center">Fatigue</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-lg text-zinc-400 mt-2">Look UP or press SPACE to restart</p>
        </div>
      )}
    </div>
  );
}
