"use client";

import React, { useEffect, useRef, forwardRef } from "react";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { CameraState } from "@/hooks/useCamera";

// MediaPipe Pose Landmark indices for the connections we care about
const POSE_CONNECTIONS: [number, number][] = [
  // Torso
  [11, 12], // Left shoulder — Right shoulder
  [11, 23], // Left shoulder — Left hip
  [12, 24], // Right shoulder — Right hip
  [23, 24], // Left hip — Right hip
  // Left arm
  [11, 13], // Left shoulder — Left elbow
  [13, 15], // Left elbow — Left wrist
  // Right arm
  [12, 14], // Right shoulder — Right elbow
  [14, 16], // Right elbow — Right wrist
];

// Indices of joints to draw as dots
const POSE_JOINTS = [11, 12, 13, 14, 15, 16, 23, 24];

interface CameraPreviewProps {
  stream: MediaStream | null;
  state: CameraState;
  errorMsg: string | null;
  poseLandmarks?: NormalizedLandmark[];
}

export const CameraPreview = forwardRef<HTMLVideoElement, CameraPreviewProps>(
  ({ stream, state, errorMsg, poseLandmarks }, ref) => {
    const innerRef = (ref as React.MutableRefObject<HTMLVideoElement>) || React.createRef<HTMLVideoElement>();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      if (innerRef.current && stream) {
        innerRef.current.srcObject = stream;
      }
    }, [stream, innerRef]);

    // Draw skeleton overlay on the canvas whenever pose landmarks change
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Always clear the previous frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!poseLandmarks || poseLandmarks.length === 0) return;

      const w = canvas.width;
      const h = canvas.height;

      // The video is mirrored with scaleX(-1) in CSS, so we mirror the canvas drawing too
      ctx.save();
      ctx.translate(w, 0);
      ctx.scale(-1, 1);

      // Draw connection lines (bones)
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(99, 220, 190, 0.8)"; // teal
      for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
        const start = poseLandmarks[startIdx];
        const end = poseLandmarks[endIdx];
        if (!start || !end) continue;
        // Skip low-visibility landmarks
        if ((start.visibility ?? 1) < 0.4 || (end.visibility ?? 1) < 0.4) continue;

        ctx.beginPath();
        ctx.moveTo(start.x * w, start.y * h);
        ctx.lineTo(end.x * w, end.y * h);
        ctx.stroke();
      }

      // Draw joint dots
      for (const idx of POSE_JOINTS) {
        const lm = poseLandmarks[idx];
        if (!lm || (lm.visibility ?? 1) < 0.4) continue;

        ctx.beginPath();
        ctx.arc(lm.x * w, lm.y * h, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(250, 200, 50, 0.95)"; // gold dots
        ctx.fill();
      }

      ctx.restore();
    }, [poseLandmarks]);

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

        {/* Skeleton canvas overlay */}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
        
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
