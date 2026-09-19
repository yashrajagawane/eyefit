// --- Signals fed into the adaptive engine each cycle ---
export interface DifficultySignals {
  /** Current game score (obstacles cleared). */
  gameScore: number;
  /** 0–1: fraction of obstacles that resulted in a hit (0 = perfect, 1 = every obstacle). */
  collisionRate: number;
  /** 0–100: percentage of recent gaze frames classified as CENTER. */
  gazeStability: number;
  /** 0–100: rolling average form score from recent push-up reps. */
  liveFormScore: number;
  /** 0–100: estimated fatigue from rep-duration slowing. */
  liveFatigue: number;
}

export type DifficultyLevel = 'EASY' | 'NORMAL' | 'HARD' | 'EXTREME';

export interface DifficultyResult {
  /** Multiplier applied on top of the score-based base speed. Range: 0.6 – 1.5 */
  modifier: number;
  /** Human-readable label for the HUD. */
  level: DifficultyLevel;
}

// --- Struggling thresholds (any one of these triggers the safety cap) ---
const STRUGGLE_COLLISION_RATE = 0.30; // >30% pipes hit
const STRUGGLE_FORM_SCORE     = 50;   // form below 50
const STRUGGLE_FATIGUE        = 70;   // fatigue above 70
const STRUGGLE_GAZE           = 40;   // gaze stability below 40%

// --- Performance bonus thresholds ---
const BONUS_SCORE_TIER1       = 10;
const BONUS_SCORE_TIER2       = 20;
const BONUS_GAZE_STABILITY    = 80;
const BONUS_FORM_SCORE        = 75;
const BONUS_LOW_COLLISION     = 0.10; // < 10% collision rate

export class DifficultyEngine {
  /**
   * Given a snapshot of live signals, compute an adaptive difficulty modifier.
   * The safety principle is enforced: modifier is capped at 1.0 if the user is
   * struggling on ANY signal.
   */
  public compute(signals: DifficultySignals): DifficultyResult {
    const isStruggling =
      signals.collisionRate > STRUGGLE_COLLISION_RATE ||
      (signals.liveFormScore > 0 && signals.liveFormScore < STRUGGLE_FORM_SCORE) ||
      signals.liveFatigue > STRUGGLE_FATIGUE ||
      (signals.gazeStability > 0 && signals.gazeStability < STRUGGLE_GAZE);

    // Start from baseline
    let modifier = 1.0;

    // Bonuses only apply when NOT struggling
    if (!isStruggling) {
      if (signals.gameScore >= BONUS_SCORE_TIER2) modifier += 0.25;
      else if (signals.gameScore >= BONUS_SCORE_TIER1) modifier += 0.1;

      if (signals.gazeStability >= BONUS_GAZE_STABILITY) modifier += 0.1;
      if (signals.liveFormScore >= BONUS_FORM_SCORE)     modifier += 0.1;
      if (signals.collisionRate < BONUS_LOW_COLLISION && signals.gameScore > 2) modifier += 0.05;
    }

    // If struggling, ease off below baseline
    if (isStruggling) {
      if (signals.collisionRate > 0.5) modifier = 0.7;
      else if (signals.collisionRate > 0.4) modifier = 0.8;
      else modifier = 0.9;
    }

    // Final clamp
    modifier = Math.max(0.6, Math.min(1.5, modifier));

    const level: DifficultyLevel =
      modifier >= 1.4 ? 'EXTREME' :
      modifier >= 1.15 ? 'HARD' :
      modifier >= 0.95 ? 'NORMAL' :
      'EASY';

    return { modifier, level };
  }
}
