import { useState, useEffect, useRef } from "react";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { PushUpAnalyzer, PushUpResult, PushUpState } from "../vision/pose/PushUpAnalyzer";

export function usePushUp(poseLandmarks: NormalizedLandmark[] | null) {
  const [pushUpResult, setPushUpResult] = useState<PushUpResult>({
    state: PushUpState.UP,
    repCount: 0,
    elbowAngle: 0,
    isTracking: false,
    lastFormResult: null,
  });

  // Keep a single analyzer instance alive across renders
  const analyzerRef = useRef<PushUpAnalyzer>(new PushUpAnalyzer());

  useEffect(() => {
    if (!poseLandmarks || poseLandmarks.length === 0) {
      setPushUpResult((prev) =>
        prev.isTracking ? { ...prev, isTracking: false } : prev
      );
      return;
    }

    const result = analyzerRef.current.analyze(poseLandmarks);
    setPushUpResult(result);
  }, [poseLandmarks]);

  const resetReps = () => {
    analyzerRef.current.reset();
    setPushUpResult({
      state: PushUpState.UP,
      repCount: 0,
      elbowAngle: 0,
      isTracking: false,
      lastFormResult: null,
    });
  };

  return { pushUpResult, resetReps };
}
