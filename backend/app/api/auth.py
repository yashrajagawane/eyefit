from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_validator
from typing import Any
from app.db.models import User
from app.api.deps import get_db, get_current_user
from app.services.auth import get_password_hash, verify_password, create_access_token
from app.limiter import limiter

router = APIRouter()

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

    @field_validator('username')
    @classmethod
    def username_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3 or len(v) > 32:
            raise ValueError('Username must be 3-32 characters')
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username may only contain letters, numbers, hyphens, or underscores')
        return v

    @field_validator('email')
    @classmethod
    def email_valid(cls, v: str) -> str:
        v = v.strip().lower()
        if '@' not in v or '.' not in v.split('@')[-1]:
            raise ValueError('Invalid email address')
        return v

    @field_validator('password')
    @classmethod
    def password_valid(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    xp: int = 0
    level: int = 1
    achievements: list[str] = []
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/register", response_model=UserResponse)
@limiter.limit("5/minute")
def register(request: Request, user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    user = db.query(User).filter((User.email == user_in.email) | (User.username == user_in.username)).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="User with this email or username already exists.",
        )
    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)) -> Any:
    # We already have the current_user, but we need to fetch their progress and achievements
    response = UserResponse.model_validate(current_user)
    
    if current_user.progress:
        response.xp = current_user.progress.xp
        response.level = current_user.progress.level
    
    if current_user.achievements:
        response.achievements = [a.achievement_id for a in current_user.achievements]
        
    return response
