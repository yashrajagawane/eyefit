# EyeFit — System Architecture

**Version:** 1.0  
**Architecture style:** Modular full-stack + client-side computer vision

---

# 1. Architecture Overview

EyeFit consists of five major layers:

```text
┌───────────────────────────────────────────────┐
│                  USER / UI                    │
│       Next.js + React + TypeScript            │
└───────────────────────┬───────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          │                           │
          ▼                           ▼
┌──────────────────────┐    ┌──────────────────────┐
│   COMPUTER VISION    │    │      GAME ENGINE     │
│                      │    │                      │
│ Face / Gaze / Pose   │    │ Physics / Collision  │
│ MediaPipe            │    │ Score / Difficulty   │
└──────────┬───────────┘    └──────────┬───────────┘
           │                           │
           └─────────────┬─────────────┘
                         ▼
              ┌──────────────────────┐
              │   FITNESS ENGINE     │
              │                      │
              │ Rep / Form / Fatigue │
              │ Performance Scoring  │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │      API LAYER       │
              │       FastAPI        │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │      PostgreSQL      │
              │ Users / Sessions     │
              │ Metrics / Progress   │
              └──────────────────────┘
```

---

# 2. Architectural Principle

The most important architectural decision is:

> **Real-time webcam processing should happen primarily on the client whenever practical.**

This provides:

- Lower latency
- Better privacy
- Reduced server cost
- Better real-time interaction
- Less bandwidth usage

The backend receives **derived metrics**, not continuous raw camera frames.

---

# 3. Frontend Architecture

Recommended:

```text
Next.js
React
TypeScript
Tailwind CSS
```

Frontend responsibilities:

- UI
- Routing
- Authentication UI
- Camera access
- CV inference
- Game rendering
- Real-time HUD
- Calibration
- Session state
- API communication
- Results visualization

---

# 4. Frontend Modules

```text
frontend/
│
├── app/
│   ├── page.tsx
│   ├── dashboard/
│   ├── challenges/
│   ├── session/
│   ├── results/
│   ├── achievements/
│   ├── leaderboard/
│   └── settings/
│
├── components/
│   ├── ui/
│   ├── camera/
│   ├── dashboard/
│   ├── game/
│   ├── fitness/
│   └── analytics/
│
├── game/
│   ├── GameEngine.ts
│   ├── Bird.ts
│   ├── Obstacle.ts
│   ├── CollisionSystem.ts
│   ├── ScoreSystem.ts
│   └── DifficultySystem.ts
│
├── vision/
│   ├── camera/
│   ├── face/
│   ├── gaze/
│   ├── pose/
│   └── calibration/
│
├── fitness/
│   ├── repDetector.ts
│   ├── formAnalyzer.ts
│   ├── fatigueAnalyzer.ts
│   └── performanceScorer.ts
│
├── hooks/
│   ├── useCamera.ts
│   ├── useGaze.ts
│   ├── usePose.ts
│   └── useGame.ts
│
├── services/
│   ├── api.ts
│   ├── sessionService.ts
│   └── authService.ts
│
└── types/
```

---

# 5. Camera Pipeline

```text
Webcam
  ↓
MediaStream
  ↓
Video Element
  ↓
Frame Sampling
  ↓
┌───────────────┐
│ CV Inference  │
└───────┬───────┘
        │
   ┌────┴────┐
   ↓         ↓
Face       Pose
   ↓         ↓
Gaze       Exercise
   ↓         ↓
Gaze State  Rep/Form
   └────┬────┘
        ↓
   Session State
```

---

# 6. Gaze Architecture

```text
Video Frame
    ↓
Face Landmarks
    ↓
Eye Landmarks
    ↓
Eye/iris features
    ↓
Calibration normalization
    ↓
Gaze classifier
    ↓
Confidence filter
    ↓
Temporal smoothing
    ↓
UP / CENTER / DOWN
    ↓
Game Controller
```

---

# 7. Gaze Controller

The controller should not directly manipulate the game's coordinates.

Use an abstraction:

