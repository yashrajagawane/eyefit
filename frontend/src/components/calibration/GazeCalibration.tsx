import React from "react";
import { CalibrationStep } from "@/hooks/useCalibration";

interface GazeCalibrationProps {
  step: CalibrationStep;
  progress: number;
  onCancel: () => void;
}

export function GazeCalibration({ step, progress, onCancel }: GazeCalibrationProps) {
  if (step === CalibrationStep.IDLE) return null;

  let title = "";
  let instructions = "";
  let icon = "";

  switch (step) {
    case CalibrationStep.CENTER:
      title = "Calibrate: Center";
      instructions = "Look perfectly straight at the center of the screen.";
      icon = "👀";
      break;
    case CalibrationStep.UP:
      title = "Calibrate: Up";
      instructions = "Look up at the top edge of your screen without moving your head.";
      icon = "⬆️";
      break;
    case CalibrationStep.DOWN:
      title = "Calibrate: Down";
      instructions = "Look down at your keyboard without moving your head.";
      icon = "⬇️";
      break;
    case CalibrationStep.DONE:
      title = "Calibration Complete!";
      instructions = "Your personalized thresholds have been saved.";
      icon = "✅";
      break;
  }

  return (
    <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
        <div className="text-6xl mb-6">{icon}</div>
        
        <h2 className="text-2xl font-bold mb-2 text-white">{title}</h2>
        <p className="text-zinc-400 mb-8">{instructions}</p>

        {step !== CalibrationStep.DONE && (
          <div className="w-full bg-zinc-800 rounded-full h-3 mb-6 overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {step !== CalibrationStep.DONE && (
          <button 
            onClick={onCancel}
            className="text-zinc-500 hover:text-white transition-colors text-sm font-medium"
          >
            Cancel Calibration
          </button>
        )}
      </div>
    </div>
  );
}
