from fastapi import APIRouter, Depends
from bson import ObjectId
from datetime import datetime, timedelta
from ..db import db
from ..utils.auth_utils import get_current_user

router = APIRouter(prefix="/wellness", tags=["Wellness Tracking"])

wellness = db["wellness"]
users = db["users"]

# ============= LOG WELLNESS DATA =============
@router.post("/log")
def log_wellness_data(data: dict, current_user: dict = Depends(get_current_user)):
    """Log daily wellness metrics (water, sleep, calories)"""
    try:
        wellness_log = {
            "user_id": str(current_user["_id"]),
            "date": data.get("date") or datetime.now().isoformat().split("T")[0],
            "water": data.get("water"),  # liters
            "sleep": data.get("sleep"),  # hours
            "calories": data.get("calories"),  # kcal
            "created_at": datetime.utcnow(),
        }
        
        result = wellness.insert_one(wellness_log)
        
        return {
            "status": "success",
            "message": "Wellness data logged",
            "wellness_id": str(result.inserted_id),
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET TODAY'S WELLNESS SUMMARY =============
@router.get("/today")
def get_today_wellness_summary(current_user: dict = Depends(get_current_user)):
    """Get today's wellness summary"""
    try:
        today = datetime.now().isoformat().split("T")[0]
        
        wellness_data = wellness.find_one({
            "user_id": str(current_user["_id"]),
            "date": today,
        })
        
        if not wellness_data:
            return {
                "status": "success",
                "date": today,
                "water": 0,
                "sleep": 0,
                "calories": 0,
                "recommendations": ["Start logging your wellness data!"],
            }
        
        return {
            "status": "success",
            "water": wellness_data.get("water", 0),
            "sleep": wellness_data.get("sleep", 0),
            "calories": wellness_data.get("calories", 0),
            "date": today,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET WELLNESS HISTORY =============
@router.get("/history")
def get_wellness_history(
    days: int = 7,
    current_user: dict = Depends(get_current_user)
):
    """Get wellness data for past N days"""
    try:
        start_date = (datetime.now() - timedelta(days=days)).isoformat().split("T")[0]
        
        history = list(
            wellness.find({
                "user_id": str(current_user["_id"]),
                "date": {"$gte": start_date},
            }).sort("date", -1)
        )
        
        for h in history:
            h["_id"] = str(h["_id"])
        
        return {
            "status": "success",
            "count": len(history),
            "history": history,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET WELLNESS RECOMMENDATIONS =============
@router.get("/recommendations")
def get_wellness_recommendations(current_user: dict = Depends(get_current_user)):
    """Get AI-generated wellness recommendations based on data"""
    try:
        # Get latest wellness data
        today = datetime.now().isoformat().split("T")[0]
        wellness_data = wellness.find_one({
            "user_id": str(current_user["_id"]),
            "date": today,
        })
        
        recommendations = []
        
        if not wellness_data:
            recommendations.append({
                "icon": "water",
                "title": "Start Tracking",
                "desc": "Begin logging your wellness data today",
                "color": "#4ECDC4",
            })
        else:
            water = wellness_data.get("water", 0)
            sleep = wellness_data.get("sleep", 0)
            calories = wellness_data.get("calories", 0)
            
            if water < 2:
                recommendations.append({
                    "icon": "water",
                    "title": "Increase Hydration",
                    "desc": f"You need {(2 - water):.1f}L more water today",
                    "color": "#4ECDC4",
                })
            
            if sleep < 7:
                recommendations.append({
                    "icon": "sleep",
                    "title": "Improve Sleep",
                    "desc": f"Aim for {(7 - sleep):.1f} more hours tonight",
                    "color": "#95E1D3",
                })
            
            if calories < 2000:
                recommendations.append({
                    "icon": "food-apple",
                    "title": "Boost Nutrition",
                    "desc": f"Consume {2000 - calories} more calories for energy",
                    "color": "#F38181",
                })
            
            if not recommendations:
                recommendations.append({
                    "icon": "check-circle",
                    "title": "Great Job!",
                    "desc": "Your wellness metrics are optimal",
                    "color": "#4ECDC4",
                })
        
        return {
            "status": "success",
            "recommendations": recommendations,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET WEEKLY PROGRESS =============
@router.get("/weekly-progress")
def get_weekly_progress(current_user: dict = Depends(get_current_user)):
    """Get weekly progress charts data"""
    try:
        # Get last 7 days
        history = list(
            wellness.find({
                "user_id": str(current_user["_id"]),
            }).sort("date", -1).limit(7)
        )
        
        # Calculate averages
        avg_water = sum(h.get("water", 0) for h in history) / max(len(history), 1)
        avg_sleep = sum(h.get("sleep", 0) for h in history) / max(len(history), 1)
        avg_calories = sum(h.get("calories", 0) for h in history) / max(len(history), 1)
        
        return {
            "status": "success",
            "days": 7,
            "averages": {
                "water": round(avg_water, 1),
                "sleep": round(avg_sleep, 1),
                "calories": round(avg_calories, 0),
            },
            "trend": "improving",
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET WELLNESS STREAK =============
@router.get("/streak")
def get_wellness_streak(current_user: dict = Depends(get_current_user)):
    """Get current wellness logging streak"""
    try:
        # Count consecutive days with logged data
        history = list(
            wellness.find({
                "user_id": str(current_user["_id"]),
            }).sort("date", -1).limit(30)
        )
        
        streak = 0
        for i, record in enumerate(history):
            expected_date = (datetime.now() - timedelta(days=i)).isoformat().split("T")[0]
            if record.get("date") == expected_date:
                streak += 1
            else:
                break
        
        return {
            "status": "success",
            "current_streak": streak,
            "best_streak": max(30, streak),
            "total_logs": len(history),
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
