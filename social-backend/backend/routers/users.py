# app/routers/users.py

from fastapi import APIRouter, HTTPException, Depends, Form
from datetime import datetime
from bson import ObjectId

from ..db import users, posts
from backend.utils.auth_utils import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


# ---------------------------------------------------------
# 1️⃣ GET LOGGED-IN USER (/users/me)
# ---------------------------------------------------------
@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    user = users.find_one({"_id": ObjectId(current_user["_id"])}, {"password": 0})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user["id"] = str(user["_id"])
    user.pop("_id", None)

    return {"status": "success", "user": user}


# ---------------------------------------------------------
# 2️⃣ GET PUBLIC PROFILE BY USER ID (/users/{user_id})
# ---------------------------------------------------------
@router.get("/{user_id}")
def get_user_profile(user_id: str):
    user = users.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user["id"] = str(user["_id"])
    user.pop("_id", None)
    user.pop("password", None)

    return {"status": "success", "user": user}


# ---------------------------------------------------------
# 3️⃣ GET USER POSTS (/users/{user_id}/posts)
# ---------------------------------------------------------
@router.get("/{user_id}/posts")
def get_user_posts(user_id: str):
    user_posts = list(posts.find({"owner_id": user_id}).sort("created_at", -1))

    for p in user_posts:
        p["_id"] = str(p["_id"])

    return {"status": "success", "posts": user_posts}


# ---------------------------------------------------------
# 4️⃣ UPDATE BASIC PROFILE (Protected)
# ---------------------------------------------------------
@router.put("/me")
def update_profile(
    username: str = Form(None),
    full_name: str = Form(None),
    bio: str = Form(None),
    profile_pic: str = Form(None),
    age: int = Form(None),
    gender: str = Form(None),
    height_cm: float = Form(None),
    weight_kg: float = Form(None),
    current_user: dict = Depends(get_current_user)
):
    user_id = ObjectId(current_user["_id"])
    update = {}
    push_update = {}

    if username is not None: update["username"] = username
    if full_name is not None: update["full_name"] = full_name
    if bio is not None: update["bio"] = bio
    if profile_pic is not None: update["profile_pic"] = profile_pic
    if age is not None: update["age"] = age
    if gender is not None: update["gender"] = gender
    if height_cm is not None:
        update["height_cm"] = height_cm
        push_update["height_history"] = {
            "value": height_cm,
            "recorded_at": datetime.utcnow().isoformat()
        }
    if weight_kg is not None:
        update["weight_kg"] = weight_kg
        push_update["weight_history"] = {
            "value": weight_kg,
            "recorded_at": datetime.utcnow().isoformat()
        }

    if not update and not push_update:
        raise HTTPException(status_code=400, detail="No fields to update")

    mongo_update = {}
    if update:
        mongo_update["$set"] = update
    if push_update:
        mongo_update["$push"] = push_update

    users.update_one({"_id": user_id}, mongo_update)

    return {"status": "success", "message": "Profile updated"}


# ---------------------------------------------------------
# 5️⃣ UPDATE PLAYER STATS (Protected)
# ---------------------------------------------------------
@router.put("/me/stats")
def update_stats(
    matches_played: int = Form(None),
    goals: int = Form(None),
    assists: int = Form(None),
    yellow_cards: int = Form(None),
    red_cards: int = Form(None),
    position: str = Form(None),
    preferred_foot: str = Form(None),
    jersey_number: int = Form(None),
    current_user: dict = Depends(get_current_user)
):
    user_id = ObjectId(current_user["_id"])
    update = {}

    if matches_played is not None: update["matches_played"] = matches_played
    if goals is not None: update["goals"] = goals
    if assists is not None: update["assists"] = assists
    if yellow_cards is not None: update["yellow_cards"] = yellow_cards
    if red_cards is not None: update["red_cards"] = red_cards
    if position is not None: update["position"] = position
    if preferred_foot is not None: update["preferred_foot"] = preferred_foot
    if jersey_number is not None: update["jersey_number"] = jersey_number

    if not update:
        raise HTTPException(status_code=400, detail="No stats to update")

    users.update_one({"_id": user_id}, {"$set": update})

    return {"status": "success", "message": "Stats updated"}


# ---------------------------------------------------------
# 6️⃣ LIST USERS (Explore Users)
# ---------------------------------------------------------
@router.get("/")
def list_users(skip: int = 0, limit: int = 50):
    cursor = users.find({}, {"password": 0}).skip(skip).limit(limit)
    out = []

    for u in cursor:
        u["id"] = str(u["_id"])
        u.pop("_id", None)
        out.append(u)

    return {"status": "success", "users": out}
