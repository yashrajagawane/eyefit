from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from app.db.models import User, GameSession
from app.api.deps import get_db, get_current_user

router = APIRouter()

class SessionCreate(BaseModel):
    duration_seconds: int
    game_score: int
    total_reps: int
    valid_reps: int
    average_form: int
    performance_score: int
    fatigue_indicator: int

class SessionResponse(SessionCreate):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post("", response_model=SessionResponse)
def create_session(
    session_in: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Save a completed game session for the current user."""
    db_session = GameSession(
        user_id=current_user.id,
        **session_in.model_dump()
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.get("", response_model=List[SessionResponse])
def get_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 50,
    skip: int = 0
) -> Any:
    """Get past sessions for the current user."""
    sessions = db.query(GameSession)\
        .filter(GameSession.user_id == current_user.id)\
        .order_by(GameSession.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return sessions
