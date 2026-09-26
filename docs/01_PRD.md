# GazeFlap — Product Requirements Document (PRD)

**Project:** GazeFlap  
**Working title:** Vision-Based Gamified Fitness & Endurance System  
**Version:** 1.0  
**Status:** Product Definition  
**Primary platform:** Web application  
**Core technologies:** Next.js, TypeScript, Phaser/Canvas, MediaPipe, FastAPI, PostgreSQL

---

## 1. Product Overview

GazeFlap is a computer-vision-powered fitness gaming platform that combines gaze-controlled gameplay with real-time exercise monitoring.

The user controls a Flappy Bird-style character using eye/gaze direction while a webcam-based pose estimation system detects push-ups, evaluates exercise form, tracks performance, estimates fatigue indicators, and produces an overall fitness/game session score.

The product is designed to make exercise more engaging through game mechanics, adaptive difficulty, progress tracking, achievements, and optional AI-generated coaching feedback.

### Product tagline

> **Your eyes control the game. Your body controls the challenge.**

---

## 2. Problem Statement

Most fitness applications focus on exercise tracking, while most casual games focus on entertainment. These experiences are generally separate.

Users may also lose motivation when workouts become repetitive. A system that combines physical activity with interactive gameplay can make exercise more engaging while collecting meaningful performance metrics.

GazeFlap addresses this gap by combining:

- Eye/gaze-based game interaction
- Computer-vision exercise tracking
- Exercise form analysis
- Performance and fatigue indicators
- Adaptive gameplay
- Gamification
- Historical fitness analytics
- Personalized AI feedback

---

## 3. Product Vision

Build a privacy-conscious, browser-based fitness gaming platform in which computer vision turns physical activity and eye movement into an interactive game experience.

The long-term vision is to support multiple exercises and multiple games through a reusable computer-vision and fitness engine.

---

## 4. Goals

### Primary goals

1. Build a playable Flappy Bird-style game.
2. Control the game using gaze direction rather than keyboard buttons.
3. Detect and count push-ups using pose landmarks.
4. Detect incomplete or poor-form repetitions.
5. Calculate exercise and game performance metrics.
6. Estimate fatigue indicators from changes in movement performance.
7. Adapt game difficulty based on session performance.
8. Store session summaries and show progress over time.
9. Provide optional AI-generated post-workout feedback.
10. Keep raw webcam processing local where technically practical.

### Secondary goals

- Add achievements and streaks.
- Add leaderboards.
- Support additional exercises later.
- Make the architecture modular enough for future games.
- Provide a strong portfolio/BTech project demonstration.

---

## 5. Non-Goals

The first version will NOT:

- Claim to medically diagnose fatigue.
- Provide medical or clinical fitness assessments.
- Replace a trainer, physiotherapist, or doctor.
- Guarantee accurate cardiovascular stamina measurement.
- Upload and permanently store raw webcam video by default.
- Support every exercise in the MVP.
- Attempt to infer sensitive medical conditions.

The system should describe fatigue and endurance values as **estimated performance indicators**, not medical measurements.

---

## 6. Target Users

### Primary users

- Students and young adults
- Fitness beginners
- Casual gamers interested in fitness
- Home-workout users
- Developers/technology enthusiasts interested in computer vision

### Secondary users

- Fitness instructors demonstrating technology
- Academic evaluators
- Recruiters/interviewers evaluating the project
- Researchers exploring gamified computer vision

---

## 7. Core User Journey

```text
Landing Page
    ↓
Create/Login Account
    ↓
Choose Game Mode
    ↓
Camera Permission
    ↓
Camera & Body Position Check
    ↓
Eye Calibration
    ↓
Workout Calibration
    ↓
Challenge Starts
    ↓
Gaze Controls Bird
    +
Pose Tracking Counts Push-ups
    ↓
Real-time Feedback
    ↓
Challenge Ends
    ↓
Session Analytics
    ↓
AI Coach Feedback
    ↓
Dashboard / Progress
```

---

## 8. Game Modes

### 8.1 Eye Flap

A pure gaze-controlled arcade mode.

**Controls:**

- Look up → bird rises
- Look center → neutral movement
- Look down → bird falls

**Metrics:**

- Score
- Survival time
- Obstacles passed
- Collision count
- Gaze-control quality

---

### 8.2 Push-Up Challenge

The user selects a target number of push-ups.

Example:

```text
Target: 20
Valid: 14
Remaining: 6
```

The game can remain simple while the exercise engine focuses on accurate repetition detection.

---

### 8.3 GazeFlap Challenge

The main combined mode.

The user:

- Controls the bird using gaze.
- Performs push-ups.
- Maintains exercise form.
- Earns score through gameplay and exercise performance.

---

### 8.4 Endurance Mode

No fixed repetition target.

The system measures performance throughout a timed session.

Tracked metrics include:

- Session duration
- Valid repetitions
- Form score
- Rep consistency
- Estimated fatigue
- Game score
- Endurance/performance score

---

## 9. Functional Requirements

### FR-01 — User Authentication

The system should support:

- Account registration
- Login
- Logout
- Basic profile
- Session history

Authentication can initially be implemented with a simple secure token/session approach and expanded later.

