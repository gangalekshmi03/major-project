# app/routers/auth.py

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from bson import ObjectId

from ..db import users
from ..utils.password_utils import hash_password, verify_password
from ..utils.auth_utils import create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ------------------ SIGNUP MODEL ------------------
class SignupModel(BaseModel):
    email: str
    password: str
    username: str
    full_name: str
    bio: str = ""
    profile_pic: str = ""

    matches_played: int = 0
    goals: int = 0
    assists: int = 0
    yellow_cards: int = 0
    red_cards: int = 0
    position: str = ""
    preferred_foot: str = ""
    jersey_number: int = 0


# ------------------ LOGIN MODEL ------------------
class LoginModel(BaseModel):
    email: str
    password: str


# ------------------ SIGNUP ROUTE ------------------
@router.post("/signup")
def signup(user: SignupModel):
    if users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_password = hash_password(user.password)

    new_user = {
        "email": user.email,
        "password": hashed_password,
        "username": user.username,
        "full_name": user.full_name,
        "bio": user.bio,
        "profile_pic": user.profile_pic,

        "followers": [],
        "following": [],

        # Football stats
        "matches_played": user.matches_played,
        "goals": user.goals,
        "assists": user.assists,
        "yellow_cards": user.yellow_cards,
        "red_cards": user.red_cards,
        "position": user.position,
        "preferred_foot": user.preferred_foot,
        "jersey_number": user.jersey_number,
    }

    result = users.insert_one(new_user)
    
    # Generate token for auto-login
    access_token = create_access_token({"user_id": str(result.inserted_id)})
    
    return {
        "status": "success",
        "message": "User created",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(result.inserted_id),
        "name": user.full_name,
    }


# ------------------ LOGIN ROUTE ------------------
@router.post("/login")
def login(data: LoginModel):
    print("LOGIN HIT:", data.email)

    user = users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    if not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")

    access_token = create_access_token({"user_id": str(user["_id"])})

    return {
        "status": "success",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user["_id"]),
        "name": user["full_name"],
    }

# ------------------ GET LOGGED IN USER ------------------
@router.get("/me")
def get_logged_in_user(current_user=Depends(get_current_user)):
    # current_user is already the user dict
    return {
        "status": "success",
        "user": current_user
    }
