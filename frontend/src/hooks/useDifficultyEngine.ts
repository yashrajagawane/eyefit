import { useEffect, useRef, useState } from "react";
import { GameEngine } from "@/game/GameEngine";
import { GameState } from "@/game/GameEngine";
import { GazeState } from "@/vision/gaze/GazeAnalyzer";
import { PushUpResult } from "@/vision/pose/PushUpAnalyzer";
import { DifficultyEngine, DifficultyLevel, DifficultySignals } from "@/game/DifficultyEngine";

const GAZE_WINDOW = 90;     // Rolling window size (frames at ~30fps ≈ 3s)
const FORM_WINDOW = 5;      // Last N reps to average

export function useDifficultyEngine(
  gameEngineRef: React.RefObject<GameEngine | null>,
  gazeState: GazeState,
  pushUpResult: PushUpResult,
  gameState: GameState,
  gameScore: number
) {
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('NORMAL');

  const diffEngineRef = useRef(new DifficultyEngine());

  // Gaze stability: rolling circular buffer
  const gazeWindowRef = useRef<GazeState[]>([]);
  
  // Live form score: last N form scores from reps
  const recentFormScoresRef = useRef<number[]>([]);
  const prevRepCountRef = useRef(0);

  // Live fatigue: ratio of latest rep duration to rolling average rep duration
  const repDurationsRef = useRef<number[]>([]);

  // Track new reps
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;
    if (pushUpResult.repCount > prevRepCountRef.current && pushUpResult.lastFormResult) {
      const result = pushUpResult.lastFormResult;
      
      // Update form scores window
      recentFormScoresRef.current.push(result.score);
      if (recentFormScoresRef.current.length > FORM_WINDOW) {
        recentFormScoresRef.current.shift();
      }

      // Update rep durations for live fatigue estimate
      if (result.repDurationMs > 0) {
        repDurationsRef.current.push(result.repDurationMs);
        if (repDurationsRef.current.length > 10) {
          repDurationsRef.current.shift();
        }
      }
    }
    prevRepCountRef.current = pushUpResult.repCount;
  }, [pushUpResult.repCount, pushUpResult.lastFormResult, gameState]);

  // Update gaze rolling window
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;
    gazeWindowRef.current.push(gazeState);
    if (gazeWindowRef.current.length > GAZE_WINDOW) {
      gazeWindowRef.current.shift();
    }
  }, [gazeState, gameState]);

  // Reset state on new game
  useEffect(() => {
    if (gameState === GameState.PLAYING && gameScore === 0) {
      gazeWindowRef.current = [];
      recentFormScoresRef.current = [];
      repDurationsRef.current = [];
      prevRepCountRef.current = 0;
    }
  }, [gameState, gameScore]);

  // Main computation loop: recalculate whenever key inputs change
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;
    const engine = gameEngineRef.current;
    if (!engine) return;

    // Gaze stability: % of window frames that are CENTER
    const window = gazeWindowRef.current;
    const gazeStability = window.length === 0 ? 100 :
      Math.round((window.filter(g => g === GazeState.CENTER).length / window.length) * 100);

    // Live form score: average of recent reps (0 if no reps yet)
    const formScores = recentFormScoresRef.current;
    const liveFormScore = formScores.length === 0 ? 100 :
      Math.round(formScores.reduce((a, b) => a + b, 0) / formScores.length);

    // Live fatigue: if latest rep was 40%+ slower than session average, scale up
    const durations = repDurationsRef.current;
    let liveFatigue = 0;
    if (durations.length >= 3) {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const latest = durations[durations.length - 1];
      const ratio = latest / avg;
      liveFatigue = Math.max(0, Math.min(100, Math.round((ratio - 1) * 150)));
    }

    const signals: DifficultySignals = {
      gameScore,
      collisionRate: engine.getCollisionRate(),
      gazeStability,
      liveFormScore,
      liveFatigue,
    };

    const { modifier, level } = diffEngineRef.current.compute(signals);
    engine.setDifficultyModifier(modifier);
    setDifficultyLevel(level);
  }, [gazeState, pushUpResult.repCount, gameScore, gameState, gameEngineRef]);

  return { difficultyLevel };
}
