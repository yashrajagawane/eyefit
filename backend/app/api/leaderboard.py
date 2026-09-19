from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.models import User, UserProgress
from app.api.deps import get_db

router = APIRouter()

class LeaderboardEntry(BaseModel):
    username: str
    xp: int
    level: int
    
    class Config:
        from_attributes = True

@router.get("", response_model=List[LeaderboardEntry])
def get_leaderboard(
    db: Session = Depends(get_db),
    limit: int = 10
) -> Any:
    """Get the top users by XP."""
    entries = db.query(User.username, UserProgress.xp, UserProgress.level)\
        .join(UserProgress, User.id == UserProgress.user_id)\
        .order_by(UserProgress.xp.desc())\
        .limit(limit)\
        .all()
        
    return [{"username": e.username, "xp": e.xp, "level": e.level} for e in entries]
