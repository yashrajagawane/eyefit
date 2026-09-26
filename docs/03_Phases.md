# GazeFlap — Development Phases & Execution Roadmap

**Version:** 1.0  
**Strategy:** Build a working product incrementally.

---

# Phase 0 — Planning & Repository Setup

## Objective

Create the project foundation before implementing features.

### Tasks

- Create GitHub repository.
- Define monorepo/project structure.
- Initialize Next.js frontend.
- Initialize FastAPI backend.
- Configure TypeScript.
- Configure Python environment.
- Add environment variable strategy.
- Add linting/formatting.
- Add README.
- Add issue templates if useful.
- Establish Git branching/commit convention.

### Deliverable

A clean project that starts locally.

---

# Phase 1 — UI Foundation

## Objective

Create the main application shell.

### Build

- Landing page
- Navbar
- Dashboard
- Challenge selection
- Profile
- Settings
- Results screen skeleton

### Deliverable

Navigation works even though the underlying game/CV features are mocked.

---

# Phase 2 — Basic Game Engine

## Objective

Build the Flappy Bird-style game independently of computer vision.

### Build

- Canvas/game scene
- Bird
- Gravity
- Jump/upward impulse
- Obstacles
- Random obstacle generation
- Collision
- Score
- Game over
- Restart
- Difficulty progression

### Temporary controls

Use keyboard:

```text
SPACE → flap
```

### Deliverable

A fully playable normal version.

---

# Phase 3 — Game Polish

## Objective

Make the game feel professional before adding CV.

### Add

- Start screen
- Pause
- Sound
- Animations
- Score transitions
- Difficulty levels
- Better collision handling
- Responsive canvas
- Game settings

### Deliverable

Portfolio-quality basic game.

---

# Phase 4 — Webcam Foundation

## Objective

Add webcam handling without changing gameplay.

### Build

- Camera permission
- Video stream
- Camera preview
- Start/stop camera
- Camera error handling
- Face/body visibility checks

### Deliverable

Stable webcam module.

---

# Phase 5 — Face & Gaze Tracking

## Objective

Detect eye/gaze direction.

### Build

- Face landmark detection
- Eye landmark extraction
- Gaze feature calculation
- Confidence calculation
- UP/CENTER/DOWN classification
- Temporal smoothing

### Deliverable

A debug screen showing:

```text
Gaze: UP
Confidence: 92%
```

---

# Phase 6 — Gaze Calibration

## Objective

Personalize eye control for each user.

### Build

- Calibration UI
- Center baseline
- Up baseline
- Down baseline
- Threshold calculation
- Calibration quality score
- Recalibration option

### Deliverable

Reliable user-specific gaze control.

---

# Phase 7 — Eye-Controlled Game

## Objective

Replace keyboard control with gaze.

### Build

```text
Gaze UP
   ↓
Bird impulse

Gaze DOWN
   ↓
Downward influence
```

### Add

- Smoothing
- Dead zone
- Confidence threshold
- Input cooldown
- Keyboard fallback

### Deliverable

Playable eye-controlled game.

---

# Phase 8 — Pose Tracking

## Objective

Detect the user's body.

### Build

- Pose landmark detection
- Relevant landmark extraction
- Shoulder/elbow/wrist tracking
- Hip tracking
- Camera-position validation

### Deliverable

Stable body landmark visualization.

---

# Phase 9 — Push-Up Rep Engine

## Objective

Count push-ups accurately.

### Build

- Joint-angle calculations
- Up/down thresholds
- Movement state machine
- Rep completion detection
- Debouncing
- Invalid movement handling

### State machine

```text
UP
 ↓
MOVING_DOWN
 ↓
BOTTOM
 ↓
MOVING_UP
 ↓
UP
 ↓
VALID REP
```

### Deliverable

Real-time rep counter.

---

# Phase 10 — Form Analysis

## Objective

Evaluate basic exercise quality.

### Analyze

- Depth
- Elbow angle
- Body alignment
- Completion
- Movement consistency

### Output

```text
GOOD
SHALLOW
INCOMPLETE
TRACKING ERROR
```

### Deliverable

Real-time form feedback.

---

# Phase 11 — Session Analytics

## Objective

Store and calculate workout metrics.

### Collect

- Total reps
- Valid reps
- Invalid reps
- Rep durations
- Form scores
- Game score
- Survival time
- Gaze stability
- Session duration

### Deliverable

Structured session result object.

---

# Phase 12 — Fatigue & Performance Engine

## Objective

Estimate changes in performance over the session.

### Features

- Rep-time trend
- Form degradation
- Range-of-motion trend
- Movement consistency
- Rest duration
- Performance trend

### Output

```text
Estimated fatigue indicator: 0–100
Performance score: 0–100
```