---

### FR-02 — Camera Access

The system should:

- Request camera permission.
- Display camera status.
- Detect whether the user is visible.
- Warn when tracking confidence is insufficient.
- Allow the user to stop camera access.

---

### FR-03 — Eye Calibration

Before gameplay:

1. Display calibration targets.
2. Ask the user to look at each target.
3. Collect multiple frames.
4. Establish user-specific gaze thresholds.
5. Confirm calibration quality.

---

### FR-04 — Gaze Detection

The gaze module should classify the user's gaze into:

- UP
- CENTER
- DOWN
- UNKNOWN

The classifier should use smoothing and confidence thresholds to prevent unstable control.

---

### FR-05 — Game Control

The game controller should translate gaze states into game actions.

```text
UP       → upward impulse
CENTER   → normal physics
DOWN     → downward influence
UNKNOWN  → temporarily maintain previous stable state
```

---

### FR-06 — Push-Up Detection

The pose module should:

- Detect relevant body landmarks.
- Calculate joint angles.
- Detect up/down movement.
- Use a state machine to identify complete repetitions.
- Reject obvious incomplete movements.

---

### FR-07 — Form Analysis

For each repetition, calculate available indicators such as:

- Depth
- Elbow angle
- Body alignment
- Movement consistency
- Completion status

Output:

- Valid
- Invalid
- Warning

---

### FR-08 — Performance Analytics

The system should calculate:

- Total reps
- Valid reps
- Invalid reps
- Average rep duration
- Average form score
- Range-of-motion indicator
- Game score
- Survival time
- Gaze-control stability

---

### FR-09 — Fatigue Estimation

The system should estimate fatigue using changes over time in measurable movement/performance signals.

Possible inputs:

- Rep duration
- Movement consistency
- Range of motion
- Form score
- Rest duration
- Performance degradation

Output should be labelled as an **estimated fatigue indicator**.

---

### FR-10 — Adaptive Difficulty

Difficulty may change based on:

- Game performance
- Collision frequency
- Gaze stability
- Fitness performance
- Estimated fatigue

The system must avoid making the challenge unnecessarily difficult when the user is already struggling.

---

### FR-11 — Session Results

After a session, display:

```text
Game Score
Push-ups
Valid Reps
Form Score
Eye Control
Estimated Fatigue
Endurance Score
Session Duration
```

---

### FR-12 — Dashboard

The dashboard should display:

- Recent sessions
- Best score
- Total workouts
- Total valid reps
- Progress charts
- Achievements
- Streaks

---

### FR-13 — AI Coach

The AI coach should receive structured session metrics and generate:

- Session summary
- Strengths
- Areas for improvement
- Next-session suggestions

Raw video should not be sent to the LLM.

---

### FR-14 — Achievements

Examples:

- First Flight
- First Push-up
- 20 Rep Club
- Perfect Form
- High Flyer
- Endurance Master
- 7-Day Streak

---

## 10. Non-Functional Requirements

### Performance

- Low-latency gaze control.
- Smooth game rendering.
- Real-time pose feedback.
- Avoid unnecessary network calls during gameplay.

### Privacy

- Prefer local browser-side CV inference.
- Do not store raw webcam footage by default.
- Store only necessary derived metrics.
- Clearly explain camera usage.

### Reliability

- Handle camera loss gracefully.
- Handle low-confidence landmarks.
- Prevent duplicate rep counting.
- Allow session restart.

### Accessibility

- Provide clear visual status indicators.
- Provide keyboard fallback during development/testing.
- Avoid relying only on color to communicate warnings.

---

## 11. Success Metrics

### Technical

- Stable real-time gameplay.
- Low control latency.
- Reliable rep state transitions.
- Robust camera-loss handling.

### Computer Vision

Evaluate:

- Rep counting accuracy
- False positive rate
- False negative rate
- Form classification accuracy
- Gaze classification stability

### Product

- Session completion rate
- Average session duration
- Repeat sessions
- Achievement engagement
- User-reported usability

---

## 12. MVP Definition

The MVP is complete when a user can:

1. Open GazeFlap.
2. Allow camera access.
3. Calibrate gaze.
4. Start the game.
5. Control the bird with gaze.
6. Receive a game score.
7. Perform push-ups.
8. Have valid reps counted.
9. See basic form warnings.
10. View a session summary.

Everything else is an enhancement.

---

## 13. Future Scope

- Squat tracking
- Sit-up tracking
- Plank tracking
- Additional games
- Multiplayer challenges
- Friend leaderboards
- Advanced personalization
- Voice coach
- Mobile support
- Wearable integration
- More sophisticated ML-based fatigue modelling

---

## 14. Risks

| Risk | Mitigation |
|---|---|
| Poor lighting | Provide lighting guidance |
| Webcam angle problems | Camera positioning instructions |
| Gaze instability | Calibration + smoothing |
| False rep counts | State machine + thresholds |
| Low-end device performance | Lightweight inference and reduced processing frequency |
| Privacy concerns | Local processing where possible |
| Overclaiming fitness results | Clearly label estimates and limitations |

---

## 15. Product Principle

**The project should feel like a game first, while the computer-vision engine quietly provides the intelligence underneath it.**