```text
Gaze Input
    ↓
Input Adapter
    ↓
Game Command
    ↓
Game Engine
```

Example:

```text
UP → FLAP
CENTER → NEUTRAL
DOWN → FALL
```

This allows future controls such as:

```text
Keyboard
Mouse
Touch
Gamepad
Gaze
```

without rewriting the game engine.

---

# 8. Push-Up Architecture

```text
Video Frame
    ↓
Pose Landmarks
    ↓
Relevant joints
    ↓
Joint angle calculations
    ↓
Movement analysis
    ↓
Rep State Machine
    ↓
Rep Event
    ↓
Form Analyzer
    ↓
Rep Result
```

---

# 9. Rep State Machine

```text
           ┌──────────┐
           │    UP    │
           └────┬─────┘
                │
          movement down
                ↓
       ┌────────────────┐
       │  MOVING_DOWN   │
       └───────┬────────┘
               │
          bottom reached
               ↓
       ┌────────────────┐
       │     BOTTOM     │
       └───────┬────────┘
               │
          movement up
               ↓
       ┌────────────────┐
       │   MOVING_UP    │
       └───────┬────────┘
               │
          top reached
               ↓
       ┌────────────────┐
       │   VALID REP     │
       └────────────────┘
               │
               ↓
              UP
```

The state machine prevents counting every oscillation as a repetition.

---

# 10. Form Analysis Pipeline

For every completed movement:

```text
Rep
 ↓
Depth Analysis
 ↓
Elbow Analysis
 ↓
Body Alignment
 ↓
Movement Consistency
 ↓
Form Score
 ↓
Valid / Invalid / Warning
```

Example output:

```json
{
  "rep": 18,
  "valid": true,
  "depth_score": 0.88,
  "alignment_score": 0.94,
  "form_score": 0.91
}
```

---

# 11. Fatigue Architecture

Fatigue should be estimated from performance trends rather than a single frame.

```text
Rep History
     ↓
Time-Series Features
     ↓
┌───────────────────────────┐
│ Rep duration trend        │
│ Form trend                │
│ Range-of-motion trend     │
│ Movement consistency      │
│ Rest duration             │
└──────────────┬────────────┘
               ↓
       Fatigue Analyzer
               ↓
       Estimated Fatigue
```

The system should maintain a rolling history rather than making a decision from one repetition.

---

# 12. Fitness Scoring

A session can contain several component scores.

```text
Fitness Score
   │
   ├── Form Score
   ├── Rep Consistency
   ├── Range of Motion
   └── Performance Trend
```

The final score should be normalized to a clear range such as:

```text
0–100
```

All weights should be configurable rather than hardcoded throughout the application.

---

# 13. Game Architecture

Recommended abstraction:

```text
GameEngine
│
├── GameState
├── PhysicsSystem
├── InputSystem
├── ObstacleSystem
├── CollisionSystem
├── ScoreSystem
├── DifficultySystem
├── AudioSystem
└── RenderSystem
```

### Game state

```text
READY
COUNTDOWN
PLAYING
PAUSED
GAME_OVER
RESULTS
```

---

# 14. Adaptive Difficulty

```text
Game Metrics
      +
Fitness Metrics
      +
Tracking Confidence
      ↓
Difficulty Manager
      ↓
Difficulty Level
      ↓
Game Configuration
```

Potential parameters:

- Gravity
- Bird impulse
- Obstacle speed
- Obstacle gap
- Spawn interval

The difficulty system should have minimum and maximum limits.

---

# 15. Session Orchestrator

A central session manager coordinates all subsystems.

```text
                 SessionManager
                       │
       ┌───────────────┼────────────────┐
       ↓               ↓                ↓
   Game Engine      Gaze Engine     Fitness Engine
       │               │                │
       └───────────────┼────────────────┘
                       ↓
                 Session Metrics
                       ↓
                  Result Builder
```

Responsibilities:

- Start session
- Stop session
- Track elapsed time
- Receive rep events
- Receive gaze events
- Receive game events
- Build final summary
- Send summary to backend

---

# 16. Backend Architecture

