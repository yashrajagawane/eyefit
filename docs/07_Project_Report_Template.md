# PROJECT REPORT: EyeFit

**Title:** EyeFit: A Vision-Based Gamified Fitness & Endurance System  
**Submitted by:** [Your Name / Team Name]  
**Degree / Course:** [B.Tech / B.Sc Computer Science / Portfolio]  
**Date:** [Date]  

---

## Abstract
Physical fitness is often hindered by a lack of motivation, engagement, and access to proper form evaluation. EyeFit proposes a novel solution by merging computer vision with gamification. Using standard webcams and on-device machine learning (Google MediaPipe), the system tracks user gaze and body mechanics in real-time. The application features a hands-free game controlled by eye movements, intertwined with physical push-ups that provide in-game advantages. Additionally, an AI-powered coach evaluates the user's form and provides tailored feedback. This report details the architecture, algorithms, and technical implementation of EyeFit.

---

## Chapter 1: Introduction

### 1.1 Problem Statement
Traditional home fitness apps lack interactivity and real-time form correction, often feeling monotonous. Conversely, active video games (exergames) typically require expensive, specialized hardware (e.g., VR headsets, Kinect). 

### 1.2 Objectives
- To develop an accessible fitness platform requiring only a standard webcam.
- To implement accurate, real-time gaze tracking for hands-free UI control.
- To implement a push-up counting engine that evaluates form based on skeletal joint angles.
- To use gamification (XP, levels, achievements) to increase user retention.
- To integrate a Generative AI model to act as a virtual fitness coach.

### 1.3 Scope of the Project
The project is a web-based application consisting of a React frontend and a Python/FastAPI backend. It currently focuses on upper-body endurance (push-ups) and gaze-based interaction, with a scalable architecture designed to support future exercises like squats or jumping jacks.

---

## Chapter 2: Literature Review
*Briefly discuss existing systems.*
- **Traditional Fitness Apps**: Apps like MyFitnessPal or Strava rely on manual input or GPS, lacking real-time physical evaluation.
- **Hardware-based Exergames**: Systems like Nintendo Ring Fit Adventure are highly engaging but require proprietary hardware.
- **Computer Vision in Sports**: Recent advancements in lightweight ML models (like YOLO or MediaPipe) have made browser-based pose estimation viable, bridging the gap between hardware-less and interactive fitness.

---

## Chapter 3: Methodology & Technology Stack

### 3.1 Technology Stack
- **Frontend**: Next.js (React), Tailwind CSS.
- **Computer Vision**: Google MediaPipe Tasks API (WebAssembly).
- **Backend API**: FastAPI (Python), SQLAlchemy.
- **Database**: SQLite (Development), PostgreSQL (Production).
- **AI / LLM**: Google GenAI SDK (Gemini).
- **Deployment**: Docker, Docker Compose.

### 3.2 System Architecture
*Reference the architecture diagram from `04_Architecture.md`.*
The system uses a decoupled architecture. The Next.js frontend runs a 60 FPS `requestAnimationFrame` game loop independently of the React Virtual DOM to ensure smooth physics. The computer vision models run locally via WebAssembly, transmitting skeletal telemetry to the game loop. The FastAPI backend is entirely stateless, managing the persistent gamification data and interfacing with the Gemini API for the virtual coach.

---

## Chapter 4: Implementation of Computer Vision

### 4.1 Gaze Tracking Algorithm
- The system extracts 478 3D facial landmarks.
- It identifies the contour of the eye and the center of the iris.
- Using vertical distance ratios between the iris and the eyelids, it estimates Pitch (looking UP or DOWN). 
- A custom Calibration UI averages the user's baseline resting face to dynamically calculate personalized thresholds.

### 4.2 Push-Up Detection Algorithm
- The system extracts 33 skeletal landmarks.
- The 3D coordinates of the Shoulder, Elbow, and Wrist are used to calculate the internal elbow angle using the Law of Cosines.
- A Finite State Machine tracks the rep: `UP` (>150°) → `MOVING_DOWN` → `BOTTOM` (<90°) → `MOVING_UP` → `UP` (Valid Rep).
- If a user transitions from `MOVING_DOWN` to `MOVING_UP` without hitting the 90° threshold, the system flags the rep as "Shallow".

---

## Chapter 5: Gamification & AI Integration

### 5.1 Gamification Engine
- **XP Formula**: Users gain baseline XP for time survived in the game, heavily multiplied by the number of valid push-ups performed.
- **Achievements**: The backend parses the session data against predefined milestone triggers (e.g., "First 10 Reps", "Perfect Form").

### 5.2 The AI Coach (Gemini)
- Session telemetry (Total Reps, Average Form %, Duration) is securely passed to the backend.
- The backend constructs a rigid, system-prompted request to the Gemini API.
- The LLM returns personalized, encouraging feedback, acting as a post-workout trainer analyzing the specific session's metrics.

---

## Chapter 6: Results & Conclusion

### 6.1 Testing & Performance
- **Frame Rate**: By decoupling the game engine from React state and throttling the MediaPipe output, the application maintains a 60 FPS render rate even on mid-range laptops.
- **Accuracy**: Gaze tracking functions accurately in well-lit environments up to 1 meter from the webcam. Push-up detection requires the upper body to be fully visible in the frame.

### 6.2 Conclusion
EyeFit successfully demonstrates that complex, interactive exergames can be built for the web without requiring specialized hardware. By processing heavy computer vision workloads client-side, the system maintains strict user privacy while delivering a highly responsive gamified workout.

### 6.3 Future Scope
- Expand the pose engine to include lower-body exercises (e.g., squats).
- Implement WebRTC for multiplayer "versus" workout modes.
- Transition the database to PostgreSQL for massive scalability.

---

## References
1. Lugaresi, C. et al. (2019). MediaPipe: A Framework for Building Perception Pipelines.
2. Next.js Documentation (https://nextjs.org/docs)
3. FastAPI Documentation (https://fastapi.tiangolo.com/)
