"use client";

import React, { useEffect, useRef } from "react";
import { CameraState } from "@/hooks/useCamera";

interface CameraPreviewProps {
  stream: MediaStream | null;
  state: CameraState;
  errorMsg: string | null;
}

export function CameraPreview({ stream, state, errorMsg }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-white/10 shadow-lg flex items-center justify-center">
      
      {state === CameraState.IDLE && (
        <div className="text-zinc-500 font-medium text-sm flex flex-col items-center gap-2">
          <span className="text-2xl">📷</span>
          <span>Camera Idle</span>
        </div>
      )}
      
      {state === CameraState.STARTING && (
        <div className="text-primary font-medium text-sm flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Starting Camera...</span>
        </div>
      )}
      
      {state === CameraState.ERROR && (
        <div className="text-red-400 font-medium text-sm flex flex-col items-center gap-2 text-center p-4">
          <span className="text-2xl">⚠️</span>
          <span>{errorMsg || "Camera Error"}</span>
        </div>
      )}

      {/* Render the video element if we have a stream, regardless of EXACT state enum just to be safe */}
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }} // Mirror the camera
        />
      )}
      
      {/* Small live indicator */}
      {state === CameraState.PLAYING && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded text-[10px] font-bold text-white tracking-wider backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          LIVE
        </div>
      )}
    </div>
  );
}