Use:

```text
FastAPI
   ↓
API Routes
   ↓
Service Layer
   ↓
Repository/Data Access
   ↓
PostgreSQL
```

Example:

```text
backend/
│
├── app/
│   ├── main.py
│   ├── api/
│   │   ├── auth.py
│   │   ├── sessions.py
│   │   ├── users.py
│   │   └── achievements.py
│   │
│   ├── services/
│   │   ├── session_service.py
│   │   ├── scoring_service.py
│   │   └── achievement_service.py
│   │
│   ├── models/
│   ├── schemas/
│   ├── repositories/
│   ├── core/
│   └── tests/
```

---

# 17. API Design

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Sessions

```text
POST /api/sessions
GET  /api/sessions
GET  /api/sessions/{session_id}
POST /api/sessions/{session_id}/complete
```

### Progress

```text
GET /api/progress
GET /api/achievements
GET /api/leaderboard
```

---

# 18. Session Payload

At the end of a session, the frontend can send:

```json
{
  "mode": "eyefit_challenge",
  "duration_seconds": 522,
  "game_score": 2481,
  "total_reps": 32,
  "valid_reps": 29,
  "invalid_reps": 3,
  "average_form_score": 87,
  "gaze_control_score": 93,
  "endurance_score": 84,
  "fatigue_indicator": 71
}
```

The backend validates and stores the data.

---

# 19. Database Concept

## users

```text
id
name
email
password_hash
created_at
```

## sessions

```text
id
user_id
mode
duration
game_score
form_score
gaze_score
endurance_score
fatigue_indicator
created_at
```

## exercise_reps

```text
id
session_id
rep_number
duration
depth_score
alignment_score
form_score
valid
created_at
```

## achievements

```text
id
name
description
criteria
```

## user_achievements

```text
user_id
achievement_id
unlocked_at
```

---

# 20. AI Coach Architecture

The AI should not receive raw webcam footage.

Use:

```text
Session Metrics
      ↓
Insight Builder
      ↓
Structured Prompt
      ↓
LLM
      ↓
Validated Response
      ↓
AI Coach UI
```

Example structured input:

```json
{
  "valid_reps": 29,
  "average_form": 87,
  "fatigue_indicator": 71,
  "performance_trend": "declining",
  "game_score": 2481
}
```

---

# 21. Privacy Architecture

Preferred flow:

```text
Camera
 ↓
Browser
 ↓
Local CV inference
 ↓
Landmarks / metrics
 ↓
Session summary
 ↓
Backend
```

Avoid:

```text
Camera
 ↓
Raw video upload
 ↓
Server storage
```

unless a future feature explicitly requires it and the user provides appropriate consent.

---

# 22. Real-Time Data Flow

During gameplay:

```text
                    WEBCAM
                       │
                       ▼
                Frame Processing
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
       Face Landmarks        Pose Landmarks
            │                     │
            ▼                     ▼
       Gaze Engine           Rep Engine
            │                     │
            ▼                     ▼
       Gaze Command          Rep Event
            │                     │
            └──────────┬──────────┘
                       ▼
                 Session Manager
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
       Game Engine          Analytics Engine
            │                     │
            ▼                     ▼
          Render              HUD Update
```

---

# 23. Event-Driven Communication

Internally, modules should communicate through typed events where practical.

Examples:

```text
GAZE_CHANGED
REP_COMPLETED
FORM_WARNING
TRACKING_LOST
GAME_SCORE_CHANGED
COLLISION
FATIGUE_UPDATED
SESSION_COMPLETED
```

This keeps the system modular.

---

# 24. Error Handling

Every CV subsystem should expose a status.

```text
Camera: READY
Face: DETECTED
Gaze: TRACKING
Pose: TRACKING
Game: PLAYING
```

Possible state:

```text
Pose: LOST
```

The application should respond with:

```text
Tracking lost.
Please reposition yourself.
```

rather than crashing or producing incorrect reps.

---

# 25. Security

Backend requirements:

