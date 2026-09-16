"use client";

import React, { useEffect, forwardRef } from "react";
import { CameraState } from "@/hooks/useCamera";

interface CameraPreviewProps {
  stream: MediaStream | null;
  state: CameraState;
  errorMsg: string | null;
}

export const CameraPreview = forwardRef<HTMLVideoElement, CameraPreviewProps>(
  ({ stream, state, errorMsg }, ref) => {
    // If no external ref is provided, we still need a fallback for the srcObject effect
    // But in this app, we will always provide one from the parent. 
    // To be perfectly safe, we'll assign the stream when the ref is attached, or use a callback ref.
    
    // An alternative is just handling srcObject in the parent, but keeping it here is cleaner.
    // Let's use a local effect and assume `ref` is a MutableRefObject if passed.
    
    // In React 19, forwardRef is technically deprecated in favor of just `ref` prop, 
    // but forwardRef works fine. Let's cast it so we can use it locally too.
    const innerRef = (ref as React.MutableRefObject<HTMLVideoElement>) || React.createRef<HTMLVideoElement>();

    useEffect(() => {
      if (innerRef.current && stream) {
        innerRef.current.srcObject = stream;
      }
    }, [stream, innerRef]);

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

        {/* Render the video element if we have a stream */}
        {stream && (
          <video
            ref={innerRef}
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
);

CameraPreview.displayName = "CameraPreview";
