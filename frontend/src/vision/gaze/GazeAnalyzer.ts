import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export enum GazeState {
  UP = "UP",
  CENTER = "CENTER",
  DOWN = "DOWN",
}

export interface GazeResult {
  state: GazeState;
  confidence: number;
  rawRatio: number;
}

export interface GazeThresholds {
  upThreshold: number;
  downThreshold: number;
}

export class GazeAnalyzer {
  // Landmark indices for the Left Eye
  private static LEFT_EYE_TOP = 159;
  private static LEFT_EYE_BOTTOM = 145;
  private static LEFT_IRIS_CENTER = 468;

  // Landmark indices for the Right Eye
  private static RIGHT_EYE_TOP = 386;
  private static RIGHT_EYE_BOTTOM = 374;
  private static RIGHT_IRIS_CENTER = 473;

  // History for temporal smoothing
  private history: GazeState[] = [];
  private readonly historySize = 5;

  public analyze(landmarks: NormalizedLandmark[], thresholds?: GazeThresholds): GazeResult {
    // 1. Calculate vertical gaze ratio for Left Eye
    const leftRatio = this.calculateVerticalRatio(
      landmarks[GazeAnalyzer.LEFT_EYE_TOP],
      landmarks[GazeAnalyzer.LEFT_EYE_BOTTOM],
      landmarks[GazeAnalyzer.LEFT_IRIS_CENTER]
    );

    // 2. Calculate vertical gaze ratio for Right Eye
    const rightRatio = this.calculateVerticalRatio(
      landmarks[GazeAnalyzer.RIGHT_EYE_TOP],
      landmarks[GazeAnalyzer.RIGHT_EYE_BOTTOM],
      landmarks[GazeAnalyzer.RIGHT_IRIS_CENTER]
    );

    // Average the two eyes
    const avgRatio = (leftRatio + rightRatio) / 2;

    // Use provided thresholds or fallback to defaults
    const upThreshold = thresholds?.upThreshold ?? 0.40;
    const downThreshold = thresholds?.downThreshold ?? 0.60;
    const centerThreshold = (upThreshold + downThreshold) / 2;

    // 3. Classify based on ratio
    let rawState = GazeState.CENTER;
    
    if (avgRatio < upThreshold) {
      rawState = GazeState.UP;
    } else if (avgRatio > downThreshold) {
      rawState = GazeState.DOWN;
    }

    // 4. Apply temporal smoothing
    const smoothedState = this.smooth(rawState);

    // 5. Calculate a mock confidence based on how extreme the ratio is
    let confidence = 0;
    if (smoothedState === GazeState.CENTER) {
      // Distance from center threshold
      const maxDist = Math.max(downThreshold - centerThreshold, centerThreshold - upThreshold);
      const dist = Math.abs(centerThreshold - avgRatio);
      confidence = 100 - (dist / maxDist) * 100;
    } else if (smoothedState === GazeState.UP) {
      // Max range from upThreshold to say 0.2
      confidence = ((upThreshold - avgRatio) / 0.15) * 100; 
    } else if (smoothedState === GazeState.DOWN) {
      // Max range from downThreshold to say 0.8
      confidence = ((avgRatio - downThreshold) / 0.15) * 100;
    }

    return {
      state: smoothedState,
      confidence: Math.min(100, Math.max(0, Math.round(confidence))),
      rawRatio: avgRatio
    };
  }

  private calculateVerticalRatio(top: NormalizedLandmark, bottom: NormalizedLandmark, iris: NormalizedLandmark): number {
    const eyeHeight = bottom.y - top.y;
    if (eyeHeight <= 0) return 0.5; // Avoid division by zero or negative heights
    
    // Ratio = Distance from top to iris / Total eye height
    return (iris.y - top.y) / eyeHeight;
  }

  private smooth(currentState: GazeState): GazeState {
    this.history.push(currentState);
    if (this.history.length > this.historySize) {
      this.history.shift();
    }

    // Find the most frequent state in the history window
    const counts: Record<string, number> = {
      [GazeState.UP]: 0,
      [GazeState.CENTER]: 0,
      [GazeState.DOWN]: 0,
    };

    for (const state of this.history) {
      counts[state]++;
    }

    let dominantState = currentState;
    let maxCount = 0;

    for (const [state, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantState = state as GazeState;
      }
    }

    return dominantState;
  }
}