- Password hashing
- Authentication tokens/sessions
- Authorization checks
- Input validation
- Rate limiting where appropriate
- Secure environment variables
- CORS configuration
- No secrets in frontend code

---

# 26. Deployment Architecture

```text
                 INTERNET
                     │
                     ▼
              ┌─────────────┐
              │   Vercel    │
              │  Next.js    │
              └──────┬──────┘
                     │ HTTPS
                     ▼
              ┌─────────────┐
              │   FastAPI   │
              │   Backend   │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │ PostgreSQL  │
              └─────────────┘
```

Client-side CV runs inside the browser.

---

# 27. Observability

For development and production debugging, track:

- API errors
- Session failures
- CV initialization failures
- Camera permission failures
- Game crashes
- Processing performance

Do not log raw webcam frames.

---

# 28. Testing Architecture

## Unit tests

Test:

- Angle calculations
- Rep state machine
- Scoring
- Difficulty calculations
- Session aggregation

## Integration tests

Test:

```text
CV Event
 ↓
Session Manager
 ↓
Game/Analytics
```

## UI tests

Test:

- Camera setup
- Calibration
- Game start
- Results
- Dashboard

## Manual CV evaluation

Test multiple users and environments.

---

# 29. Performance Strategy

Real-time CV can be expensive.

Use:

- Frame sampling
- Separate CV and render loops
- Lightweight landmark models
- Efficient canvas rendering
- Avoid unnecessary React re-renders
- Web Workers if profiling shows a need
- Batch backend requests at session boundaries

Important distinction:

```text
Game rendering → high-frequency loop

CV inference → controlled frequency

Backend sync → low frequency/session-based
```

---

# 30. Final Architecture

```text
                         ┌───────────────────────┐
                         │        USER           │
                         │  Camera + Browser     │
                         └───────────┬───────────┘
                                     │
                                     ▼
                    ┌────────────────────────────┐
                    │       NEXT.JS CLIENT       │
                    │                            │
                    │  UI / Dashboard / Results  │
                    └────────────┬───────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
       ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
       │ GAZE ENGINE │    │ POSE ENGINE │    │ GAME ENGINE │
       │             │    │             │    │             │
       │ Face/Eyes   │    │ Landmarks   │    │ Physics     │
       │ Calibration │    │ Rep Counter │    │ Collision   │
       │ Smoothing   │    │ Form        │    │ Scoring     │
       └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
              │                  │                  │
              └──────────────────┼──────────────────┘
                                 ▼
                     ┌────────────────────────┐
                     │    SESSION MANAGER     │
                     │                        │
                     │ Events + State + Data  │
                     └───────────┬────────────┘
                                 │
                  ┌──────────────┴──────────────┐
                  ▼                             ▼
        ┌────────────────────┐       ┌───────────────────┐
        │ FITNESS ANALYTICS  │       │ ADAPTIVE DIFFICULTY│
        │                    │       │                   │
        │ Form               │       │ Game Speed        │
        │ Performance        │       │ Obstacle Gap      │
        │ Fatigue Indicator  │       │ Challenge Level   │
        └──────────┬─────────┘       └───────────────────┘
                   │
                   ▼
             ┌───────────────┐
             │    FASTAPI    │
             │      API      │
             └───────┬───────┘
                     │
                     ▼
             ┌───────────────┐
             │  PostgreSQL   │
             │               │
             │ Users         │
             │ Sessions      │
             │ Reps          │
             │ Achievements  │
             └───────┬───────┘
                     │
                     ▼
             ┌───────────────┐
             │   AI COACH    │
             │ Structured    │
             │ Metrics → LLM │
             └───────────────┘
```

---

# 31. Core Architectural Rule

Keep these three systems independent:

```text
GAME
VISION
FITNESS
```

Connect them through clean interfaces/events.

This allows:

- Changing MediaPipe later without rewriting the game.
- Adding another game without rewriting the fitness engine.
- Adding squats without changing gaze control.
- Replacing the AI provider without changing CV.
- Running the fitness engine in testing without a live camera.

That modularity is what turns EyeFit from a college demo into a maintainable software project.
