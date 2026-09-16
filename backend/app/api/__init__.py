# API router index
from fastapi import APIRouter

api_router = APIRouter()

@api_router.get("/health")
def health_check():
    return {"status": "ok", "message": "API is healthy"}
