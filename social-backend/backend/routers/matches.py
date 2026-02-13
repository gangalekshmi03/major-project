from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, Query

from ..db import db
from ..utils.auth_utils import get_current_user

router = APIRouter(prefix="/matches", tags=["Matches"])

matches = db["matches"]
users = db["users"]


def _to_object_id(value: str):
    try:
        return ObjectId(value)
    except Exception:
        return None


def _serialize_match(match_doc: dict):
    match_doc["_id"] = str(match_doc["_id"])
    match_doc["organizer_id"] = str(match_doc.get("organizer_id", ""))
    match_doc["participants"] = [str(pid) for pid in match_doc.get("participants", [])]
    match_doc["participant_count"] = len(match_doc["participants"])
    return match_doc


def _get_match_or_error(match_id: str):
    match_object_id = _to_object_id(match_id)
    if not match_object_id:
        return None, {"status": "error", "message": "Invalid match id"}

    match_doc = matches.find_one({"_id": match_object_id})
    if not match_doc:
        return None, {"status": "error", "message": "Match not found"}

    return match_doc, None


def _is_organizer(match_doc: dict, user_id: str):
    return str(match_doc.get("organizer_id")) == user_id


def _build_participant_snapshot(user_doc: dict):
    return {
        "user_id": str(user_doc.get("_id")),
        "full_name": user_doc.get("full_name"),
        "username": user_doc.get("username"),
        "email": user_doc.get("email"),
        "added_at": datetime.utcnow(),
    }


def _get_user_doc_by_id(user_id: str):
    user_object_id = _to_object_id(user_id)
    if not user_object_id:
        return None
    return users.find_one({"_id": user_object_id}, {"password": 0})


