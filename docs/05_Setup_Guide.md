# Local Development Setup Guide

This guide explains how to run the GazeFlap application directly on your local machine for development purposes.

## Prerequisites
- Node.js (v18 or higher)
- Python (v3.10 or higher)
- A webcam

---

## 1. Backend Setup

The backend provides the API, manages the SQLite database, and handles the AI Coach logic.

1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**
   - On Windows:
     ```bash
     .\venv\Scripts\activate
     ```
   - On Mac/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your variables. If you want the AI Coach feature, you must provide a valid `GEMINI_API_KEY`.

6. **Run the server**
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *The backend is now running at `http://127.0.0.1:8000`.*

---

## 2. Frontend Setup

The frontend hosts the React application, the computer vision engine, and the game loop.

1. **Open a new terminal window and navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   *(Note: The project uses `--legacy-peer-deps` internally for some older testing packages, but standard `npm install` works for the main app)*

3. **Set up Environment Variables**
   By default, the frontend expects the backend API to be running on `http://localhost:8000`. You can configure this by creating a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Play!**
   Open your browser and navigate to `http://localhost:3000`.

---

## Troubleshooting

- **"Camera not working / Permission Denied"**: Browsers restrict webcam access strictly to `localhost` or `https`. Ensure you are accessing the app via `http://localhost:3000` (not an IP address) if testing locally.
- **"CORS Errors"**: Ensure your backend `app/main.py` has `http://localhost:3000` in the `origins` list.
- **"MediaPipe fails to load"**: The app downloads lightweight WASM models from a CDN on first load. Ensure you have an active internet connection.
