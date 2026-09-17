import { useState, useEffect, useRef } from "react";
import { GameState } from "@/game/GameEngine";
import { PushUpResult, FormResult } from "@/vision/pose/PushUpAnalyzer";

export interface SessionMetrics {
  durationSeconds: number;
  gameScore: number;
  totalReps: number;
  validReps: number;
  formScores: number[]; // Array of scores 0-100 for each completed rep
  averageForm: number;
  startTime: number;
}

export function useSessionAnalytics(
  gameState: GameState,
  gameScore: number,
  pushUpResult: PushUpResult
) {
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics | null>(null);
  
  // Refs to keep track of accumulating stats during the active session without triggering re-renders
  const startTimeRef = useRef<number>(0);
  const formScoresRef = useRef<number[]>([]);
  const prevRepCountRef = useRef<number>(0);
  
  // Track new reps and their form scores
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      if (pushUpResult.repCount > prevRepCountRef.current) {
        // A new rep was completed!
        if (pushUpResult.lastFormResult) {
          formScoresRef.current.push(pushUpResult.lastFormResult.score);
        }
      }
      prevRepCountRef.current = pushUpResult.repCount;
    }
  }, [pushUpResult.repCount, pushUpResult.lastFormResult, gameState]);

  // Handle Game State Transitions
  useEffect(() => {
    if (gameState === GameState.PLAYING && startTimeRef.current === 0) {
      // Session started
      startTimeRef.current = Date.now();
      formScoresRef.current = [];
      prevRepCountRef.current = 0;
      setSessionMetrics(null);
    } else if (gameState === GameState.GAME_OVER && startTimeRef.current !== 0) {
      // Session ended - calculate final metrics
      const endTime = Date.now();
      const durationSeconds = Math.floor((endTime - startTimeRef.current) / 1000);
      
      const formScores = [...formScoresRef.current];
      const validReps = formScores.length;
      const averageForm = validReps > 0 
        ? Math.round(formScores.reduce((sum, score) => sum + score, 0) / validReps)
        : 0;

      setSessionMetrics({
        durationSeconds,
        gameScore,
        totalReps: pushUpResult.repCount,
        validReps,
        formScores,
        averageForm,
        startTime: startTimeRef.current,
      });

      // Reset start time so it's ready for the next session
      startTimeRef.current = 0;
    }
  }, [gameState, gameScore, pushUpResult.repCount]);

  return { sessionMetrics };
}
