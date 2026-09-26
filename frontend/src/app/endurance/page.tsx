"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GameCanvas from "@/components/game/GameCanvas";
import { CameraPreview } from "@/components/camera/CameraPreview";
import { GazeCalibration } from "@/components/calibration/GazeCalibration";
import { useCamera, CameraState } from "@/hooks/useCamera";
import { useGaze } from "@/hooks/useGaze";
import { useCalibration } from "@/hooks/useCalibration";
import { usePose } from "@/hooks/usePose";
import { usePushUp } from "@/hooks/usePushUp";
import { useSessionAnalytics } from "@/hooks/useSessionAnalytics";
import { useDifficultyEngine } from "@/hooks/useDifficultyEngine";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/api";
import { GameState, GameEngine } from "@/game/GameEngine";
import { GazeState } from "@/vision/gaze/GazeAnalyzer";
import { PushUpState, FormVerdict } from "@/vision/pose/PushUpAnalyzer"

export default function EnduranceRoute() {
  const router = useRouter();
  const { stream, state: cameraState, errorMsg, startCamera, stopCamera } = useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [privacyAccepted, setPrivacyAccepted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('GazeFlap_camera_privacy_accepted') === 'true';
    }
    return false;
  });

  const handleAcceptPrivacy = () => {
    localStorage.setItem('GazeFlap_camera_privacy_accepted', 'true');
    setPrivacyAccepted(true);
  };

  const [currentRawRatio, setCurrentRawRatio] = useState(0.5);

  const { 
    step, progress, thresholds, startCalibration, cancelCalibration, clearCalibration, isCalibrating
  } = useCalibration(currentRawRatio);

  const { gazeResult, isVisionReady } = useGaze(videoRef, cameraState === CameraState.PLAYING, thresholds);
  const { poseResult, isPoseReady } = usePose(videoRef, cameraState === CameraState.PLAYING);
  const { pushUpResult, resetReps } = usePushUp(poseResult.landmarks);
  const { user } = useAuth();
  
  const [internalGameState, setInternalGameState] = useState<GameState>(GameState.READY);
  const [internalGameScore, setInternalGameScore] = useState<number>(0);
  const gameEngineRef = useRef<GameEngine | null>(null);
  
  const { sessionMetrics } = useSessionAnalytics(
    internalGameState,
    internalGameScore,
    pushUpResult
  );

  const { difficultyLevel } = useDifficultyEngine(
    gameEngineRef,
    gazeResult.state,
    pushUpResult,
    internalGameState,
    internalGameScore
  );

  useEffect(() => {
    setCurrentRawRatio(gazeResult.rawRatio);
  }, [gazeResult.rawRatio]);

  const [gamificationResult, setGamificationResult] = useState<any>(null);

  // Timer logic for Endurance Mode
  const [targetTime, setTargetTime] = useState<number>(180); // Default 3 mins
  const [timeLeft, setTimeLeft] = useState<number>(180);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (internalGameState === GameState.PLAYING) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // End the game when timer hits 0
            if (gameEngineRef.current) {
               gameEngineRef.current.endGame();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (internalGameState === GameState.READY) {
      setTimeLeft(targetTime);
    }
    return () => clearInterval(interval);
  }, [internalGameState, targetTime]);


  // Save session when game is over
  useEffect(() => {
    if (internalGameState === GameState.GAME_OVER && user && sessionMetrics) {
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
          localStorage.setItem('GazeFlap_last_session', JSON.stringify(res));
          setGamificationResult(res);
          setTimeout(() => router.push('/results'), 2200);
        } catch (error) {
          console.error("Failed to save session:", error);
          setGamificationResult({ error: true });
        }
      };
      saveSession();
    }
  }, [internalGameState, user, sessionMetrics, router]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-6 bg-[#09090b]">
      {isCalibrating && (
        <GazeCalibration 
          step={step}
          progress={progress}
          onCancel={cancelCalibration}
        />
      )}

      <div className="w-full max-w-5xl">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold uppercase tracking-wider text-primary neon-text-glow">Endurance Mode</h1>
              {internalGameState === GameState.READY && (
                <select 
                  value={targetTime}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setTargetTime(v);
                    setTimeLeft(v);
                  }}
                  className="bg-zinc-800 text-white border border-zinc-700 rounded px-3 py-1 text-sm font-bold"
                >
                  <option value={60}>1 Minute</option>
                  <option value={180}>3 Minutes</option>
                  <option value={300}>5 Minutes</option>
                  <option value={600}>10 Minutes</option>
                </select>
              )}
            </div>
            <p className="text-zinc-400">Survive until the timer ends. Gaze + Push-Ups.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-2xl font-black text-white font-mono bg-white/10 px-4 py-2 rounded-lg border border-white/20">
              ⏱ {formatTime(timeLeft)}
            </div>

            {isVisionReady ? (
              <span className="text-green-400 text-sm font-medium">Gaze ✓</span>
            ) : cameraState === CameraState.PLAYING ? (
              <span className="text-yellow-400 text-sm font-medium animate-pulse">Loading face...</span>
            ) : null}

            {isPoseReady ? (
              <span className="text-green-400 text-sm font-medium">Pose ✓</span>
            ) : cameraState === CameraState.PLAYING ? (
              <span className="text-yellow-400 text-sm font-medium animate-pulse">Loading pose...</span>
            ) : null}

            {cameraState === CameraState.PLAYING && !isCalibrating && (
              <div className="flex gap-2">
                <button 
                  onClick={startCalibration}
                  className="px-4 py-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 rounded-lg font-bold hover:bg-indigo-500/30 transition-colors text-sm"
                >
                  Calibrate Gaze
                </button>
              </div>
            )}

            {cameraState === CameraState.IDLE || cameraState === CameraState.ERROR ? (
              <>
                {!privacyAccepted && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center p-6">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                      <h2 className="text-xl font-bold text-white mb-3">Camera Permission</h2>
                      <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                        GazeFlap processes video locally. No data is stored or sent.
                      </p>
                      <button
                        onClick={handleAcceptPrivacy}
                        className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-accent transition-colors"
                      >
                        I Understand — Enable Camera
                      </button>
                    </div>
                  </div>
                )}
                {privacyAccepted && (
                  <button onClick={startCamera} className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-accent transition-colors">
                    Enable Camera
                  </button>
                )}
              </>
            ) : (
              <button onClick={stopCamera} className="px-4 py-2 border border-white/20 text-white rounded-lg font-bold hover:bg-white/10 transition-colors text-sm">
                Disable Camera
              </button>
            )}
          </div>
        </div>
        
        <div className="relative">
          <GameCanvas 
            gazeState={gazeResult.state}
            pushUpRepCount={pushUpResult.repCount}
            difficultyLevel={difficultyLevel}
            onEngineReady={(engine) => { gameEngineRef.current = engine; }}
            onGameStateChange={(state, score) => {
              setInternalGameState(state);
              setInternalGameScore(score);
              if (state === GameState.PLAYING && internalGameState !== GameState.PLAYING && internalGameState !== GameState.PAUSED) {
                resetReps();
                setGamificationResult(null);
                setTimeLeft(targetTime);
              }
            }}
            sessionMetrics={sessionMetrics}
          />

          {gamificationResult && internalGameState === GameState.GAME_OVER && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none p-4 text-center">
              <h2 className="text-4xl font-black neon-text-glow text-white mb-2">+{gamificationResult.xp_earned} XP</h2>
              
              {gamificationResult.leveled_up && (
                <div className="mt-4 p-4 bg-primary/20 border border-primary/50 rounded-xl animate-bounce">
                  <div className="text-2xl">⭐</div>
                  <div className="text-xl font-bold text-primary">Level Up!</div>
                  <div className="text-white font-bold">You are now Level {gamificationResult.level}</div>
                </div>
              )}
            </div>
          )}
          
          {(cameraState === CameraState.PLAYING || cameraState === CameraState.STARTING || cameraState === CameraState.ERROR) && (
            <div className="absolute top-4 right-4 w-48 shadow-2xl z-20 flex flex-col gap-2">
              <CameraPreview 
                ref={videoRef}
                stream={stream} 
                state={cameraState} 
                errorMsg={errorMsg}
                poseLandmarks={poseResult.landmarks ?? undefined}
              />
              
              {cameraState === CameraState.PLAYING && (
                <div className="bg-zinc-900/90 border border-white/10 rounded-lg p-3 backdrop-blur-md">
                  <div className="text-xs text-zinc-400 mb-1 font-semibold tracking-wider flex justify-between">
                    GAZE TRACKER
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">State:</span>
                    <span className={`font-bold ${
                      gazeResult.state === GazeState.UP ? 'text-blue-400' :
                      gazeResult.state === GazeState.DOWN ? 'text-purple-400' : 'text-green-400'
                    }`}>
                      {gazeResult.state}
                    </span>
                  </div>
                </div>
              )}

              {cameraState === CameraState.PLAYING && (
                <div className="bg-zinc-900/90 border border-white/10 rounded-lg p-3 backdrop-blur-md">
                  <div className="text-xs text-zinc-400 mb-2 font-semibold tracking-wider flex justify-between items-center">
                    PUSH-UPS
                  </div>
                  <div className="text-center py-1">
                    <span className="text-4xl font-black text-white">{pushUpResult.repCount}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm">State:</span>
                    <span className={`text-xs font-bold ${
                      pushUpResult.state === PushUpState.BOTTOM ? 'text-red-400' :
                      pushUpResult.state === PushUpState.MOVING_UP ? 'text-amber-400' :
                      pushUpResult.state === PushUpState.MOVING_DOWN ? 'text-blue-400' : 'text-green-400'
                    }`}>
                      {pushUpResult.state}
                    </span>
                  </div>
                  
                  {pushUpResult.lastFormResult && (
                    <div className="mt-2 border-t border-white/5 pt-2">
                      <div className="text-[10px] text-zinc-500 mb-1">LAST REP</div>
                      <div className={`text-xs font-bold px-2 py-1 rounded text-center ${
                        pushUpResult.lastFormResult.verdict === FormVerdict.GOOD ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {pushUpResult.lastFormResult.verdict}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
