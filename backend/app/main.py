from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, sessions, leaderboard

app = FastAPI(
    title="EyeFit API",
    description="Vision-Based Gamified Fitness & Endurance System API",
    version="1.0.0",
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "EyeFit API is running"}

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["Sessions"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["Leaderboard"])
