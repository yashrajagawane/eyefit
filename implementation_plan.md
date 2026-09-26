# Phase 12: Fatigue & Performance Engine

This phase introduces an analytical layer on top of the session metrics to estimate the user's fatigue and provide a unified "Performance Score" at the end of the session.

## What We're Building

1. **Rep Data Enrichment**: Enhance `PushUpAnalyzer` to output more detailed per-rep metrics (duration, min/max angles).
2. **Fatigue Estimation**: A heuristic engine that compares early-session reps to late-session reps to detect slowdowns and form degradation.
3. **Performance Score**: A holistic 0-100 score summarizing the session's quality based on form, consistency, and endurance.

> [!NOTE]
> These values are performance estimates for gamification and tracking purposes, not medical measurements.

## Proposed Changes

### 1. Enhance `PushUpAnalyzer`

#### [MODIFY] [PushUpAnalyzer.ts](file:///c:/Users/agawa/OneDrive/Desktop/Antigravity%20Desktop%20Projects/GazeFlap/frontend/src/vision/pose/PushUpAnalyzer.ts)
- Add tracking for `repStartTime` (set when `state` transitions from `UP` to `MOVING_DOWN`).
- Add `repDurationMs`, `minElbowAngle`, and `maxElbowAngle` to the `FormResult` interface.
- Populate these new fields in the `evaluateForm` method.

### 2. Update Session Analytics & Create Fatigue Engine

#### [MODIFY] [useSessionAnalytics.ts](file:///c:/Users/agawa/OneDrive/Desktop/Antigravity%20Desktop%20Projects/GazeFlap/frontend/src/hooks/useSessionAnalytics.ts)
- Extend `SessionMetrics` to include `fatigueIndicator` (0-100) and `performanceScore` (0-100).
- Create a `calculateFatigueAndPerformance(formResults: FormResult[])` helper function.
- **Fatigue Logic**:
  - Compare the average duration of the first 25% of reps against the last 25% of reps.
  - If reps take significantly longer towards the end, fatigue increases.
  - Also factor in form degradation (if average form drops in the second half).
- **Performance Logic**:
  - Base heavily on the overall average form score.
  - Apply small penalties for high variance in rep durations (inconsistency).

### 3. Update the UI

#### [MODIFY] [GameCanvas.tsx](file:///c:/Users/agawa/OneDrive/Desktop/Antigravity%20Desktop%20Projects/GazeFlap/frontend/src/components/game/GameCanvas.tsx)
- Add the new `Fatigue` and `Performance` metrics to the GAME OVER session summary overlay.
- Use color-coding (e.g., Performance: Green = >80, Yellow = 50-80, Red = <50).

## Verification Plan

1. Do a session with fast, good-form push-ups. Expect a high performance score and low fatigue.
2. Do a session where the first few push-ups are fast, and the last few take a long time to complete and have shallower depth. Expect the fatigue indicator to be high.
3. Check the GAME OVER screen to confirm the new metrics display correctly.
