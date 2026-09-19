"use client";

import { useRef, useState, useEffect } from "react";
import GameCanvas from "@/components/game/GameCanvas";
import { CameraPreview } from "@/components/camera/CameraPreview";
import { GazeCalibration } from "@/components/calibration/GazeCalibration";
import { useCamera, CameraState } from "@/hooks/useCamera";
import { useGaze } from "@/hooks/useGaze";
import { useCalibration } from "@/hooks/useCalibration";
import { usePose } from "@/hooks/usePose";
import { usePushUp } from "@/hooks/usePushUp";
import { useSessionAnalytics } from "@/hooks/useSessionAnalytics";
import { GameState } from "@/game/GameEngine";
import { GazeState } from "@/vision/gaze/GazeAnalyzer";
import { PushUpState, FormVerdict } from "@/vision/pose/PushUpAnalyzer"

export default function PlayRoute() {
  const { stream, state: cameraState, errorMsg, startCamera, stopCamera } = useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // We need to pass the raw ratio to the calibration hook
  const [currentRawRatio, setCurrentRawRatio] = useState(0.5);

  const { 
    step, 
    progress, 
    thresholds, 
    startCalibration, 
    cancelCalibration,
    clearCalibration,
    isCalibrating
  } = useCalibration(currentRawRatio);

  const { gazeResult, isVisionReady } = useGaze(videoRef, cameraState === CameraState.PLAYING, thresholds);
  const { poseResult, isPoseReady } = usePose(videoRef, cameraState === CameraState.PLAYING);
  const { pushUpResult, resetReps } = usePushUp(poseResult.landmarks);
  
  // Game state lifted from GameCanvas to feed analytics
  const [internalGameState, setInternalGameState] = useState<GameState>(GameState.READY);
  const [internalGameScore, setInternalGameScore] = useState<number>(0);
  
  const { sessionMetrics } = useSessionAnalytics(
    internalGameState,
    internalGameScore,
    pushUpResult
  );

  // Sync the raw ratio so calibration hook can use it
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentRawRatio(gazeResult.rawRatio);
  }, [gazeResult.rawRatio]);

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-6 bg-[#09090b]">
      {/* Calibration UI Overlay */}
      {isCalibrating && (
        <GazeCalibration 
          step={step}
          progress={progress}
          onCancel={cancelCalibration}
        />
      )}

      <div className="w-full max-w-5xl">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">Eye Flap Mode</h1>
            <p className="text-zinc-400">Phase 13: Fitness/Game Integration</p>
          </div>
          
          <div className="flex items-center gap-4">
            {isVisionReady ? (
              <span className="text-green-400 text-sm font-medium">Gaze ✓</span>
            ) : (
              <span className="text-amber-400 text-sm font-medium flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                Loading Gaze...
              </span>
            )}
            {isPoseReady ? (
              <span className="text-green-400 text-sm font-medium">Pose ✓</span>
            ) : (
              <span className="text-amber-400 text-sm font-medium flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                Loading Pose...
              </span>
            )}

            {cameraState === CameraState.PLAYING && !isCalibrating && (
              <div className="flex gap-2">
                <button 
                  onClick={startCalibration}
                  className="px-4 py-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 rounded-lg font-bold hover:bg-indigo-500/30 transition-colors"
                >
                  Calibrate Gaze
                </button>
                {thresholds && (
                  <button 
                    onClick={clearCalibration}
                    className="px-3 py-2 text-zinc-500 hover:text-red-400 transition-colors text-sm font-medium"
                    title="Clear saved calibration"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}

            {cameraState === CameraState.IDLE || cameraState === CameraState.ERROR ? (
              <button 
                onClick={startCamera}
                className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-accent transition-colors"
              >
                Enable Camera
              </button>
            ) : (
              <button 
                onClick={stopCamera}
                className="px-4 py-2 border border-white/20 text-white rounded-lg font-bold hover:bg-white/10 transition-colors"
              >
                Disable Camera
              </button>
            )}
          </div>
        </div>
        
        <div className="relative">
          <GameCanvas 
            gazeState={gazeResult.state}
            pushUpRepCount={pushUpResult.repCount}
            onGameStateChange={(state, score) => {
              setInternalGameState(state);
              setInternalGameScore(score);
              // Reset reps when transitioning from READY or GAME_OVER to PLAYING
              if (state === GameState.PLAYING && internalGameState !== GameState.PLAYING && internalGameState !== GameState.PAUSED) {
                resetReps();
              }
            }}
            sessionMetrics={sessionMetrics}
          />
          
          {/* Picture-in-picture Camera Preview & Gaze Debug UI */}
          {(cameraState === CameraState.PLAYING || cameraState === CameraState.STARTING || cameraState === CameraState.ERROR) && (
            <div className="absolute top-4 right-4 w-48 shadow-2xl z-20 flex flex-col gap-2">
              <CameraPreview 
                ref={videoRef}
                stream={stream} 
                state={cameraState} 
                errorMsg={errorMsg}
                poseLandmarks={poseResult.landmarks ?? undefined}
              />
              
              {/* Gaze Debug Overlay */}
              {cameraState === CameraState.PLAYING && (
                <div className="bg-zinc-900/90 border border-white/10 rounded-lg p-3 backdrop-blur-md">
                  <div className="text-xs text-zinc-400 mb-1 font-semibold tracking-wider flex justify-between">
                    GAZE TRACKER
                    {thresholds && <span className="text-indigo-400" title="Custom calibrated thresholds active">★</span>}
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
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Confidence:</span>
                    <span className="font-medium text-white">{gazeResult.confidence}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all duration-100" 
                      style={{ width: `${gazeResult.confidence}%` }}
                    ></div>
                  </div>
                  
                  {thresholds && (
                    <div className="mt-2 text-[10px] text-zinc-500 border-t border-white/5 pt-1">
                      Up: {thresholds.upThreshold.toFixed(2)} | Dn: {thresholds.downThreshold.toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              {/* Push-Up Rep Counter */}
              {cameraState === CameraState.PLAYING && (
                <div className="bg-zinc-900/90 border border-white/10 rounded-lg p-3 backdrop-blur-md">
                  <div className="text-xs text-zinc-400 mb-2 font-semibold tracking-wider flex justify-between items-center">
                    PUSH-UP COUNTER
                    <button
                      onClick={resetReps}
                      className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors"
                      title="Reset rep count"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Big rep number */}
                  <div className="text-center py-1">
                    <span className="text-4xl font-black text-white">{pushUpResult.repCount}</span>
                    <span className="text-zinc-500 text-xs ml-1">reps</span>
                  </div>

                  {/* State & angle */}
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm">State:</span>
                    <span className={`text-xs font-bold ${
                      pushUpResult.state === PushUpState.BOTTOM ? 'text-red-400' :
                      pushUpResult.state === PushUpState.MOVING_UP ? 'text-amber-400' :
                      pushUpResult.state === PushUpState.MOVING_DOWN ? 'text-blue-400' :
                      'text-green-400'
                    }`}>
                      {pushUpResult.state}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm">Angle:</span>
                    <span className="font-medium text-white">{pushUpResult.elbowAngle}°</span>
                  </div>

                  {/* Tracking indicator */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      pushUpResult.isTracking ? 'bg-green-400' : 'bg-zinc-600'
                    }`}/>
                    <span className="text-[10px] text-zinc-500">
                      {pushUpResult.isTracking ? 'Arms tracked' : 'Arms not visible'}
                    </span>
                  </div>

                  {/* Form verdict for last rep */}
                  {pushUpResult.lastFormResult && (
                    <div className="mt-2 border-t border-white/5 pt-2">
                      <div className="text-[10px] text-zinc-500 mb-1">LAST REP</div>
                      <div className={`text-xs font-bold px-2 py-1 rounded text-center ${
                        pushUpResult.lastFormResult.verdict === FormVerdict.GOOD
                          ? 'bg-green-500/20 text-green-400'
                          : pushUpResult.lastFormResult.verdict === FormVerdict.TRACKING_ERROR
                          ? 'bg-red-500/20 text-red-400'
                          : pushUpResult.lastFormResult.verdict === FormVerdict.MISALIGNED
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {pushUpResult.lastFormResult.verdict}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1 leading-tight">
                        {pushUpResult.lastFormResult.detail}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center text-zinc-500">
          <p>Controls: Look UP or use SPACEBAR to flap. P or ESC to pause.</p>
        </div>
      </div>
    </div>
  );
}
