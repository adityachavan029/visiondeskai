"""
auth_routes.py
---------------
Authentication API routes for VisionDesk AI.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter(prefix="/api/auth", tags=["auth"])

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(user_data: UserRegister):
    return {
        "message": "User registered successfully",
        "user": {
            "name": user_data.name,
            "email": user_data.email
        },
        "token": "mock_jwt_token_12345"
    }

@router.post("/login")
async def login(user_data: UserLogin):
    return {
        "message": "Login successful",
        "user": {
            "name": user_data.email.split("@")[0].capitalize(),
            "email": user_data.email
        },
        "token": "mock_jwt_token_12345"
    }

@router.get("/me")
async def get_current_user():
    return {
        "user": {
            "name": "Safety Inspector",
            "email": "inspector@visiondesk.ai"
        }
    }
