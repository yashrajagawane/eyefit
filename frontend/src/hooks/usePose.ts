import { useState, useEffect, useRef } from "react";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { PoseTracker } from "../vision/pose/PoseTracker";

export interface PoseResult {
  landmarks: NormalizedLandmark[] | null;
  isPoseDetected: boolean;
}

export function usePose(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isPlaying: boolean
) {
  const [poseResult, setPoseResult] = useState<PoseResult>({
    landmarks: null,
    isPoseDetected: false,
  });
  const [isPoseReady, setIsPoseReady] = useState(false);

  const poseTrackerRef = useRef<PoseTracker | null>(null);
  const requestRef = useRef<number>(0);

  // Initialize the model
  useEffect(() => {
    let isMounted = true;

    const initPose = async () => {
      try {
        const tracker = PoseTracker.getInstance();
        await tracker.initialize();

        if (isMounted) {
          poseTrackerRef.current = tracker;
          setIsPoseReady(true);
        }
      } catch (err) {
        console.error("Failed to initialize PoseTracker:", err);
      }
    };

    initPose();

    return () => {
      isMounted = false;
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Process video frames
  useEffect(() => {
    if (!isPoseReady || !isPlaying || !videoRef.current || !poseTrackerRef.current) {
      return;
    }

    const video = videoRef.current;
    let lastRenderTime = 0;

    const processFrame = () => {
      if (video.videoWidth > 0 && video.readyState >= 2) {
        const timestampMs = performance.now();
        const landmarks = poseTrackerRef.current?.detectPose(video, timestampMs);

        // Throttle React state updates to ~30 FPS (33ms) to save CPU/battery
        if (timestampMs - lastRenderTime > 33) {
          if (landmarks) {
            setPoseResult({ landmarks, isPoseDetected: true });
          } else {
            setPoseResult((prev) =>
              prev.isPoseDetected ? { landmarks: null, isPoseDetected: false } : prev
            );
          }
          lastRenderTime = timestampMs;
        }
      }

      requestRef.current = requestAnimationFrame(processFrame);
    };

    requestRef.current = requestAnimationFrame(processFrame);

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [isPoseReady, isPlaying, videoRef]);

  return { poseResult, isPoseReady };
}
