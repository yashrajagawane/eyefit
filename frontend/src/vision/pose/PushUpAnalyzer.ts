import { NormalizedLandmark } from "@mediapipe/tasks-vision";

// --- Enums & Interfaces ---

export enum PushUpState {
  UP = "UP",
  MOVING_DOWN = "MOVING_DOWN",
  BOTTOM = "BOTTOM",
  MOVING_UP = "MOVING_UP",
}

export interface PushUpResult {
  /** The current phase of the push-up movement. */
  state: PushUpState;
  /** Total valid reps completed this session. */
  repCount: number;
  /** Average elbow angle in degrees (0–180). Useful for debug display. */
  elbowAngle: number;
  /** True if both arms' landmarks are visible enough to track. */
  isTracking: boolean;
}

// --- MediaPipe Pose landmark indices ---
// Left arm
const L_SHOULDER = 11;
const L_ELBOW = 13;
const L_WRIST = 15;
// Right arm
const R_SHOULDER = 12;
const R_ELBOW = 14;
const R_WRIST = 16;

// Minimum landmark visibility to be considered reliable
const MIN_VISIBILITY = 0.5;

// Angle thresholds for state transitions
const UP_THRESHOLD = 150;    // Arms roughly straight
const DOWN_THRESHOLD = 90;   // Arms bent near 90° (bottom of push-up)

// Minimum milliseconds between rep completions (debounce)
const REP_DEBOUNCE_MS = 500;

// --- Pure geometry helper ---

/**
 * Calculates the angle (in degrees) at point B formed by vectors B→A and B→C.
 */
function calculateAngle(
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  c: NormalizedLandmark
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360.0 - angle;
  return angle;
}

// --- Main Analyzer Class ---

export class PushUpAnalyzer {
  private state: PushUpState = PushUpState.UP;
  private repCount: number = 0;
  private lastRepTimestamp: number = 0;

  public reset(): void {
    this.state = PushUpState.UP;
    this.repCount = 0;
    this.lastRepTimestamp = 0;
  }

  public analyze(landmarks: NormalizedLandmark[]): PushUpResult {
    const lShoulder = landmarks[L_SHOULDER];
    const lElbow = landmarks[L_ELBOW];
    const lWrist = landmarks[L_WRIST];
    const rShoulder = landmarks[R_SHOULDER];
    const rElbow = landmarks[R_ELBOW];
    const rWrist = landmarks[R_WRIST];

    // Check if all key landmarks are visible enough
    const isTracking =
      (lShoulder?.visibility ?? 0) >= MIN_VISIBILITY &&
      (lElbow?.visibility ?? 0) >= MIN_VISIBILITY &&
      (lWrist?.visibility ?? 0) >= MIN_VISIBILITY &&
      (rShoulder?.visibility ?? 0) >= MIN_VISIBILITY &&
      (rElbow?.visibility ?? 0) >= MIN_VISIBILITY &&
      (rWrist?.visibility ?? 0) >= MIN_VISIBILITY;

    if (!isTracking) {
      return {
        state: this.state,
        repCount: this.repCount,
        elbowAngle: 0,
        isTracking: false,
      };
    }

    const leftAngle = calculateAngle(lShoulder, lElbow, lWrist);
    const rightAngle = calculateAngle(rShoulder, rElbow, rWrist);
    const avgAngle = (leftAngle + rightAngle) / 2;

    // Run state machine
    const now = performance.now();

    switch (this.state) {
      case PushUpState.UP:
        // Person starts moving down
        if (avgAngle < DOWN_THRESHOLD) {
          this.state = PushUpState.MOVING_DOWN;
        }
        break;

      case PushUpState.MOVING_DOWN:
        // Reached the bottom
        if (avgAngle < DOWN_THRESHOLD) {
          this.state = PushUpState.BOTTOM;
        }
        // Went back up without completing — reset
        if (avgAngle > UP_THRESHOLD) {
          this.state = PushUpState.UP;
        }
        break;

      case PushUpState.BOTTOM:
        // Person starts moving back up
        if (avgAngle > DOWN_THRESHOLD) {
          this.state = PushUpState.MOVING_UP;
        }
        break;

      case PushUpState.MOVING_UP:
        // Rep completed — arms straight again
        if (avgAngle > UP_THRESHOLD) {
          // Debounce: only count if enough time has passed
          if (now - this.lastRepTimestamp > REP_DEBOUNCE_MS) {
            this.repCount += 1;
            this.lastRepTimestamp = now;
          }
          this.state = PushUpState.UP;
        }
        // Went back down — they didn't finish, back to BOTTOM
        if (avgAngle < DOWN_THRESHOLD) {
          this.state = PushUpState.BOTTOM;
        }
        break;
    }

    return {
      state: this.state,
      repCount: this.repCount,
      elbowAngle: Math.round(avgAngle),
      isTracking: true,
    };
  }
}
