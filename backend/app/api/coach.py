from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any
from app.db.models import User, GameSession
from app.api.deps import get_db, get_current_user
from app.services.ai_coach import generate_session_feedback, CoachFeedback

router = APIRouter()

@router.get("/{session_id}", response_model=CoachFeedback)
def get_coach_feedback(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Fetch the session
    session = db.query(GameSession).filter(
        GameSession.id == session_id,
        GameSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or not owned by user."
        )

    # Generate the AI feedback
    # In a fully production app, we would save this to the DB to avoid re-running it.
    # For now, generating it on the fly.
    try:
        feedback = generate_session_feedback(session)
        return feedback
    except Exception as e:
        # Fallback if the API fails
        print(f"AI Coach error: {e}")
        return CoachFeedback(
            summary="Great workout!",
            strength="You pushed through the session.",
            improvement_area="Keep practicing to improve your form.",
            suggested_next_target="Try to beat your score next time."
        )