# ============= CREATE MATCH =============
@router.post("/create")
def create_match(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new match."""
    try:
        organizer_id = str(current_user["_id"])
        title = data.get("title") or data.get("opponent") or "New Match"

        if not data.get("date") or not data.get("time") or not data.get("location"):
            return {"status": "error", "message": "date, time and location are required"}

        max_players = data.get("max_players", 22)
        try:
            max_players = int(max_players)
        except Exception:
            return {"status": "error", "message": "max_players must be a number"}

        if max_players < 2:
            return {"status": "error", "message": "max_players must be at least 2"}

        match_record = {
            "organizer_id": organizer_id,
            "title": title,
            "date": data.get("date"),
            "time": data.get("time"),
            "location": data.get("location"),
            "match_type": data.get("match_type", "friendly"),
            "description": data.get("description", ""),
            "max_players": max_players,
            "participants": [organizer_id],
            "participant_details": [
                {
                    "user_id": organizer_id,
                    "full_name": current_user.get("full_name"),
                    "username": current_user.get("username"),
                    "email": current_user.get("email"),
                    "added_at": datetime.utcnow(),
                }
            ],
            "status": data.get("status", "upcoming"),  # upcoming | live | completed
            "score": data.get("score", {"team_a": 0, "team_b": 0}),
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
def get_all_matches(
    filter_by: str = Query("all"),
    filter: str | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    page: int = Query(1, ge=1),
    current_user: dict = Depends(get_current_user),
):
    """Get all matches with filtering and pagination."""
    try:
        effective_filter = (filter or filter_by or "all").lower()
        user_id = str(current_user["_id"])
        query = {}

        if effective_filter == "upcoming":
            query["status"] = "upcoming"
        elif effective_filter == "completed":
            query["status"] = "completed"
        elif effective_filter == "my":
            query["participants"] = user_id

        skip = (page - 1) * limit
        total = matches.count_documents(query)

        match_list = list(matches.find(query).sort("created_at", -1).skip(skip).limit(limit))
        match_list = [_serialize_match(match_doc) for match_doc in match_list]

        return {
            "status": "success",
            "count": len(match_list),
            "total": total,
            "page": page,
            "limit": limit,
            "matches": match_list,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= MATCH HISTORY SUMMARY =============
@router.get("/history/summary")
def get_user_match_history_summary(current_user: dict = Depends(get_current_user)):
    """Get current user's upcoming and completed organized/joined matches."""
    try:
        user_id = str(current_user["_id"])
        user_matches = list(matches.find({"participants": user_id}).sort("created_at", -1))

        serialized = [_serialize_match(match_doc) for match_doc in user_matches]
        upcoming = [m for m in serialized if m.get("status") == "upcoming"]
        completed = [m for m in serialized if m.get("status") == "completed"]

        return {
            "status": "success",
            "summary": {
                "total": len(serialized),
                "upcoming_count": len(upcoming),
                "completed_count": len(completed),
            },
            "upcoming": upcoming,
            "completed": completed,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET USER MATCH HISTORY =============
@router.get("/history/user")
def get_user_match_history(current_user: dict = Depends(get_current_user)):
    """Get all matches for current user."""
    try:
        user_id = str(current_user["_id"])

        user_matches = list(matches.find({"participants": user_id}).sort("created_at", -1))
        user_matches = [_serialize_match(match_doc) for match_doc in user_matches]

        return {
            "status": "success",
            "count": len(user_matches),
            "matches": user_matches,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET MATCH DETAILS =============
@router.get("/{match_id}")
def get_match_details(match_id: str, current_user: dict = Depends(get_current_user)):
    """Get detailed information about a match."""
    try:
        match_doc, error = _get_match_or_error(match_id)
        if error:
            return error

        return {
            "status": "success",
            "match": _serialize_match(match_doc),
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= JOIN MATCH =============
@router.post("/{match_id}/join")
def join_match(match_id: str, current_user: dict = Depends(get_current_user)):
    """Join a match."""
    try:
        match_doc, error = _get_match_or_error(match_id)
        if error:
            return error

        if match_doc.get("status") == "completed":
            return {"status": "error", "message": "Cannot join a completed match"}

        user_id = str(current_user["_id"])
        participants = [str(p) for p in match_doc.get("participants", [])]

        if user_id in participants:
            return {"status": "error", "message": "Already joined this match"}

        if len(participants) >= int(match_doc.get("max_players", 22)):
            return {"status": "error", "message": "Match is full"}

        matches.update_one(
            {"_id": ObjectId(match_id)},
            {
                "$push": {
                    "participants": user_id,
                    "participant_details": _build_participant_snapshot(current_user),
                },
                "$set": {"updated_at": datetime.utcnow()},
            },
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
    """Leave a match."""
    try:
        match_doc, error = _get_match_or_error(match_id)
        if error:
            return error

        user_id = str(current_user["_id"])

        if _is_organizer(match_doc, user_id):
            return {"status": "error", "message": "Organizer cannot leave their own match"}

        matches.update_one(
            {"_id": ObjectId(match_id)},
            {
                "$pull": {
                    "participants": user_id,
                    "participant_details": {"user_id": user_id},
                },
                "$set": {"updated_at": datetime.utcnow()},
            },
        )

        return {
            "status": "success",
            "message": "Left match successfully",
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= ADD PARTICIPANT (ORGANIZER) =============
@router.post("/{match_id}/participants/add")
def add_participant(match_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Organizer adds a player by user_id."""
    try:
        match_doc, error = _get_match_or_error(match_id)
        if error:
            return error

        user_id = str(current_user["_id"])
        if not _is_organizer(match_doc, user_id):
            return {"status": "error", "message": "Only organizer can add participants"}

        new_participant_id = str(data.get("user_id", "")).strip()
        participant_object_id = _to_object_id(new_participant_id)

        if not participant_object_id:
            return {"status": "error", "message": "Valid user_id is required"}

        participant_exists = users.find_one({"_id": participant_object_id})
        if not participant_exists:
            return {"status": "error", "message": "User not found"}

        participants = [str(p) for p in match_doc.get("participants", [])]
        if new_participant_id in participants:
            return {"status": "error", "message": "User is already in this match"}

        if len(participants) >= int(match_doc.get("max_players", 22)):
            return {"status": "error", "message": "Match is full"}

        matches.update_one(
            {"_id": ObjectId(match_id)},
            {
                "$push": {
                    "participants": new_participant_id,
                    "participant_details": _build_participant_snapshot(participant_exists),
                },
                "$set": {"updated_at": datetime.utcnow()},
            },
        )

        return {"status": "success", "message": "Participant added successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= REMOVE PARTICIPANT (ORGANIZER) =============
@router.post("/{match_id}/participants/remove")
def remove_participant(match_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Organizer removes a player by user_id."""
    try:
        match_doc, error = _get_match_or_error(match_id)
        if error:
            return error

        user_id = str(current_user["_id"])
        if not _is_organizer(match_doc, user_id):
            return {"status": "error", "message": "Only organizer can remove participants"}

        participant_id = str(data.get("user_id", "")).strip()
        if not participant_id:
            return {"status": "error", "message": "user_id is required"}

        if participant_id == str(match_doc.get("organizer_id")):
            return {"status": "error", "message": "Organizer cannot be removed"}

        matches.update_one(
            {"_id": ObjectId(match_id)},
            {
                "$pull": {
                    "participants": participant_id,
                    "participant_details": {"user_id": participant_id},
                },
                "$set": {"updated_at": datetime.utcnow()},
            },
        )

        return {"status": "success", "message": "Participant removed successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET MATCH PARTICIPANTS =============
@router.get("/{match_id}/participants")
def get_match_participants(match_id: str, current_user: dict = Depends(get_current_user)):
    """Get all participants in a match."""
    try:
        match_doc, error = _get_match_or_error(match_id)
        if error:
            return error

        participant_ids = [str(pid) for pid in match_doc.get("participants", [])]
        participant_details = match_doc.get("participant_details", [])

        details_by_user_id = {
            str(detail.get("user_id")): detail for detail in participant_details if detail.get("user_id")
        }

        serialized_participants = []
        refreshed_participant_details = []
        for participant_id in participant_ids:
            user_doc = _get_user_doc_by_id(participant_id)
            if user_doc:
                existing_detail = details_by_user_id.get(participant_id, {})
                snapshot = _build_participant_snapshot(user_doc)
                if existing_detail.get("added_at"):
                    snapshot["added_at"] = existing_detail.get("added_at")

                refreshed_participant_details.append(snapshot)
                serialized_participants.append(
                    {
                        "_id": str(user_doc.get("_id")),
                        "full_name": user_doc.get("full_name"),
                        "username": user_doc.get("username"),
                        "email": user_doc.get("email"),
                    }
                )
                continue

            detail = details_by_user_id.get(participant_id, {})
            refreshed_participant_details.append(
                {
                    "user_id": participant_id,
                    "full_name": detail.get("full_name"),
                    "username": detail.get("username"),
                    "email": detail.get("email"),
                    "added_at": detail.get("added_at", datetime.utcnow()),
                }
            )
            serialized_participants.append(
                {
                    "_id": participant_id,
                    "full_name": detail.get("full_name"),
                    "username": detail.get("username"),
                    "email": detail.get("email"),
                }
            )

        matches.update_one(
            {"_id": ObjectId(match_id)},
            {
                "$set": {
                    "participant_details": refreshed_participant_details,
                    "updated_at": datetime.utcnow(),
                }
            },
        )

        return {
            "status": "success",
            "count": len(serialized_participants),
            "participants": serialized_participants,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= UPLOAD MATCH VIDEO =============
@router.post("/{match_id}/video")
def upload_match_video(match_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Upload video of a match for analysis."""
    try:
        match_doc, error = _get_match_or_error(match_id)
        if error:
            return error

        user_id = str(current_user["_id"])
        if not _is_organizer(match_doc, user_id):
            return {"status": "error", "message": "Only organizer can upload match video"}

        matches.update_one(
            {"_id": ObjectId(match_id)},
            {
                "$set": {
                    "video_url": data.get("video_url"),
                    "highlights": data.get("highlights"),
                    "updated_at": datetime.utcnow(),
                }
            },
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
    """Update match score and status."""
    try:
        match_doc, error = _get_match_or_error(match_id)
        if error:
            return error

        user_id = str(current_user["_id"])
        if not _is_organizer(match_doc, user_id):
            return {"status": "error", "message": "Only organizer can update score"}

        update_data = {
            "updated_at": datetime.utcnow(),
        }

        if "score" in data:
            update_data["score"] = data["score"]
        if "status" in data:
            update_data["status"] = data["status"]
        if "end_time" in data:
            update_data["end_time"] = data["end_time"]

        matches.update_one({"_id": ObjectId(match_id)}, {"$set": update_data})

        return {
            "status": "success",
            "message": "Match updated successfully",
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= DELETE MATCH =============
@router.delete("/{match_id}")
def delete_match(match_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a match (organizer only)."""
    try:
        match_doc, error = _get_match_or_error(match_id)
        if error:
            return error

        if not _is_organizer(match_doc, str(current_user["_id"])):
            return {"status": "error", "message": "Only organizer can delete"}

        matches.delete_one({"_id": ObjectId(match_id)})

        return {
            "status": "success",
            "message": "Match deleted successfully",
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
