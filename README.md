<a name="readme-top"></a>
<div align="center">

# 👀 GazeFlap

### *Your eyes control the game. Your body controls the challenge.*

A browser-based fitness gaming platform powered by on-device computer vision — no hardware required.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)](https://www.python.org/)
[![MediaPipe](https://img.shields.io/badge/Google-MediaPipe-4285F4?logo=google)](https://developers.google.com/mediapipe)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

</div>

---

## 🎬 Demo

<div align="center">

<!-- Replace with an actual gameplay clip, e.g. docs/screenshots/demo.gif -->
<img src="docs/screenshots/demo.gif" width="850" alt="GazeFlap gameplay demo — gaze-controlled bird with live push-up tracking" />

<sub>Gaze-controlled gameplay running alongside live push-up form tracking, entirely in-browser.</sub>

</div>

<p align="right">(<a href="#readme-top">back to top ↑</a>)</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Features](#features)
- [How GazeFlap Works](#how-GazeFlap-works)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Testing](#testing)
- [Privacy & Security](#privacy--security)
- [Limitations](#limitations)
- [Development Roadmap](#development-roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Overview

GazeFlap is a computer-vision-powered fitness gaming platform that runs entirely in the browser. It combines gaze-controlled gameplay with real-time exercise monitoring using nothing but a standard webcam.

The user controls a Flappy Bird-style game character by looking **UP** or **DOWN**, while a pose estimation system simultaneously detects push-ups, evaluates exercise form, tracks fatigue, and produces a combined fitness-game score. Post-session, an AI-powered coach delivers personalized feedback based on structured performance metrics.

> [!NOTE]
> **Privacy first:** all computer vision inference runs locally via WebAssembly. No video, images, or raw camera frames are ever transmitted to any server.

<p align="right">(<a href="#readme-top">back to top ↑</a>)</p>

---

## Problem Statement

Most fitness applications focus on exercise logging, while most casual games focus on entertainment. These are almost always separate experiences.

Home workouts also lack real-time form correction, personalized feedback, and the kind of engagement that keeps users coming back. High-quality interactive exergames (VR headsets, Kinect) require expensive specialized hardware that most users don't own.

GazeFlap bridges this gap by delivering:

- Interactive, physically demanding gameplay requiring only a webcam
- Real-time form analysis and fatigue estimation
- Adaptive difficulty that responds to actual performance
- Gamification (XP, levels, achievements, streaks) that rewards consistent effort

<p align="right">(<a href="#readme-top">back to top ↑</a>)</p>

---

## Features

### ✅ Implemented

- 👀 **Gaze-Controlled Gameplay** — control the game bird by looking UP / CENTER / DOWN, no keyboard needed
- 🎯 **Gaze Calibration** — a personalized calibration UI adapts to each user's eye shape and camera distance
- 💪 **Push-Up Detection** — real-time skeletal landmark tracking via MediaPipe PoseLandmarker
- 📐 **Form Analysis** — elbow angle calculation grades each rep as GOOD, SHALLOW, or TRACKING ERROR
- 🎮 **Flappy Bird Game Engine** — custom `requestAnimationFrame` physics loop running at 60 FPS, decoupled from React
- 🧠 **Adaptive Difficulty** — game speed and obstacle spacing adjust based on gaze stability and fitness performance
- 📊 **Session Analytics** — per-session metrics: duration, valid reps, form score, fatigue indicator, performance score
- 🏆 **Gamification** — XP, levels, achievements, and daily streaks stored in the backend
- 🤖 **AI Fitness Coach** — Google Gemini generates post-session feedback from structured metrics, not raw video
- 🔐 **User Authentication** — JWT-based login and registration with rate limiting and bcrypt password hashing
- 📈 **Dashboard** — personal stats, session history, XP/level display, and recent session cards
- 🏅 **Leaderboard** — global leaderboard backed by a dedicated API endpoint
- 🔒 **Security Hardening** — HTTP security headers, CSP, CORS restrictions, input validation on all API models
- 🐳 **Docker Deployment** — multi-stage frontend Dockerfile + backend Dockerfile + `docker-compose.yml`
- 🧪 **Automated Tests** — backend `pytest` suite (auth + gamification); frontend `vitest` suite (gamification logic)
- 💪 **Push-Up Challenge Mode** — dedicated flow for push-up tracking with user-selected rep targets
- ⏱️ **Endurance Mode** — timed survival mode integrating both gaze-controlled gameplay and push-up form tracking

### 🔮 Planned

- Squat / sit-up / plank tracking
- WebRTC real-time multiplayer
- Advanced ML-based fatigue modelling
- Mobile layout optimization
- Friend leaderboards & social features

<p align="right">(<a href="#readme-top">back to top ↑</a>)</p>

---

## How GazeFlap Works

### 1. Eye & Gaze Tracking

GazeFlap uses the Google MediaPipe `FaceLandmarker` task to extract **478 3D facial landmarks** in real time.

The gaze analyzer (`GazeAnalyzer.ts`) calculates the vertical position of the iris center relative to the upper and lower eyelid landmarks. This produces a **normalized pitch ratio** — when the iris sits significantly closer to the upper eyelid, the system classifies gaze as `UP`; when it drifts toward the lower eyelid, `DOWN`.

Because eye shapes differ significantly across users, a **calibration UI** prompts each user to look CENTER, UP, and DOWN. It averages these ratios over multiple frames to establish personalized `upThreshold` and `downThreshold` values, persisted in `localStorage`.

```
Gaze UP     → upward impulse applied to the bird
Gaze CENTER → normal physics
Gaze DOWN   → downward influence on the bird
UNKNOWN     → maintain last stable state
```

Temporal smoothing and a confidence threshold prevent control jitter from brief tracking inconsistencies.

### 2. Push-Up Detection & Form Analysis

GazeFlap uses the MediaPipe `PoseLandmarker` task to track **33 skeletal landmarks** per frame.

The push-up engine (`PushUpAnalyzer.ts`) isolates the shoulder, elbow, and wrist landmarks and calculates the true 3D interior elbow angle using the **Law of Cosines**:

```
angle = arccos( (AB² + BC² - AC²) / (2 · |AB| · |BC|) )
```

This angle feeds into a finite state machine:

```
UP (angle > 150°)
  ↓
MOVING_DOWN
  ↓
BOTTOM (angle < 90°) ← required for a valid rep
  ↓
MOVING_UP
  ↓
UP → ✅ Valid rep counted
```

**Form verdicts per rep:**

- **`GOOD`** — full depth reached (< 90° elbow), body alignment acceptable
- **`SHALLOW`** — reversed direction before reaching the 90° threshold
- **`MISALIGNED`** — hip/shoulder plane deviation detected
- **`TRACKING_ERROR`** — landmarks lost mid-repetition

### 3. The Game Engine

The physics loop (`GameEngine.ts`) uses `requestAnimationFrame` and runs **entirely outside of React state**. This keeps the browser from choking on virtual DOM re-renders while maintaining 60 FPS collision physics.

The custom React hooks (`useGaze`, `usePose`) throttle their state updates to **~30 FPS** for the HUD, while the game loop consumes the raw gaze state directly via callback.

```
requestAnimationFrame loop (60 FPS)
    ├─ Bird physics & gravity
    ├─ Obstacle generation & collision
    ├─ Score increment
    └─ onStateChange() → React UI (30 FPS max)
```

### 4. Fitness Analytics & Fatigue Estimation

The `useSessionAnalytics` hook accumulates per-rep data throughout the session to produce:

- **`valid_reps`** — reps that passed the full state machine
- **`average_form`** — mean form score across all reps (0–100)
- **`fatigue_indicator`** — estimated from trends in rep duration and form degradation (0–100)
- **`performance_score`** — combined game and fitness composite score (0–100)
- **`duration_seconds`** — total active session time

> [!WARNING]
> Fatigue and performance values are **estimated indicators** derived from measurable movement signals — not medical measurements.

<p align="right">(<a href="#readme-top">back to top ↑</a>)</p>

---

## Architecture

```mermaid
graph TD
    subgraph Browser["Browser (Client)"]
        UI["Next.js React UI"]
        GL["GameEngine.ts\n(60 FPS rAF loop)"]
        GZ["useGaze Hook\nFaceLandmarker"]
        PS["usePose Hook\nPoseLandmarker"]
        UI -->|state sync| GL
        GZ -->|gaze state| GL
        PS -->|push-up reps| UI
    end

    subgraph Backend["Backend (FastAPI)"]
        API["REST API"]
        SVC["Services\n(Auth, Gamification)"]
        DB[("SQLite / PostgreSQL")]
        AI["Google Gemini\nGenAI SDK"]
        API --> SVC
        SVC --> DB
        SVC --> AI
    end

    Browser <-->|"HTTPS JSON\n(session save, auth)"| Backend
```

**Key design decisions:**

- **Game loop decoupling** — the physics engine bypasses React to hit 60 FPS consistently on mid-range hardware
- **CV throttling** — MediaPipe runs at full native speed; React state updates are throttled to 30 FPS to prevent unnecessary re-renders without affecting gameplay
- **Stateless backend** — the API has no knowledge of the current game session; all real-time state lives in the browser

<p align="right">(<a href="#readme-top">back to top ↑</a>)</p>

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 | App framework, routing, SSR |
| React | 19 | UI component layer |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Styling |
| `@mediapipe/tasks-vision` | ^1.0.1 | Face & pose landmark detection (WASM) |
| Vitest | ^5 | Unit testing |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| FastAPI | ^0.100 | REST API framework |
| Python | 3.11 | Runtime |
| SQLAlchemy | ^2.0 | ORM |
| Pydantic | ^2.0 | Data validation |
| `python-jose` | ^3.3 | JWT authentication |
| `passlib[bcrypt]` | ^1.7 | Password hashing |
| `google-genai` | ^0.2 | Gemini API integration |
| `slowapi` | ^0.1.9 | API rate limiting |
| `alembic` | ^1.11 | Database migrations |
| SQLite / PostgreSQL | — | Data persistence |
| pytest + httpx | — | Backend testing |

### Infrastructure

| Tool | Purpose |
|---|---|
| Docker | Containerization |
| Docker Compose | Multi-service orchestration |
| Node.js 18 Alpine | Frontend container runtime |
| Python 3.11 Slim | Backend container runtime |

<p align="right">(<a href="#readme-top">back to top ↑</a>)</p>

---

## Project Structure

```
GazeFlap/
├── docker-compose.yml
├── .gitignore
├── LICENSE
│
├── frontend/
│   ├── Dockerfile
│   ├── next.config.ts              # Security headers, CSP, standalone build
│   ├── package.json
│   └── src/
│       ├── app/                    # Next.js App Router pages
│       │   ├── page.tsx            # Landing page
│       │   ├── dashboard/
│       │   ├── challenges/
│       │   ├── play/               # Main game + CV page
│       │   ├── history/
│       │   ├── leaderboard/
│       │   ├── profile/
│       │   ├── results/
│       │   └── settings/
│       ├── components/
│       ├── context/                # AuthContext
│       ├── game/
│       │   ├── GameEngine.ts       # 60 FPS rAF physics loop
│       │   ├── Bird.ts
│       │   ├── Obstacle.ts
│       │   ├── DifficultyEngine.ts
│       │   └── AudioSystem.ts
│       ├── hooks/
│       │   ├── useCamera.ts
│       │   ├── useCalibration.ts
│       │   ├── useGaze.ts          # FaceLandmarker → GazeState
│       │   ├── usePose.ts          # PoseLandmarker frames
│       │   ├── usePushUp.ts        # Rep counting via state machine
│       │   ├── useSessionAnalytics.ts
│       │   └── useDifficultyEngine.ts
│       ├── lib/
│       │   ├── gamification.ts     # XP/level logic (shared)
│       │   └── gamification.test.ts
│       └── vision/
│           ├── face/
│           ├── gaze/
│           │   └── GazeAnalyzer.ts # Iris position → UP/CENTER/DOWN
│           └── pose/
│               ├── PoseTracker.ts
│               └── PushUpAnalyzer.ts  # Elbow angle + state machine
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py                 # FastAPI app, security middleware
│       ├── limiter.py              # slowapi rate limiter (shared)
│       ├── api/
│       │   ├── auth.py             # /auth/register, /auth/login, /auth/me
│       │   ├── sessions.py         # /sessions (POST, GET)
│       │   ├── leaderboard.py      # /leaderboard
│       │   ├── coach.py            # /coach/{session_id}
│       │   └── deps.py             # get_db, get_current_user
│       ├── db/
│       │   ├── database.py
│       │   └── models.py           # User, UserProgress, GameSession, Achievement
│       └── services/
│           ├── auth.py             # JWT, bcrypt
│           └── gamification.py     # XP, level, streak, achievement logic
│
├── docs/
│   ├── 01_PRD.md
│   ├── 02_Design.md
│   ├── 03_Phases.md
│   ├── 04_Architecture.md
│   ├── 05_Setup_Guide.md
│   ├── 06_Computer_Vision.md
│   ├── 07_Project_Report_Template.md
│   └── 08_Presentation_Outline.md
│
└── tests/
    ├── backend/tests/test_auth.py
    ├── backend/tests/test_gamification.py
    └── frontend/src/lib/gamification.test.ts
```

<p align="right">(<a href="#readme-top">back to top ↑</a>)</p>

---

## Installation & Setup

### Option A — Docker (Recommended)

Requires: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
# 1. Clone the repository
git clone https://github.com/yashrajagawane/GazeFlap.git
cd GazeFlap

# 2. Configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and add your GEMINI_API_KEY

# 3. Build and start all services
docker-compose up --build
```

Navigate to `http://localhost:3000`. The API is available at `http://localhost:8000`.

### Option B — Local Development

<details>
<summary><strong>Backend Setup</strong></summary>

**Requirements:** Python 3.10+

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your values

# Start the development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

API available at: `http://127.0.0.1:8000`
Interactive docs: `http://127.0.0.1:8000/docs`

</details>

<details>
<summary><strong>Frontend Setup</strong></summary>

**Requirements:** Node.js 18+

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

App available at: `http://localhost:3000`

</details>

<p align="right">(<a href="#readme-top">back to top ↑</a>)</p>

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | Random 32-byte hex string for JWT signing. Generate: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `DATABASE_URL` | ✅ | SQLite: `sqlite:///./GazeFlap.db`. PostgreSQL: `postgresql://user:pass@host/db` |
| `GEMINI_API_KEY` | ⚠️ Optional | Required for the AI Coach. Get one at [aistudio.google.com](https://aistudio.google.com/app/apikey) |

### Frontend

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Backend API base URL |

<p align="right">(<a href="#readme-top">back to top ↑</a>)</p>

---

## Usage

1. **Register** a new account or log in.
2. Navigate to **Challenges** and select **👀 Eye Flap** or **🔥 GazeFlap**.
3. Accept the **Camera Privacy Notice** — shown once and saved locally.
4. Click **Enable Camera** and grant browser permission.
5. Click **Calibrate Gaze** and follow the on-screen instructions (look CENTER → UP → DOWN).
6. Start playing. Look **UP** to make the bird flap. Perform **push-ups** to earn shields.
7. After the session, view your **XP gain**, **achievements**, and **form breakdown**.
8. Click **Ask AI Coach** on any session card on the dashboard for personalized feedback.

> [!TIP]
> For best accuracy, use good lighting and keep your upper body fully within the camera frame.

<p align="right">(<a href="#readme-top">back to top ↑</a>)</p>

---

## Testing

### Backend

```bash
cd backend
.\venv\Scripts\activate   # Windows
source venv/bin/activate  # macOS / Linux

python -m pytest tests/ -v
```

Tests cover:
- `test_auth.py` — registration and login endpoint validation
- `test_gamification.py` — XP calculation, level progression, streak bonuses, achievement logic

### Frontend

```bash
cd frontend
npx vitest run
```

Tests cover:
- `gamification.test.ts` — `levelFromXp`, `xpForLevel`, achievement registry validation

<p align="right">(<a href="#readme-top">back to top ↑</a>)</p>

---

## Privacy & Security

| Concern | How GazeFlap handles it |
|---|---|
| **Camera data** | All CV inference runs in-browser via WebAssembly. No frames are sent to any server. |
| **Video storage** | No raw video is recorded or stored — only derived numeric metrics. |
| **User consent** | A camera privacy consent banner is shown before any camera access is requested. |
| **Authentication** | Passwords are hashed using `bcrypt`. JWTs are signed with a secret key. |
| **Rate limiting** | `/auth/register` is limited to 5 req/min per IP. `/auth/login` is limited to 10 req/min per IP. |
| **Input validation** | All API request bodies are validated by Pydantic models with strict value bounds. |
| **Security headers** | All API responses carry `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, and `Referrer-Policy` headers. |
| **Content Security Policy** | A strict CSP is applied via `next.config.ts` on the frontend. |
| **CORS** | The API only accepts requests from `localhost:3000` / `127.0.0.1:3000`. |

<p align="right">(<a href="#readme-top">back to top ↑</a>)</p>

---

## Limitations

- **Lighting sensitivity** — gaze tracking accuracy degrades significantly in poor or uneven lighting
- **Camera angle** — push-up detection requires the user's upper body (shoulders, elbows, wrists) fully visible in frame, usually a camera placed to the side or at a low angle
- **Single user** — no multi-user session sharing or live multiplayer support
- **Upper-body only** — push-ups are the only exercise currently supported; squats and other lower-body movements are planned
- **Desktop first** — optimized for desktop/laptop webcams; mobile browser layout is not currently optimized
- **Performance estimates** — fatigue and performance scores are based on observable movement signals, not physiological measurements, and should not be interpreted as medical data

<p align="right">(<a href="#readme-top">back to top ↑</a>)</p>

---

## Contributing

Contributions, bug reports, and feature suggestions are welcome.

1. **Fork** the repository.
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Commit your changes using conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
4. Push the branch and open a **Pull Request** with a clear description.

Please ensure tests pass before submitting a PR.

<p align="right">(<a href="#readme-top">back to top ↑</a>)</p>

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Author

**Yashraj Agawane**
Final-year B.Tech (Information Technology) student — [GitHub @yashrajagawane](https://github.com/yashrajagawane)

Built as a B.Tech final-year project demonstrating the intersection of computer vision, game development, and fitness technology using modern web APIs.

<p align="right">(<a href="#readme-top">back to top ↑</a>)</p>

---

<div align="center">
  <sub>GazeFlap — <em>Your eyes control the game. Your body controls the challenge.</em></sub>
  <br />
  <sub>⭐ If this project is useful to you, consider starring the repo.</sub>
</div>
