import { NormalizedLandmark } from "@mediapipe/tasks-vision";

// --- Form Analysis Types ---

export enum FormVerdict {
  GOOD = "GOOD",
  SHALLOW = "SHALLOW",
  INCOMPLETE = "INCOMPLETE",
  MISALIGNED = "MISALIGNED",
  TRACKING_ERROR = "TRACKING_ERROR",
}

export interface FormResult {
  /** The overall verdict for the last completed rep. */
  verdict: FormVerdict;
  /** Human-readable explanation. */
  detail: string;
  /** Numeric score 0–100 for future analytics use. */
  score: number;
}

// --- Rep State Machine ---

export enum PushUpState {
  UP = "UP",
  MOVING_DOWN = "MOVING_DOWN",
  BOTTOM = "BOTTOM",
  MOVING_UP = "MOVING_UP",
}

export interface PushUpResult {
  state: PushUpState;
  repCount: number;
  elbowAngle: number;
  isTracking: boolean;
  /** Form result of the most recently completed rep. Null before any rep. */
  lastFormResult: FormResult | null;
}

// --- Landmark Indices ---
const L_SHOULDER = 11;
const L_ELBOW    = 13;
const L_WRIST    = 15;
const R_SHOULDER = 12;
const R_ELBOW    = 14;
const R_WRIST    = 16;
const L_HIP      = 23;
const R_HIP      = 24;
const L_ANKLE    = 27;
const R_ANKLE    = 28;

// --- Thresholds ---
const MIN_VISIBILITY    = 0.5;
const UP_THRESHOLD      = 150; // Arms straight (top of push-up)
const DOWN_THRESHOLD    = 90;  // Arms bent (bottom of push-up)
const REP_DEBOUNCE_MS   = 500;

// Form thresholds
const DEPTH_GOOD        = 92;  // Elbow angle at bottom must be ≤ this
const EXTENSION_GOOD    = 148; // Elbow angle at top must be ≥ this
const ALIGNMENT_GOOD    = 158; // Shoulder-Hip-Ankle angle must be ≥ this (straight plank)

// --- Geometry Helpers ---

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

function landmarkVisible(lm: NormalizedLandmark | undefined): boolean {
  return (lm?.visibility ?? 0) >= MIN_VISIBILITY;
}

// --- Analyzer ---

export class PushUpAnalyzer {
  private state: PushUpState = PushUpState.UP;
  private repCount: number = 0;
  private lastRepTimestamp: number = 0;
  private lastFormResult: FormResult | null = null;

  // Per-rep tracking fields
  private minElbowAngle: number = 180;   // Lowest angle seen (depth check)
  private maxElbowAngle: number = 0;     // Highest angle seen (extension check)
  private minBodyAlignment: number = 180; // Lowest body line angle (alignment check)
  private hadTrackingGap: boolean = false;

  public reset(): void {
    this.state = PushUpState.UP;
    this.repCount = 0;
    this.lastRepTimestamp = 0;
    this.lastFormResult = null;
    this.resetRepTracking();
  }

  private resetRepTracking(): void {
    this.minElbowAngle = 180;
    this.maxElbowAngle = 0;
    this.minBodyAlignment = 180;
    this.hadTrackingGap = false;
  }

  private evaluateForm(): FormResult {
    if (this.hadTrackingGap) {
      return { verdict: FormVerdict.TRACKING_ERROR, detail: "Tracking lost mid-rep", score: 0 };
    }

    // Check depth first (most common issue)
    if (this.minElbowAngle > DEPTH_GOOD) {
      return {
        verdict: FormVerdict.SHALLOW,
        detail: `Go deeper — bottom angle was ${Math.round(this.minElbowAngle)}° (target ≤${DEPTH_GOOD}°)`,
        score: Math.max(0, Math.round(100 - (this.minElbowAngle - DEPTH_GOOD) * 3)),
      };
    }

    // Check full extension at top
    if (this.maxElbowAngle < EXTENSION_GOOD) {
      return {
        verdict: FormVerdict.INCOMPLETE,
        detail: `Extend fully at top — reached ${Math.round(this.maxElbowAngle)}° (target ≥${EXTENSION_GOOD}°)`,
        score: Math.max(0, Math.round(100 - (EXTENSION_GOOD - this.maxElbowAngle) * 3)),
      };
    }

    // Check body alignment (only penalise if hips/ankles were visible)
    if (this.minBodyAlignment < ALIGNMENT_GOOD && this.minBodyAlignment > 0) {
      return {
        verdict: FormVerdict.MISALIGNED,
        detail: `Keep body straight — alignment was ${Math.round(this.minBodyAlignment)}° (target ≥${ALIGNMENT_GOOD}°)`,
        score: Math.max(0, Math.round(100 - (ALIGNMENT_GOOD - this.minBodyAlignment) * 2)),
      };
    }

    return { verdict: FormVerdict.GOOD, detail: "Great rep!", score: 100 };
  }

