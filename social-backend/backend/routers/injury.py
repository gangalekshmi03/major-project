from fastapi import APIRouter, Depends
from bson import ObjectId
from datetime import datetime, timedelta
from ..db import db
from ..utils.auth_utils import get_current_user

router = APIRouter(prefix="/injury", tags=["Injury & Recovery"])

injury = db["injury"]
users = db["users"]

# ============= LOG INJURY =============
@router.post("/log")
def log_injury(data: dict, current_user: dict = Depends(get_current_user)):
    """Log a new injury"""
    try:
        injury_record = {
            "user_id": str(current_user["_id"]),
            "injury_type": data.get("injury_type"),
            "body_part": data.get("body_part"),
            "pain_level": data.get("pain_level"),  # 1-10
            "recovery_stage": data.get("recovery_stage"),
            "notes": data.get("notes"),
            "date_injured": data.get("date") or datetime.now().isoformat().split("T")[0],
            "status": "active",  # active | resolved
            "created_at": datetime.utcnow(),
            "recovery_progress": [],
        }
        
        result = injury.insert_one(injury_record)
        
        return {
            "status": "success",
            "message": "Injury logged successfully",
            "injury_id": str(result.inserted_id),
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET RECOVERY PLAN =============
@router.get("/recovery-plan/{injury_id}")
def get_recovery_plan(injury_id: str, current_user: dict = Depends(get_current_user)):
    """Get recovery plan for an injury"""
    try:
        inj = injury.find_one({"_id": ObjectId(injury_id)})
        
        if not inj:
            return {"status": "error", "message": "Injury not found"}
        
        # Mock recovery plan - integrate with ML for real plans
        recovery_plan = {
            "status": "success",
            "injury_type": inj.get("injury_type"),
            "timeline": "2-3 weeks",
            "dos": [
                "Rest the affected area for 48-72 hours",
                "Apply ice for 15-20 minutes, 3-4 times daily",
                "Use compression bandage to reduce swelling",
                "Elevate the injured limb above heart level",
            ],
            "donts": [
                "Do not apply heat in the first 72 hours",
                "Avoid strenuous activities or training",
                "Don't ignore sharp pain or increased swelling",
            ],
            "exercises": [
                {
                    "phase": "Phase 1: Rest & Protect",
                    "days": "Days 1-3",
                    "activities": ["Complete rest", "Ice therapy", "Elevation"],
                },
                {
                    "phase": "Phase 2: Gentle Movement",
                    "days": "Days 4-7",
                    "activities": ["Gentle range of motion", "Massage", "Light stretching"],
                },
            ],
        }
        
        return recovery_plan
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET REHAB EXERCISES =============
@router.get("/exercises")
def get_rehab_exercises(injury_type: str):
    """Get rehabilitation exercises for injury type"""
    try:
        # Mock exercises - integrate with ML/medical database
        exercises = {
            "status": "success",
            "injury_type": injury_type,
            "exercises": [
                {
                    "name": "Light Stretching",
                    "duration": "5 mins",
                    "sets": 3,
                    "rest": "30 secs",
                },
                {
                    "name": "Isometric Hold",
                    "duration": "20 secs",
                    "sets": 3,
                    "rest": "60 secs",
                },
                {
                    "name": "Gradual Load Increase",
                    "duration": "10 mins",
                    "sets": 2,
                    "rest": "2 mins",
                },
            ],
        }
        
        return exercises
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET RECOVERY TIMELINE =============
@router.get("/timeline/{injury_id}")
def get_recovery_timeline(injury_id: str, current_user: dict = Depends(get_current_user)):
    """Get recovery timeline for an injury"""
    try:
        inj = injury.find_one({"_id": ObjectId(injury_id)})
        
        if not inj:
            return {"status": "error", "message": "Injury not found"}
        
        date_injured = datetime.fromisoformat(inj.get("date_injured", datetime.now().isoformat()))
        
        timeline = {
            "status": "success",
            "injury_id": injury_id,
            "date_injured": str(date_injured.date()),
            "estimated_recovery": str((date_injured + timedelta(days=21)).date()),
            "days_elapsed": (datetime.now() - date_injured).days,
            "expected_duration": "21 days",
            "milestones": [
                {"day": 3, "milestone": "Pain reduction", "status": "in_progress"},
                {"day": 7, "milestone": "Light movement", "status": "pending"},
                {"day": 14, "milestone": "Return to training", "status": "pending"},
                {"day": 21, "milestone": "Full recovery", "status": "pending"},
            ],
        }
        
        return timeline
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= UPDATE RECOVERY PROGRESS =============
@router.put("/progress/{injury_id}")
def update_recovery_progress(injury_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update recovery progress"""
    try:
        update_data = {}
        
        if "pain_level" in data:
            update_data["pain_level"] = data["pain_level"]
        if "notes" in data:
            update_data["notes"] = data["notes"]
        if "completed_exercises" in data:
            update_data["recovery_progress"] = data["completed_exercises"]
        
        injury.update_one(
            {"_id": ObjectId(injury_id)},
            {"$set": update_data}
        )
        
        return {
            "status": "success",
            "message": "Recovery progress updated",
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET INJURY HISTORY =============
@router.get("/history")
def get_injury_history(current_user: dict = Depends(get_current_user)):
    """Get all past injuries"""
    try:
        injuries = list(
            injury.find({
                "user_id": str(current_user["_id"]),
            }).sort("created_at", -1)
        )
        
        for inj in injuries:
            inj["_id"] = str(inj["_id"])
        
        return {
            "status": "success",
            "count": len(injuries),
            "injuries": injuries,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET ACTIVE INJURIES =============
@router.get("/active")
def get_active_injuries(current_user: dict = Depends(get_current_user)):
    """Get currently active injuries"""
    try:
        active_injuries = list(
            injury.find({
                "user_id": str(current_user["_id"]),
                "status": "active",
            })
        )
        
        for inj in active_injuries:
            inj["_id"] = str(inj["_id"])
        
        return {
            "status": "success",
            "count": len(active_injuries),
            "active_injuries": active_injuries,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= RESOLVE INJURY =============
@router.put("/resolve/{injury_id}")
def resolve_injury(injury_id: str, current_user: dict = Depends(get_current_user)):
    """Mark injury as resolved"""
    try:
        injury.update_one(
            {"_id": ObjectId(injury_id)},
            {"$set": {"status": "resolved", "resolved_at": datetime.utcnow()}}
        )
        
        return {
            "status": "success",
            "message": "Injury marked as resolved",
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
