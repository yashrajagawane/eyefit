import { useState, useEffect, useCallback } from "react";
import { GazeThresholds } from "../vision/gaze/GazeAnalyzer";

export enum CalibrationStep {
  IDLE = "IDLE",
  CENTER = "CENTER",
  UP = "UP",
  DOWN = "DOWN",
  DONE = "DONE"
}

// Local storage key
const CALIBRATION_KEY = "eyefit_gaze_thresholds";

export function useCalibration(currentRawRatio: number) {
  const [step, setStep] = useState<CalibrationStep>(CalibrationStep.IDLE);
  const [thresholds, setThresholds] = useState<GazeThresholds | undefined>(undefined);
  
  // State for collecting samples
  const [, setSamples] = useState<number[]>([]);
  const [progress, setProgress] = useState(0); // 0 to 100 for current step
  
  // Stored averages
  const [centerRatio, setCenterRatio] = useState<number | null>(null);
  const [upRatio, setUpRatio] = useState<number | null>(null);
  const [downRatio, setDownRatio] = useState<number | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CALIBRATION_KEY);
      if (stored) {
        // eslint-disable-next-line
        setThresholds(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to parse calibration from localStorage", e);
    }
  }, []);

  const startCalibration = useCallback(() => {
    setStep(CalibrationStep.CENTER);
    setSamples([]);
    setProgress(0);
    setCenterRatio(null);
    setUpRatio(null);
    setDownRatio(null);
  }, []);

  const cancelCalibration = useCallback(() => {
    setStep(CalibrationStep.IDLE);
    setSamples([]);
    setProgress(0);
  }, []);

  const clearCalibration = useCallback(() => {
    localStorage.removeItem(CALIBRATION_KEY);
    setThresholds(undefined);
  }, []);

  // Collection effect
  useEffect(() => {
    if (step === CalibrationStep.IDLE || step === CalibrationStep.DONE) return;

    // Add current raw ratio to samples
    if (currentRawRatio > 0 && currentRawRatio < 1) {
      // eslint-disable-next-line
      setSamples((prev) => {
        const next = [...prev, currentRawRatio];
        
        // We need about 60 samples (approx 1 second at 60fps)
        const targetSamples = 60;
        setProgress(Math.min(100, (next.length / targetSamples) * 100));

        if (next.length >= targetSamples) {
          // Calculate average
          const sum = next.reduce((a, b) => a + b, 0);
          const avg = sum / next.length;

          // Move to next step
          setTimeout(() => {
            if (step === CalibrationStep.CENTER) {
              setCenterRatio(avg);
              setStep(CalibrationStep.UP);
            } else if (step === CalibrationStep.UP) {
              setUpRatio(avg);
              setStep(CalibrationStep.DOWN);
            } else if (step === CalibrationStep.DOWN) {
              setDownRatio(avg);
              setStep(CalibrationStep.DONE);
            }
            setSamples([]);
            setProgress(0);
          }, 300); // Small pause for UX
        }
        
        return next;
      });
    }
  }, [currentRawRatio, step]);

  // Finalize calibration when DONE
  useEffect(() => {
    if (step === CalibrationStep.DONE && centerRatio !== null && upRatio !== null && downRatio !== null) {
      // Calculate final thresholds.
      const newThresholds: GazeThresholds = {
        upThreshold: (centerRatio + upRatio) / 2,
        downThreshold: (centerRatio + downRatio) / 2
      };
      
      // eslint-disable-next-line
      setThresholds(newThresholds);
      try {
        localStorage.setItem(CALIBRATION_KEY, JSON.stringify(newThresholds));
      } catch (e) {
        console.warn("Could not save to localStorage", e);
      }
      
      // Auto-hide after 2 seconds
      setTimeout(() => {
        setStep(CalibrationStep.IDLE);
      }, 2000);
    }
  }, [step, centerRatio, upRatio, downRatio]);

  return {
    step,
    progress,
    thresholds,
    startCalibration,
    cancelCalibration,
    clearCalibration,
    isCalibrating: step !== CalibrationStep.IDLE && step !== CalibrationStep.DONE
  };
}
