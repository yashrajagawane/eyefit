from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_validator
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

    @field_validator('duration_seconds')
    @classmethod
    def duration_valid(cls, v: int) -> int:
        if v < 0 or v > 7200:  # max 2 hours
            raise ValueError('Session duration must be between 0 and 7200 seconds')
        return v

    @field_validator('game_score', 'total_reps', 'valid_reps')
    @classmethod
    def non_negative_and_sane(cls, v: int) -> int:
        if v < 0 or v > 99999:
            raise ValueError('Value is out of acceptable range')
        return v

    @field_validator('average_form', 'performance_score', 'fatigue_indicator')
    @classmethod
    def percentage_valid(cls, v: int) -> int:
        if v < 0 or v > 100:
            raise ValueError('Percentage value must be between 0 and 100')
        return v

class SessionResponse(SessionCreate):
    id: int
    created_at: datetime
    
    # Optional fields returned only when creating a session
    xp_earned: int | None = None
    new_total_xp: int | None = None
    level: int | None = None
    leveled_up: bool | None = None
    unlocked_achievements: List[str] | None = None

    class Config:
        from_attributes = True

@router.post("", response_model=SessionResponse)
def create_session(
    session_in: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Save a completed game session for the current user."""
    from app.services.gamification import calculate_xp, update_streak, check_achievements, award_xp
    
    db_session = GameSession(
        user_id=current_user.id,
        **session_in.model_dump()
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    # Check for PR (simplistic: highest game score)
    best_score_session = db.query(GameSession).filter(
        GameSession.user_id == current_user.id,
        GameSession.id != db_session.id
    ).order_by(GameSession.game_score.desc()).first()
    
    is_new_pr = best_score_session is None or db_session.game_score > best_score_session.game_score
    
    # Gamification
    is_streak_day = update_streak(current_user.id, db)
    xp_to_award = calculate_xp(db_session, is_streak_day, is_new_pr)
    xp_res = award_xp(current_user.id, xp_to_award, db)
    unlocked = check_achievements(current_user.id, db_session, db)
    
    response_data = db_session.__dict__.copy()
    response_data.update(xp_res)
    response_data["unlocked_achievements"] = unlocked
    
    return response_data

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
