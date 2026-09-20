import pytest
from app.services.gamification import calculate_xp, get_level_from_xp, check_achievements
from app.db.models import User, GameSession, UserProgress, Achievement

class MockQuery:
    def __init__(self, data=None):
        self.data = data
        
    def filter(self, *args):
        return self
        
    def first(self):
        return self.data

    def all(self):
        return self.data or []

# Mock database session
class MockDbSession:
    def __init__(self):
        self.added = []
        self.committed = False
        self.query_return = None
    
    def add(self, obj):
        self.added.append(obj)
    
    def commit(self):
        self.committed = True
        
    def refresh(self, obj):
        pass
        
    def query(self, *args):
        return MockQuery(self.query_return)

def test_calculate_xp():
    session = GameSession(
        valid_reps=30,  # 30 * 5 = 150 XP
        game_score=50,  # 50 * 0.5 = 25 XP
        average_form=95, # 95 >= 80 -> +50 XP
        performance_score=80
    )
    
    xp_earned = calculate_xp(session, is_streak_day=False, is_new_pr=True)
    
    # Base XP = 150 + 25 + 50 = 225
    # PR bonus = 100
    # Streak bonus = 0
    # Total = 325
    assert xp_earned == 325

def test_level_up():
    assert get_level_from_xp(0) == 1
    assert get_level_from_xp(200) == 2
    assert get_level_from_xp(1000) > 2

def test_achievements():
    db = MockDbSession()
    # Mock that the user has no existing achievements and is on a 3 day streak
    db.query_return = []
    
    # But wait, check_achievements queries Achievement and then UserProgress.
    # Our simple mock returns the same thing for both.
    # Let's write a better mock for query
    class SmartMockQuery:
        def __init__(self, model):
            self.model = model
            
        def filter(self, *args):
            return self
            
        def first(self):
            if self.model == UserProgress:
                return UserProgress(level=1, streak=3)
            return None

        def all(self):
            if self.model == Achievement.achievement_id:
                return []
            return []

    db.query = lambda model: SmartMockQuery(model)

    session = GameSession(
        valid_reps=55, # Triggers "rep_beast" (>=50)
        game_score=25, # Triggers "high_scorer" (>=20)
        average_form=95 # Triggers "form_master" (>=90)
    )
    
    new_achievements = check_achievements(user_id=1, session=session, db=db)
    
    assert "first_session" in new_achievements
    assert "rep_beast" in new_achievements
    assert "high_scorer" in new_achievements
    assert "form_master" in new_achievements
    assert "streak_3" in new_achievements
    assert "streak_7" not in new_achievements
