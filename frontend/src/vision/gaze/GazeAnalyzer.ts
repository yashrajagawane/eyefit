import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export enum GazeState {
  UP = "UP",
  CENTER = "CENTER",
  DOWN = "DOWN",
}

export interface GazeResult {
  state: GazeState;
  confidence: number;
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

  public analyze(landmarks: NormalizedLandmark[]): GazeResult {
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

    // 3. Classify based on ratio
    // The ratio is (iris_y - top_y) / (bottom_y - top_y). 
    // Closer to 0 means looking UP. Closer to 1 means looking DOWN.
    let rawState = GazeState.CENTER;
    
    // These thresholds can be fine-tuned or moved to a calibration phase later
    if (avgRatio < 0.40) {
      rawState = GazeState.UP;
    } else if (avgRatio > 0.60) {
      rawState = GazeState.DOWN;
    }

    // 4. Apply temporal smoothing
    const smoothedState = this.smooth(rawState);

    // 5. Calculate a mock confidence based on how extreme the ratio is
    let confidence = 0;
    if (smoothedState === GazeState.CENTER) {
      // Confidence is highest when ratio is exactly 0.5
      confidence = 100 - Math.abs(0.5 - avgRatio) * 200;
    } else if (smoothedState === GazeState.UP) {
      // Confidence is highest when ratio is closer to 0
      confidence = (0.40 - avgRatio) * 300; 
    } else if (smoothedState === GazeState.DOWN) {
      // Confidence is highest when ratio is closer to 1
      confidence = (avgRatio - 0.60) * 300;
    }

    return {
      state: smoothedState,
      confidence: Math.min(100, Math.max(0, Math.round(confidence)))
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