  public analyze(landmarks: NormalizedLandmark[]): PushUpResult {
    const lShoulder = landmarks[L_SHOULDER];
    const lElbow    = landmarks[L_ELBOW];
    const lWrist    = landmarks[L_WRIST];
    const rShoulder = landmarks[R_SHOULDER];
    const rElbow    = landmarks[R_ELBOW];
    const rWrist    = landmarks[R_WRIST];

    const isTracking =
      landmarkVisible(lShoulder) && landmarkVisible(lElbow) && landmarkVisible(lWrist) &&
      landmarkVisible(rShoulder) && landmarkVisible(rElbow) && landmarkVisible(rWrist);

    if (!isTracking) {
      // Mark gap so form evaluator knows tracking was lost
      if (this.state !== PushUpState.UP) this.hadTrackingGap = true;
      return {
        state: this.state,
        repCount: this.repCount,
        elbowAngle: 0,
        isTracking: false,
        lastFormResult: this.lastFormResult,
      };
    }

    const leftAngle  = calculateAngle(lShoulder, lElbow, lWrist);
    const rightAngle = calculateAngle(rShoulder, rElbow, rWrist);
    const avgAngle   = (leftAngle + rightAngle) / 2;

    // --- Track per-rep extremes ---
    if (avgAngle < this.minElbowAngle) this.minElbowAngle = avgAngle;
    if (avgAngle > this.maxElbowAngle) this.maxElbowAngle = avgAngle;

    // Body alignment: use shoulder → hip → ankle (prefer left side, fall back to right)
    const lHip   = landmarks[L_HIP];
    const rHip   = landmarks[R_HIP];
    const lAnkle = landmarks[L_ANKLE];
    const rAnkle = landmarks[R_ANKLE];

    if (landmarkVisible(lShoulder) && landmarkVisible(lHip) && landmarkVisible(lAnkle)) {
      const align = calculateAngle(lShoulder, lHip, lAnkle);
      if (align < this.minBodyAlignment) this.minBodyAlignment = align;
    } else if (landmarkVisible(rShoulder) && landmarkVisible(rHip) && landmarkVisible(rAnkle)) {
      const align = calculateAngle(rShoulder, rHip, rAnkle);
      if (align < this.minBodyAlignment) this.minBodyAlignment = align;
    }

    // --- State machine ---
    const now = performance.now();

    switch (this.state) {
      case PushUpState.UP:
        if (avgAngle < DOWN_THRESHOLD) {
          this.resetRepTracking();
          this.state = PushUpState.MOVING_DOWN;
        }
        break;

      case PushUpState.MOVING_DOWN:
        if (avgAngle < DOWN_THRESHOLD) {
          this.state = PushUpState.BOTTOM;
        }
        if (avgAngle > UP_THRESHOLD) {
          this.state = PushUpState.UP;
        }
        break;

      case PushUpState.BOTTOM:
        if (avgAngle > DOWN_THRESHOLD) {
          this.state = PushUpState.MOVING_UP;
        }
        break;

      case PushUpState.MOVING_UP:
        if (avgAngle > UP_THRESHOLD) {
          if (now - this.lastRepTimestamp > REP_DEBOUNCE_MS) {
            this.repCount += 1;
            this.lastRepTimestamp = now;
            this.lastFormResult = this.evaluateForm();
          }
          this.state = PushUpState.UP;
        }
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
      lastFormResult: this.lastFormResult,
    };
  }
}
