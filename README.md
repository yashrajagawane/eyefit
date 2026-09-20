<div align="center">
  <h1>👀 EyeFit</h1>
  <p><strong>Vision-Based Gamified Fitness & Endurance System</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)](https://fastapi.tiangolo.com/)
  [![MediaPipe](https://img.shields.io/badge/Google-MediaPipe-blue)](https://developers.google.com/mediapipe)
  [![Docker](https://img.shields.io/badge/Docker-Supported-2496ED)](https://www.docker.com/)
</div>

<br />

EyeFit is a web-based fitness application that merges computer vision, gaming, and exercise. It tracks your gaze to control a game character (like Flappy Bird) while simultaneously analyzing your physical push-up form using your device's webcam—all running locally in your browser.

> **Privacy First**: All computer vision processing happens locally on your device via WebAssembly. No video or image data is ever recorded or sent to any server.

## ✨ Features

- **👀 Gaze Tracking Control**: Play a Flappy Bird-style game entirely hands-free by looking UP or DOWN. Features personalized calibration for accuracy.
- **💪 Push-Up Form Engine**: Real-time skeletal tracking counts your push-ups, monitors elbow angles, and evaluates your form (e.g., "Good", "Shallow", "Incomplete").
- **🎮 Unified Gamification**: Your physical exercise directly influences the game. Doing perfect push-ups grants you shields in the game.
- **📈 Progression System**: Earn XP, level up, unlock achievements, and maintain daily streaks based on your workout performance.
- **🤖 AI Coach**: Powered by Google Gemini, receive personalized, post-workout feedback analyzing your form and fatigue levels to suggest your next workout target.

## 🏗️ Architecture Stack

- **Frontend**: Next.js 15 (React), TypeScript, Tailwind CSS
- **Vision Models**: Google MediaPipe Tasks Vision (`FaceLandmarker`, `PoseLandmarker`)
- **Backend API**: FastAPI (Python), SQLAlchemy, SQLite
- **AI Integration**: Google GenAI SDK (Gemini)

## 🚀 Quick Start (Docker)

The easiest way to run EyeFit is via Docker Compose.

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eyefit.git
   cd eyefit
   ```

2. **Configure Environment Variables**
   ```bash
   cp backend/.env.example backend/.env
   ```
   *Edit `backend/.env` to include your `GEMINI_API_KEY` if you want the AI Coach feature to work.*

3. **Start the containers**
   ```bash
   docker-compose up --build
   ```

4. **Play!**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## 💻 Local Development Setup

If you prefer to run the frontend and backend separately for development, please refer to the detailed [Setup Guide](docs/05_Setup_Guide.md).

## 📚 Documentation

Dive deeper into how EyeFit is built:

1. [Development Roadmap & Phases](docs/03_Phases.md)
2. [System Architecture](docs/04_Architecture.md)
3. [Computer Vision & Algorithms](docs/06_Computer_Vision.md)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 

## 📝 License

This project is licensed under the MIT License.
