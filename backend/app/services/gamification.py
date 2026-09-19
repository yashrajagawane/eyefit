import datetime
from sqlalchemy.orm import Session
from ..db.models import UserProgress, Achievement, GameSession

def calculate_xp(session: GameSession, is_streak_day: bool, is_new_pr: bool) -> int:
    xp = 0
    xp += session.valid_reps * 5
    xp += int(session.game_score * 0.5)
    
    if session.average_form >= 80:
        xp += 50
        
    if is_new_pr:
        xp += 100
        
    if is_streak_day:
        xp += 25
        
    return xp

def get_level_from_xp(xp: int) -> int:
    if xp < 200:
        return 1
    # Level N = 200 * (N-1)^1.6
    # (xp / 200) = (N-1)^1.6
    # (xp / 200)^(1/1.6) = N-1
    # N = (xp / 200)^(1/1.6) + 1
    return int((xp / 200.0) ** (1 / 1.6)) + 1

def award_xp(user_id: int, xp_earned: int, db: Session) -> dict:
    progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    
    if not progress:
        progress = UserProgress(user_id=user_id, xp=0, level=1, streak=0)
        db.add(progress)
    
    old_level = progress.level
    progress.xp += xp_earned
    progress.level = get_level_from_xp(progress.xp)
    
    leveled_up = progress.level > old_level
    
    db.commit()
    db.refresh(progress)
    
    return {
        "xp_earned": xp_earned,
        "new_total_xp": progress.xp,
        "level": progress.level,
        "leveled_up": leveled_up
    }

def update_streak(user_id: int, db: Session) -> bool:
    """Updates the user's streak and returns True if it's a new streak day."""
    progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    
    if not progress:
        progress = UserProgress(user_id=user_id, xp=0, level=1, streak=0)
        db.add(progress)
        
    today = datetime.datetime.utcnow().date()
    is_streak_day = False
    
    if not progress.last_session_date:
        progress.streak = 1
        is_streak_day = True
    else:
        last_date = progress.last_session_date.date()
        delta = (today - last_date).days
        
        if delta == 1:
            progress.streak += 1
            is_streak_day = True
        elif delta > 1:
            progress.streak = 1
            is_streak_day = True
            
    progress.last_session_date = datetime.datetime.utcnow()
    db.commit()
    db.refresh(progress)
    
    return is_streak_day

def check_achievements(user_id: int, session: GameSession, db: Session) -> list[str]:
    unlocked = []
    
    existing = db.query(Achievement.achievement_id).filter(Achievement.user_id == user_id).all()
    existing_ids = {a[0] for a in existing}
    
    # 1. First session
    if "first_session" not in existing_ids:
        db.add(Achievement(user_id=user_id, achievement_id="first_session"))
        unlocked.append("first_session")
        existing_ids.add("first_session")
        
    # 2. Form master
    if "form_master" not in existing_ids and session.average_form >= 90:
        db.add(Achievement(user_id=user_id, achievement_id="form_master"))
        unlocked.append("form_master")
        existing_ids.add("form_master")
        
    # 3. Rep beast
    if "rep_beast" not in existing_ids and session.valid_reps >= 50:
        db.add(Achievement(user_id=user_id, achievement_id="rep_beast"))
        unlocked.append("rep_beast")
        existing_ids.add("rep_beast")
        
    # 4. High scorer
    if "high_scorer" not in existing_ids and session.game_score >= 20:
        db.add(Achievement(user_id=user_id, achievement_id="high_scorer"))
        unlocked.append("high_scorer")
        existing_ids.add("high_scorer")
        
    progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    
    if progress:
        # 5. Streak 3
        if "streak_3" not in existing_ids and progress.streak >= 3:
            db.add(Achievement(user_id=user_id, achievement_id="streak_3"))
            unlocked.append("streak_3")
            existing_ids.add("streak_3")
            
        # 6. Streak 7
        if "streak_7" not in existing_ids and progress.streak >= 7:
            db.add(Achievement(user_id=user_id, achievement_id="streak_7"))
            unlocked.append("streak_7")
            existing_ids.add("streak_7")
            
        # 7. Level 5
        if "level_5" not in existing_ids and progress.level >= 5:
            db.add(Achievement(user_id=user_id, achievement_id="level_5"))
            unlocked.append("level_5")
            existing_ids.add("level_5")
            
    if unlocked:
        db.commit()
        
    return unlocked
