from fastapi import APIRouter, Depends
from bson import ObjectId
from datetime import datetime
from ..db import db
from ..utils.auth_utils import get_current_user

router = APIRouter(prefix="/matches", tags=["Matches"])

matches = db["matches"]
users = db["users"]

# ============= CREATE MATCH =============
@router.post("/create")
def create_match(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new match"""
    try:
        match_record = {
            "organizer_id": str(current_user["_id"]),
            "title": data.get("title"),
            "date": data.get("date"),
            "time": data.get("time"),
            "location": data.get("location"),
            "match_type": data.get("match_type"),  # friendly | tournament | training
            "max_players": data.get("max_players", 22),
            "participants": [str(current_user["_id"])],
            "status": "upcoming",  # upcoming | live | completed
            "score": {"team_a": 0, "team_b": 0},
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        
        result = matches.insert_one(match_record)
        
        return {
            "status": "success",
            "message": "Match created successfully",
            "match_id": str(result.inserted_id),
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET ALL MATCHES =============
@router.get("/all")
def get_all_matches(filter_by: str = "all", current_user: dict = Depends(get_current_user)):
    """Get all matches with filtering"""
    try:
        query = {}
        
        if filter_by == "upcoming":
            query["status"] = "upcoming"
        elif filter_by == "completed":
            query["status"] = "completed"
        elif filter_by == "my":
            query["participants"] = str(current_user["_id"])
        
        match_list = list(
            matches.find(query).sort("date", -1)
        )
        
        for match in match_list:
            match["_id"] = str(match["_id"])
            match["organizer_id"] = str(match["organizer_id"])
        
        return {
            "status": "success",
            "count": len(match_list),
            "matches": match_list,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET MATCH DETAILS =============
@router.get("/{match_id}")
def get_match_details(match_id: str, current_user: dict = Depends(get_current_user)):
    """Get detailed information about a match"""
    try:
        match = matches.find_one({"_id": ObjectId(match_id)})
        
        if not match:
            return {"status": "error", "message": "Match not found"}
        
        match["_id"] = str(match["_id"])
        match["organizer_id"] = str(match["organizer_id"])
        
        return {
            "status": "success",
            "match": match,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= JOIN MATCH =============
@router.post("/{match_id}/join")
def join_match(match_id: str, current_user: dict = Depends(get_current_user)):
    """Join a match"""
    try:
        match = matches.find_one({"_id": ObjectId(match_id)})
        
        if not match:
            return {"status": "error", "message": "Match not found"}
        
        user_id = str(current_user["_id"])
        
        if user_id in [str(p) for p in match.get("participants", [])]:
            return {"status": "error", "message": "Already joined this match"}
        
        if len(match.get("participants", [])) >= match.get("max_players", 22):
            return {"status": "error", "message": "Match is full"}
        
        matches.update_one(
            {"_id": ObjectId(match_id)},
            {"$push": {"participants": user_id}}
        )
        
        return {
            "status": "success",
            "message": "Joined match successfully",
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= LEAVE MATCH =============
@router.post("/{match_id}/leave")
def leave_match(match_id: str, current_user: dict = Depends(get_current_user)):
    """Leave a match"""
    try:
        user_id = str(current_user["_id"])
        
        matches.update_one(
            {"_id": ObjectId(match_id)},
            {"$pull": {"participants": user_id}}
        )
        
        return {
            "status": "success",
            "message": "Left match successfully",
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET MATCH PARTICIPANTS =============
@router.get("/{match_id}/participants")
def get_match_participants(match_id: str):
    """Get all participants in a match"""
    try:
        match = matches.find_one({"_id": ObjectId(match_id)})
        
        if not match:
            return {"status": "error", "message": "Match not found"}
        
        participant_ids = match.get("participants", [])
        participant_docs = list(users.find({
            "_id": {"$in": [ObjectId(pid) for pid in participant_ids]}
        }))
        
        for p in participant_docs:
            p["_id"] = str(p["_id"])
        
        return {
            "status": "success",
            "count": len(participant_docs),
            "participants": participant_docs,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= UPLOAD MATCH VIDEO =============
@router.post("/{match_id}/video")
def upload_match_video(match_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Upload video of a match for analysis"""
    try:
        # data should contain: video_url (from Cloudinary), match_highlights
        matches.update_one(
            {"_id": ObjectId(match_id)},
            {
                "$set": {
                    "video_url": data.get("video_url"),
                    "highlights": data.get("highlights"),
                    "updated_at": datetime.utcnow(),
                }
            }
        )
        
        return {
            "status": "success",
            "message": "Match video uploaded successfully",
            "match_id": match_id,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= UPDATE MATCH SCORE =============
@router.put("/{match_id}/score")
def update_match_score(match_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update match score and status"""
    try:
        update_data = {
            "updated_at": datetime.utcnow(),
        }
        
        if "score" in data:
            update_data["score"] = data["score"]
        if "status" in data:
            update_data["status"] = data["status"]
        if "end_time" in data:
            update_data["end_time"] = data["end_time"]
        
        matches.update_one(
            {"_id": ObjectId(match_id)},
            {"$set": update_data}
        )
        
        return {
            "status": "success",
            "message": "Match updated successfully",
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET USER MATCH HISTORY =============
@router.get("/history/user")
def get_user_match_history(current_user: dict = Depends(get_current_user)):
    """Get all matches for a user"""
    try:
        user_id = str(current_user["_id"])
        
        user_matches = list(
            matches.find({"participants": user_id}).sort("date", -1)
        )
        
        for match in user_matches:
            match["_id"] = str(match["_id"])
        
        return {
            "status": "success",
            "count": len(user_matches),
            "matches": user_matches,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= DELETE MATCH =============
@router.delete("/{match_id}")
def delete_match(match_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a match (organizer only)"""
    try:
        match = matches.find_one({"_id": ObjectId(match_id)})
        
        if not match:
            return {"status": "error", "message": "Match not found"}
        
        if match["organizer_id"] != str(current_user["_id"]):
            return {"status": "error", "message": "Only organizer can delete"}
        
        matches.delete_one({"_id": ObjectId(match_id)})
        
        return {
            "status": "success",
            "message": "Match deleted successfully",
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
