"use client";

import GameCanvas from "@/components/game/GameCanvas";
import { CameraPreview } from "@/components/camera/CameraPreview";
import { useCamera, CameraState } from "@/hooks/useCamera";

export default function PlayRoute() {
  const { stream, state: cameraState, errorMsg, startCamera, stopCamera } = useCamera();

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-6 bg-[#09090b]">
      <div className="w-full max-w-5xl">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">Eye Flap Mode</h1>
            <p className="text-zinc-400">Pure game mode testing (Phase 4)</p>
          </div>
          
          <div>
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
          
          {/* Picture-in-picture Camera Preview */}
          {(cameraState === CameraState.PLAYING || cameraState === CameraState.STARTING || cameraState === CameraState.ERROR) && (
            <div className="absolute top-4 right-4 w-48 shadow-2xl z-20">
              <CameraPreview 
                stream={stream} 
                state={cameraState} 
                errorMsg={errorMsg} 
              />
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center text-zinc-500">
          <p>Controls: Use SPACEBAR to flap. P or ESC to pause.</p>
        </div>
      </div>
    </div>
  );
}
