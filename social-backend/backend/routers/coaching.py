from fastapi import APIRouter, Depends
from bson import ObjectId
from datetime import datetime
from ..db import db
from ..utils.auth_utils import get_current_user

router = APIRouter(prefix="/coaching", tags=["AI Coaching"])

coaching = db["coaching"]
performance = db["performance"]
users = db["users"]

# ============= GET COACHING PLAN =============
@router.get("/plan")
def get_coaching_plan(user_id: str = None, current_user: dict = Depends(get_current_user)):
    """Get personalized coaching plan"""
    try:
        uid = user_id or str(current_user["_id"])
        
        # Mock coaching plan - replace with ML output from your friends
        coaching_plan = {
            "status": "success",
            "user_id": uid,
            "week": 1,
            "position": "Midfielder",
            "focus_areas": ["Finishing", "Stamina"],
            "training_plan": [
                {
                    "day": "Monday",
                    "focus": "Finishing Drills",
                    "exercises": ["5v5 Possession", "1v1 Finishing", "Set Piece Practice"],
                },
                {
                    "day": "Tuesday",
                    "focus": "High-Intensity Training",
                    "exercises": ["Sprint Intervals", "Shuttle Runs", "Agility Ladder"],
                },
                {
                    "day": "Thursday",
                    "focus": "Tactical Work",
                    "exercises": ["Position Awareness", "Off-Ball Movement", "Transition Play"],
                },
                {
                    "day": "Friday",
                    "focus": "Game Preparation",
                    "exercises": ["Full Match Simulation", "Set Plays", "Recovery Focus"],
                },
            ],
        }
        
        return coaching_plan
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET POSITION RECOMMENDATION =============
@router.get("/position")
def get_position_recommendation(user_id: str = None, current_user: dict = Depends(get_current_user)):
    """Get best position recommendation based on performance data"""
    try:
        uid = user_id or str(current_user["_id"])
        
        # Mock position recommendation - integrate with ML for real analysis
        recommendation = {
            "status": "success",
            "position": "Midfielder",
            "confidence": "94%",
            "reasoning": "Your speed and passing accuracy suit a midfield role",
            "alternative_positions": [
                {"position": "Forward", "confidence": "72%"},
                {"position": "Defender", "confidence": "45%"},
            ],
        }
        
        return recommendation
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET STRENGTHS ANALYSIS =============
@router.get("/strengths")
def get_strengths_analysis(user_id: str = None, current_user: dict = Depends(get_current_user)):
    """Get player strengths analysis"""
    try:
        uid = user_id or str(current_user["_id"])
        
        # Mock strengths - integrate with ML for actual analysis
        strengths = {
            "status": "success",
            "strengths": [
                {"title": "Speed & Agility", "value": "92%", "icon": "lightning-bolt"},
                {"title": "Passing Accuracy", "value": "91%", "icon": "target"},
                {"title": "Decision Making", "value": "85%", "icon": "brain"},
            ],
        }
        
        return strengths
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET WEAKNESSES ANALYSIS =============
@router.get("/weaknesses")
def get_weaknesses_analysis(user_id: str = None, current_user: dict = Depends(get_current_user)):
    """Get areas for improvement"""
    try:
        uid = user_id or str(current_user["_id"])
        
        # Mock weaknesses - integrate with ML for actual analysis
        weaknesses = {
            "status": "success",
            "weaknesses": [
                {"title": "Finishing", "improvement": "Improve shot accuracy by 15%", "icon": "target-variant"},
                {"title": "Stamina", "improvement": "Build endurance with 20-min sprints", "icon": "heart-pulse"},
            ],
        }
        
        return weaknesses
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET WEEKLY TRAINING PLAN =============
@router.get("/training-plan")
def get_weekly_training_plan(position: str = None, current_user: dict = Depends(get_current_user)):
    """Get weekly training plan based on position/performance"""
    try:
        plan = {
            "status": "success",
            "week": 1,
            "position": position or "Midfielder",
            "sessions": [
                {
                    "day": "Monday",
                    "duration": "90 mins",
                    "focus": "Finishing Drills",
                    "intensity": "High",
                },
                {
                    "day": "Tuesday",
                    "duration": "60 mins",
                    "focus": "Recovery & Flexibility",
                    "intensity": "Low",
                },
                {
                    "day": "Wednesday",
                    "duration": "90 mins",
                    "focus": "Tactical Awareness",
                    "intensity": "Medium",
                },
                {
                    "day": "Thursday",
                    "duration": "60 mins",
                    "focus": "Speed Work",
                    "intensity": "High",
                },
                {
                    "day": "Friday",
                    "duration": "90 mins",
                    "focus": "Full Training",
                    "intensity": "Medium",
                },
            ],
        }
        
        return plan
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET MOTIVATIONAL INSIGHT =============
@router.get("/motivation")
def get_motivational_insight(user_id: str = None, current_user: dict = Depends(get_current_user)):
    """Get AI-generated motivational insight"""
    try:
        uid = user_id or str(current_user["_id"])
        
        # Mock motivation - integrate with GPT for real generation
        insight = {
            "status": "success",
            "motivation": "You're on an upward trajectory! Your speed stats have improved 12% this month. Keep pushing on finishing drills and you'll break into the elite tier.",
        }
        
        return insight
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= SAVE ACHIEVEMENT =============
@router.post("/save-achievement")
def save_coaching_achievement(data: dict, current_user: dict = Depends(get_current_user)):
    """Save achievement from coaching insights to user profile"""
    try:
        achievement = {
            "user_id": str(current_user["_id"]),
            "title": data.get("title"),
            "description": data.get("description"),
            "icon": data.get("icon"),
            "created_at": datetime.utcnow(),
        }
        
        # Save to database
        # achievements.insert_one(achievement)
        
        return {
            "status": "success",
            "message": "Achievement saved",
            "achievement": achievement,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET COACHING HISTORY =============
@router.get("/history")
def get_coaching_history(current_user: dict = Depends(get_current_user)):
    """Get past coaching plans and insights"""
    try:
        # Get all coaching records for user
        coaching_records = list(
            coaching.find({
                "user_id": str(current_user["_id"]),
            }).sort("created_at", -1)
        )
        
        for record in coaching_records:
            record["_id"] = str(record["_id"])
        
        return {
            "status": "success",
            "count": len(coaching_records),
            "coaching_history": coaching_records,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
