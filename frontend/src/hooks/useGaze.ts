import { useState, useEffect, useRef } from "react";
import { FaceTracker } from "../vision/face/FaceTracker";
import { GazeAnalyzer, GazeResult, GazeState, GazeThresholds } from "../vision/gaze/GazeAnalyzer";

export function useGaze(
  videoRef: React.RefObject<HTMLVideoElement | null>, 
  isPlaying: boolean,
  thresholds?: GazeThresholds
) {
  const [gazeResult, setGazeResult] = useState<GazeResult>({ state: GazeState.CENTER, confidence: 100, rawRatio: 0.5 });
  const [isVisionReady, setIsVisionReady] = useState(false);
  
  const faceTrackerRef = useRef<FaceTracker | null>(null);
  const gazeAnalyzerRef = useRef<GazeAnalyzer | null>(null);
  const requestRef = useRef<number>(0);

  // Initialize models
  useEffect(() => {
    let isMounted = true;
    
    const initVision = async () => {
      try {
        const tracker = FaceTracker.getInstance();
        await tracker.initialize();
        
        if (isMounted) {
          faceTrackerRef.current = tracker;
          gazeAnalyzerRef.current = new GazeAnalyzer();
          setIsVisionReady(true);
        }
      } catch (err) {
        console.error("Failed to initialize vision models:", err);
      }
    };

    initVision();

    return () => {
      isMounted = false;
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Process video frames
  useEffect(() => {
    if (!isVisionReady || !isPlaying || !videoRef.current || !faceTrackerRef.current || !gazeAnalyzerRef.current) {
      return;
    }

    const video = videoRef.current;
    
    const processFrame = () => {
      // Make sure video has valid dimensions and is playing
      if (video.videoWidth > 0 && video.readyState >= 2) {
        const timestampMs = performance.now();
        const landmarks = faceTrackerRef.current?.detectFace(video, timestampMs);
        
        if (landmarks && gazeAnalyzerRef.current) {
          const result = gazeAnalyzerRef.current.analyze(landmarks, thresholds);
          // Only trigger a re-render if the state actually changes or we want continuous confidence updates
          // For now, we update it continuously so the debug UI shows live confidence
          setGazeResult(result);
        }
      }
      
      requestRef.current = requestAnimationFrame(processFrame);
    };

    requestRef.current = requestAnimationFrame(processFrame);

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [isVisionReady, isPlaying, videoRef, thresholds]);

  return {
    gazeResult,
    isVisionReady
  };
}
