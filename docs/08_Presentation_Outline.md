# PRESENTATION OUTLINE: EyeFit

*This is a suggested slide-by-slide structure for a 10-15 minute B.Tech Project Defense or Portfolio Presentation.*

---

## Slide 1: Title Slide
- **Title**: EyeFit - Vision-Based Gamified Fitness & Endurance System
- **Subtitle**: Replacing expensive hardware with browser-based AI.
- **Presenter Name**: [Your Name]
- **Date**: [Date]

## Slide 2: The Problem
- **Lack of Engagement**: Home workouts are often repetitive and boring.
- **Hardware Barrier**: Interactive exergames (VR, Kinect, Ring Fit) require expensive, specialized hardware.
- **No Form Correction**: Most apps only log data; they don't tell you if you are doing the exercise correctly.

## Slide 3: The Solution (EyeFit)
- A web application that requires **only a standard webcam**.
- Merges a hands-free, eye-controlled game with physical endurance (push-ups).
- **Core Loop**: Your eyes control the game character; your physical push-ups grant you in-game shields/health.

## Slide 4: System Architecture (The Stack)
*Visual: Show the high-level architecture diagram.*
- **Frontend**: Next.js 15 (React), Tailwind.
- **Backend**: FastAPI, SQLite.
- **AI/ML Models**: Google MediaPipe (WebAssembly) & Gemini (GenAI SDK).
- **Deployment**: Dockerized multi-container setup.

## Slide 5: Innovation 1 - Gaze Tracking
- **How it works**: We use MediaPipe to track 478 3D facial landmarks.
- **Math**: By calculating the vertical ratio between the iris center and the upper/lower eyelids, we determine pitch (Looking UP or DOWN).
- **Personalization**: Mention the custom Calibration UI to adapt to different facial structures.

## Slide 6: Innovation 2 - Push-Up Engine
- **How it works**: PoseLandmarker tracks 33 skeletal points.
- **Math**: We use the Law of Cosines on the Shoulder, Elbow, and Wrist coordinates to calculate the exact internal elbow angle.
- **State Machine**: Angles are fed into a state machine (`UP` -> `MOVING_DOWN` -> `BOTTOM` (< 90°) -> `MOVING_UP`).
- **Form Analysis**: The system catches "Shallow" reps if the 90° threshold isn't broken.

## Slide 7: Innovation 3 - Performance & Privacy
- **Privacy First**: The computer vision models run entirely locally in the browser via WebAssembly. No video is ever sent to a server.
- **Performance**: We decoupled the 60 FPS physics game loop from the React Virtual DOM using `requestAnimationFrame` to prevent the browser from freezing.

## Slide 8: Gamification & AI Coach
- **Retention features**: XP, Leveling up, and dynamic Achievements based on backend database calculations.
- **The AI Coach**: Post-session, telemetry (reps, duration, form percentage) is securely sent to Google Gemini via FastAPI to generate personalized, encouraging feedback.

## Slide 9: Live Demo / Video Demo
*Tip: If presenting live, pre-record a video just in case the internet or lighting fails during the presentation!*
- Show the Login -> Dashboard.
- Show Calibration.
- Show gameplay (looking up/down).
- Show doing a push-up and receiving a shield.
- Show the post-game AI feedback.

## Slide 10: Challenges Faced
- **Challenge 1**: Running Heavy ML models in the browser caused React to crash.
  - **Solution**: Throttled React state updates to 30 FPS while letting the underlying game physics run unhindered at 60 FPS.
- **Challenge 2**: Accurately counting push-ups for different body types.
  - **Solution**: Migrated from simple Y-axis tracking to true 3D angle calculations.

## Slide 11: Future Scope
- **Scaling**: Transitioning from SQLite to PostgreSQL.
- **Exercises**: Adding leg tracking for Squats or Jumping Jacks.
- **Multiplayer**: Adding WebRTC for live 1v1 fitness battles.

## Slide 12: Q&A
- "Thank you for your time. I am now open to questions."
