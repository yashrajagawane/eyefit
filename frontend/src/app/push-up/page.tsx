"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CameraPreview } from "@/components/camera/CameraPreview";
import { useCamera, CameraState } from "@/hooks/useCamera";
import { usePose } from "@/hooks/usePose";
import { usePushUp } from "@/hooks/usePushUp";
import { useSessionAnalytics } from "@/hooks/useSessionAnalytics";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/api";
import { GameState } from "@/game/GameEngine";
import { PushUpState, FormVerdict } from "@/vision/pose/PushUpAnalyzer";
import { Card } from "@/components/ui/Card";

export default function PushUpRoute() {
  const router = useRouter();
  const { stream, state: cameraState, errorMsg, startCamera, stopCamera } = useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);

  const { poseResult, isPoseReady } = usePose(videoRef, cameraState === CameraState.PLAYING);
  const { pushUpResult, resetReps } = usePushUp(poseResult.landmarks);
  const { user } = useAuth();

  const [targetReps, setTargetReps] = useState<number>(10);
  const [internalGameState, setInternalGameState] = useState<GameState>(GameState.READY);
  
  // Game score is always 0 for push-up challenge
  const { sessionMetrics } = useSessionAnalytics(
    internalGameState,
    0,
    pushUpResult
  );

  const [isSaving, setIsSaving] = useState(false);

  // Check if target is reached
  useEffect(() => {
    if (internalGameState === GameState.PLAYING && pushUpResult.repCount >= targetReps) {
      setInternalGameState(GameState.GAME_OVER);
    }
  }, [internalGameState, pushUpResult.repCount, targetReps]);

  // Save session when game is over
  useEffect(() => {
    if (internalGameState === GameState.GAME_OVER && user && sessionMetrics && !isSaving) {
      setIsSaving(true);
      const saveSession = async () => {
        try {
          const res = await fetchWithAuth("/sessions", {
            method: "POST",
            body: JSON.stringify({
              duration_seconds: sessionMetrics.durationSeconds,
              game_score: sessionMetrics.gameScore,
              total_reps: sessionMetrics.totalReps,
              valid_reps: sessionMetrics.validReps,
              average_form: sessionMetrics.averageForm,
              performance_score: sessionMetrics.performanceScore,
              fatigue_indicator: sessionMetrics.fatigueIndicator
            })
          });
          // Persist session result to localStorage for the Results page
          localStorage.setItem('GazeFlap_last_session', JSON.stringify(res));
          router.push('/results');
        } catch (error) {
          console.error("Failed to save session:", error);
          router.push('/results'); // Still redirect even if save fails, though it might break results page without data
        }
      };
      saveSession();
    }
  }, [internalGameState, user, sessionMetrics, isSaving, router]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleStart = () => {
    if (cameraState !== CameraState.PLAYING) {
      startCamera();
    }
    resetReps();
    setInternalGameState(GameState.PLAYING);
  };

  const handleStop = () => {
    setInternalGameState(GameState.GAME_OVER);
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center p-6 md:p-12 bg-[#09090b]">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-wider text-primary neon-text-glow">Push-Up Challenge</h1>
            <p className="text-zinc-400">Pure endurance. No game, just form.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {isPoseReady ? (
              <span className="text-green-400 text-sm font-medium">Tracking Active ✓</span>
            ) : cameraState === CameraState.PLAYING ? (
              <span className="text-yellow-400 text-sm font-medium animate-pulse">Loading models...</span>
            ) : null}
          </div>
        </div>

        {internalGameState === GameState.READY && (
          <Card glow className="p-8 text-center bg-white/5 border-white/10 mb-8 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Select Target</h2>
            <div className="flex justify-center gap-4 mb-8">
              {[10, 20, 30, 50].map((num) => (
                <button
                  key={num}
                  onClick={() => setTargetReps(num)}
                  className={`w-16 h-16 rounded-full text-xl font-bold transition-all ${
                    targetReps === num 
                      ? 'bg-primary text-primary-foreground scale-110 shadow-[0_0_15px_rgba(34,211,238,0.5)]' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            
            {!isPoseReady && cameraState !== CameraState.PLAYING && (
              <div className="mb-6">
                <CameraPreview 
                  stream={stream} 
                  state={cameraState} 
                  errorMsg={errorMsg}
                  onEnable={startCamera} 
                />
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={cameraState !== CameraState.PLAYING || !isPoseReady}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
                cameraState === CameraState.PLAYING && isPoseReady
                  ? 'bg-primary text-primary-foreground hover:bg-accent'
                  : 'bg-white/10 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {cameraState !== CameraState.PLAYING ? "ENABLE CAMERA FIRST" : !isPoseReady ? "LOADING MODELS..." : "START CHALLENGE"}
            </button>
          </Card>
        )}

        {internalGameState === GameState.PLAYING && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <Card className="h-full flex flex-col items-center justify-center p-8 bg-black/50 border-primary/20">
                <div className="text-zinc-400 uppercase tracking-widest mb-4">Progress</div>
                <div className="text-[8rem] leading-none font-black text-white neon-text-glow font-mono">
                  {pushUpResult.repCount}<span className="text-5xl text-zinc-600">/{targetReps}</span>
                </div>
                
                <div className="mt-8 flex gap-8 w-full justify-center">
                  <div className="text-center">
                    <div className="text-sm text-zinc-400 uppercase">State</div>
                    <div className="text-xl font-bold text-cyan-400">
                      {pushUpResult.state === PushUpState.UP ? "UP" : 
                       pushUpResult.state === PushUpState.MOVING_DOWN ? "GOING DOWN" :
                       pushUpResult.state === PushUpState.BOTTOM ? "BOTTOM" :
                       pushUpResult.state === PushUpState.MOVING_UP ? "GOING UP" : "UP"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-zinc-400 uppercase">Last Form</div>
                    <div className={`text-xl font-bold ${
                      pushUpResult.lastFormResult?.verdict === FormVerdict.GOOD ? "text-green-400" :
                      pushUpResult.lastFormResult?.verdict === FormVerdict.SHALLOW ? "text-yellow-400" :
                      pushUpResult.lastFormResult?.verdict === FormVerdict.TRACKING_ERROR ? "text-red-400" : "text-zinc-400"
                    }`}>
                      {pushUpResult.lastFormResult?.verdict || "-"}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleStop}
                  className="mt-12 px-6 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded font-bold tracking-wider"
                >
                  END EARLY
                </button>
              </Card>
            </div>
            
            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="sticky top-6">
                <CameraPreview 
                  stream={stream} 
                  state={cameraState} 
                  errorMsg={errorMsg}
                  onEnable={startCamera}
                  overlay={true}
                  poseLandmarks={poseResult.landmarks}
                />
                
                {/* Visual indicator of elbow angle */}
                <div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="text-sm text-zinc-400 mb-2">Form Depth Guide</div>
                  <div className="w-full bg-zinc-800 rounded-full h-3 relative overflow-hidden">
                    {/* The 90 degree mark line */}
                    <div className="absolute left-[50%] top-0 bottom-0 w-1 bg-primary z-10" />
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-red-500 to-green-500 transition-all duration-75"
                      style={{ 
                        // Map angle 180->0 to width 0->100%
                        width: `${Math.max(0, Math.min(100, ((180 - (pushUpResult.currentAngle || 180)) / 180) * 100))}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-zinc-500 mt-1">
                    <span>Up</span>
                    <span>90° Target</span>
                    <span>Deep</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {internalGameState === GameState.GAME_OVER && (
          <div className="flex flex-col items-center justify-center p-12 text-center h-64">
            <div className="text-2xl font-bold mb-4 animate-pulse">Processing results...</div>
            <div className="text-zinc-400">Saving session data and generating AI feedback.</div>
          </div>
        )}
      </div>
    </div>
  );
}
