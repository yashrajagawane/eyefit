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
  fatigueIndicator: number;
  performanceScore: number;
}

function calculateFatigue(formResults: FormResult[]): number {
  if (formResults.length < 4) return 0; // Not enough data

  const quarter = Math.max(1, Math.floor(formResults.length / 4));
  const firstQuarter = formResults.slice(0, quarter);
  const lastQuarter = formResults.slice(-quarter);

  const avgFirstDuration = firstQuarter.reduce((sum, r) => sum + r.repDurationMs, 0) / quarter;
  const avgLastDuration = lastQuarter.reduce((sum, r) => sum + r.repDurationMs, 0) / quarter;

  // If last reps take 50% longer than first reps, fatigue approaches 100
  if (avgFirstDuration === 0) return 0;
  const ratio = avgLastDuration / avgFirstDuration;
  
  // ratio = 1 -> 0 fatigue. ratio = 1.5 -> 100 fatigue.
  let fatigue = (ratio - 1) * 200;
  return Math.max(0, Math.min(100, Math.round(fatigue)));
}

function calculatePerformance(averageForm: number, formResults: FormResult[], fatigue: number): number {
  if (formResults.length === 0) return 0;
  
  // Base is the average form score
  let performance = averageForm;
  
  // Consistency penalty: if durations vary wildly, penalize slightly
  if (formResults.length > 2) {
    const durations = formResults.map(r => r.repDurationMs);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const variance = durations.reduce((a, b) => a + Math.pow(b - avgDuration, 2), 0) / durations.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / avgDuration; // Coefficient of variation
    
    // If CV > 0.3 (highly inconsistent pace), penalty up to 10 points
    if (cv > 0.3) {
      performance -= Math.min(10, (cv - 0.3) * 20);
    }
  }

  return Math.max(0, Math.min(100, Math.round(performance)));
}

export function useSessionAnalytics(
  gameState: GameState,
  gameScore: number,
  pushUpResult: PushUpResult
) {
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics | null>(null);
  
  // Refs to keep track of accumulating stats during the active session without triggering re-renders
  const startTimeRef = useRef<number>(0);
  const formResultsRef = useRef<FormResult[]>([]);
  const prevRepCountRef = useRef<number>(0);
  
  // Track new reps and their form scores
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      if (pushUpResult.repCount > prevRepCountRef.current) {
        // A new rep was completed!
        if (pushUpResult.lastFormResult) {
          formResultsRef.current.push(pushUpResult.lastFormResult);
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
      formResultsRef.current = [];
      prevRepCountRef.current = 0;
      setSessionMetrics(null);
    } else if (gameState === GameState.GAME_OVER && startTimeRef.current !== 0) {
      // Session ended - calculate final metrics
      const endTime = Date.now();
      const durationSeconds = Math.floor((endTime - startTimeRef.current) / 1000);
      
      const results = [...formResultsRef.current];
      const formScores = results.map(r => r.score);
      const validReps = formScores.length;
      const averageForm = validReps > 0 
        ? Math.round(formScores.reduce((sum, score) => sum + score, 0) / validReps)
        : 0;

      const fatigueIndicator = calculateFatigue(results);
      const performanceScore = calculatePerformance(averageForm, results, fatigueIndicator);

      setSessionMetrics({
        durationSeconds,
        gameScore,
        totalReps: pushUpResult.repCount,
        validReps,
        formScores,
        averageForm,
        startTime: startTimeRef.current,
        fatigueIndicator,
        performanceScore,
      });

      // Reset start time so it's ready for the next session
      startTimeRef.current = 0;
    }
  }, [gameState, gameScore, pushUpResult.repCount]);

  return { sessionMetrics };
}
