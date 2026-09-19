import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    sessions = relationship("GameSession", back_populates="user")
    # Future: achievements, progress, etc.

class GameSession(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    duration_seconds = Column(Integer, nullable=False)
    game_score = Column(Integer, nullable=False)
    total_reps = Column(Integer, nullable=False)
    valid_reps = Column(Integer, nullable=False)
    average_form = Column(Integer, nullable=False)
    performance_score = Column(Integer, nullable=False)
    fatigue_indicator = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="sessions")
