"use client";

import { useRef } from "react";
import GameCanvas from "@/components/game/GameCanvas";
import { CameraPreview } from "@/components/camera/CameraPreview";
import { useCamera, CameraState } from "@/hooks/useCamera";
import { useGaze } from "@/hooks/useGaze";
import { GazeState } from "@/vision/gaze/GazeAnalyzer";

export default function PlayRoute() {
  const { stream, state: cameraState, errorMsg, startCamera, stopCamera } = useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Only process gaze if the camera is actually playing
  const { gazeResult, isVisionReady } = useGaze(videoRef, cameraState === CameraState.PLAYING);

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-6 bg-[#09090b]">
      <div className="w-full max-w-5xl">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">Eye Flap Mode</h1>
            <p className="text-zinc-400">Phase 5: CV Pipeline & Gaze Tracking Debug</p>
          </div>
          
          <div className="flex items-center gap-4">
            {isVisionReady ? (
              <span className="text-green-400 text-sm font-medium">CV Model Loaded</span>
            ) : (
              <span className="text-amber-400 text-sm font-medium flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                Loading CV...
              </span>
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
          <GameCanvas />
          
          {/* Picture-in-picture Camera Preview & Gaze Debug UI */}
          {(cameraState === CameraState.PLAYING || cameraState === CameraState.STARTING || cameraState === CameraState.ERROR) && (
            <div className="absolute top-4 right-4 w-48 shadow-2xl z-20 flex flex-col gap-2">
              <CameraPreview 
                ref={videoRef}
                stream={stream} 
                state={cameraState} 
                errorMsg={errorMsg} 
              />
              
              {/* Gaze Debug Overlay */}
              {cameraState === CameraState.PLAYING && (
                <div className="bg-zinc-900/90 border border-white/10 rounded-lg p-3 backdrop-blur-md">
                  <div className="text-xs text-zinc-400 mb-1 font-semibold tracking-wider">GAZE TRACKER</div>
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
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center text-zinc-500">
          <p>Controls: Use SPACEBAR to flap. P or ESC to pause. (Gaze control coming in Phase 7)</p>
        </div>
      </div>
    </div>
  );
}