### Important

These values are performance estimates, not medical measurements.

---

# Phase 13 — Fitness/Game Integration

## Objective

Connect the two systems.

### Build

```text
Eye Control
      +
Push-up Detection
      +
Game
      ↓
Unified Session
```

### Example

During GazeFlap Challenge:

- Gaze controls bird.
- Push-ups increment challenge progress.
- Form affects fitness score.
- Game performance affects final score.

### Deliverable

Core GazeFlap experience.

---

# Phase 14 — Adaptive Difficulty

## Objective

Make the game respond intelligently.

### Inputs

- Game score
- Collision rate
- Gaze stability
- Fatigue indicator
- Form score

### Output

Dynamic:

- Game speed
- Obstacle spacing
- Difficulty level
- Challenge target

### Safety principle

Avoid aggressively increasing difficulty when the user is already struggling.

---

# Phase 15 — Database & User Accounts

## Objective

Persist user history.

### Tables/concepts

- users
- sessions
- exercise_reps
- achievements
- user_progress
- leaderboard_entries

### Deliverable

Users can return and see previous sessions.

---

# Phase 16 — Dashboard & Progress

## Objective

Turn raw sessions into useful long-term analytics.

### Add

- Total workouts
- Total valid reps
- Best game score
- Best endurance score
- Form trend
- Performance trend
- Streak
- Recent sessions

---

# Phase 17 — Gamification

## Objective

Increase engagement.

### Add

- XP
- Levels
- Achievements
- Streaks
- Personal records
- Leaderboards

### Example

```text
Level 8
XP 1840 / 2000
```

---

# Phase 18 — AI Fitness Coach

## Objective

Generate personalized post-session feedback.

### Input

Only structured metrics.

### Example

```json
{
  "valid_reps": 29,
  "average_form": 87,
  "fatigue_indicator": 71,
  "game_score": 2481,
  "duration_seconds": 522
}
```

### Output

- Summary
- Strength
- Improvement area
- Suggested next target

---

# Phase 19 — Testing & Evaluation

## Computer vision tests

Test with:

- Different users
- Different lighting
- Different webcam distances
- Different camera heights
- Different exercise speeds

### Metrics

- Precision
- Recall
- Accuracy
- F1 score
- False positive rate
- False negative rate

---

# Phase 20 — Performance Optimization

## Optimize

- CV inference frequency
- Rendering loop
- Memory usage
- Network requests
- Database queries
- Bundle size

### Goal

Maintain responsive gameplay while running CV.

---

# Phase 21 — Security & Privacy

### Implement

- Secure authentication
- Input validation
- API authorization
- Environment secrets
- Rate limiting where appropriate
- No raw video storage by default
- Camera permission transparency

---

# Phase 22 — Deployment

## Frontend

Deploy the Next.js application.

## Backend

Deploy FastAPI.

## Database

Deploy PostgreSQL.

### Final architecture

```text
User
 ↓
Web App
 ↓
CV + Game
 ↓
API
 ↓
PostgreSQL
```

---

# Phase 23 — Documentation

Create:

- README
- Architecture documentation
- Setup guide
- API documentation
- CV methodology
- Game mechanics
- Testing results
- Privacy documentation
- Screenshots
- Demo video

---

# Phase 24 — BTech/Portfolio Packaging

Prepare:

### Project report

- Introduction
- Literature review
- Problem statement
- Methodology
- System architecture
- Algorithms
- Results
- Testing
- Limitations
- Future scope

### Presentation

Demonstrate:

```text
Camera
 ↓
Eye tracking
 ↓
Bird control
 +
Push-up detection
 ↓
Analytics
 ↓
AI Coach
```

---

# Recommended Milestone Strategy

## Milestone 1 — Playable

```text
Basic Game ✓
```

## Milestone 2 — Vision Controlled

```text
Game + Eye Tracking ✓
```

## Milestone 3 — Fitness

```text
Push-up Detection ✓
```

## Milestone 4 — Intelligent

```text
Form + Fatigue + Adaptive Difficulty ✓
```

## Milestone 5 — Product

```text
Dashboard + Database + Gamification ✓
```

## Milestone 6 — AI

```text
AI Coach ✓
```

## Milestone 7 — Production

```text
Testing + Security + Deployment ✓
```

---

# Definition of Done

The final product should allow a new user to complete an entire session without developer intervention:

```text
Open GazeFlap
   ↓
Login
   ↓
Choose challenge
   ↓
Camera setup
   ↓
Calibration
   ↓
Play using eyes
   ↓
Perform push-ups
   ↓
Receive live feedback
   ↓
Finish challenge
   ↓
View analytics
   ↓
Read AI feedback
   ↓
Track progress
```
