from fastapi import APIRouter, Depends, UploadFile, File, Form
from bson import ObjectId
from datetime import datetime
from ..db import db
from ..utils.auth_utils import get_current_user
from ..utils.cloudinary_utils import upload_image_to_cloudinary

router = APIRouter(prefix="/performance", tags=["Performance Analysis"])

# Get database collections
performance = db["performance"]
users = db["users"]

# ============= UPLOAD PERFORMANCE VIDEO =============
@router.post("/upload")
async def upload_performance_video(
    video: UploadFile = File(...),
    match_type: str = Form(...),
    position: str = Form(None),
    match_date: str = Form(None),
    current_user: dict = Depends(get_current_user),
):
    """Upload video for performance analysis"""
    try:
        # Upload video to Cloudinary
        video_url = await upload_image_to_cloudinary(video)
        
        performance_record = {
            "user_id": str(current_user["_id"]),
            "video_url": video_url,
            "match_type": match_type,
            "position": position,
            "match_date": match_date or datetime.now().isoformat(),
            "status": "processing",  # pending → processing → completed
            "created_at": datetime.utcnow(),
            "ml_job_id": None,
            "analysis_results": None,
        }
        
        result = performance.insert_one(performance_record)
        
        return {
            "status": "success",
            "message": "Video uploaded successfully",
            "performance_id": str(result.inserted_id),
            "video_url": video_url,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET ANALYSIS RESULTS =============
@router.get("/analysis/{video_id}")
def get_analysis_results(video_id: str, current_user: dict = Depends(get_current_user)):
    """Get analysis results for a video"""
    try:
        perf = performance.find_one({"_id": ObjectId(video_id)})
        if not perf:
            return {"status": "error", "message": "Performance record not found"}
        
        return {
            "status": "success",
            "performance_id": str(perf["_id"]),
            "video_url": perf.get("video_url"),
            "match_type": perf.get("match_type"),
            "analysis_status": perf.get("status"),
            "results": perf.get("analysis_results") or {
                # Mock results until ML team provides actual data
                "speed": {"max": "8.2 m/s", "avg": "5.4 m/s"},
                "distance": "4.3 km",
                "sprints": 24,
                "passes": {"total": 45, "successful": 41, "accuracy": "91%"},
                "shots": {"total": 3, "onTarget": 1},
                "possession": "48%",
                "heatmap": "Generated",
            }
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GENERATE PLAYER CARD =============
@router.post("/player-card")
def generate_player_card(data: dict, current_user: dict = Depends(get_current_user)):
    """Generate a player card from analysis results"""
    try:
        analysis_id = data.get("analysis_id")
        perf = performance.find_one({"_id": ObjectId(analysis_id)})
        
        if not perf:
            return {"status": "error", "message": "Analysis not found"}
        
        player_card = {
            "user_id": str(current_user["_id"]),
            "analysis_id": analysis_id,
            "title": f"Performance Card - {perf.get('match_type')}",
            "stats": perf.get("analysis_results") or {},
            "created_at": datetime.utcnow(),
            "shared": False,
        }
        
        # You could save this to database
        # player_cards.insert_one(player_card)
        
        return {
            "status": "success",
            "message": "Player card generated",
            "player_card": player_card,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= GET PERFORMANCE HISTORY =============
@router.get("/user/{user_id}")
def get_user_performance_history(user_id: str):
    """Get all performance analyses for a user"""
    try:
        performances = list(
            performance.find(
                {"user_id": user_id}
            ).sort("created_at", -1)
        )
        
        for p in performances:
            p["_id"] = str(p["_id"])
        
        return {
            "status": "success",
            "count": len(performances),
            "performances": performances,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= SUBMIT TO ML SERVICE =============
@router.post("/ml-process")
def submit_to_ml_service(data: dict):
    """Forward video to ML service for processing
    
    This is where you integrate with your friends' ML models.
    They will process the video and return results.
    """
    try:
        video_url = data.get("video_url")
        
        # TODO: Integrate with ML service here
        # Example structure:
        # job_id = ml_service.submit_video(video_url)
        # 
        # For now, return mock job_id
        mock_job_id = "job_" + ObjectId().__str__()
        
        return {
            "status": "success",
            "message": "Submitted to ML service",
            "job_id": mock_job_id,
            "video_url": video_url,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= CHECK ML STATUS =============
@router.get("/ml-status/{job_id}")
def check_ml_status(job_id: str):
    """Check status of ML processing job
    
    Poll this endpoint to get updates on video analysis progress.
    """
    try:
        # TODO: Query your ML service for job status
        # For now, return mock status
        
        return {
            "status": "success",
            "job_id": job_id,
            "processing_status": "completed",  # processing | completed | failed
            "progress": 100,
            "results": {
                "speed": {"max": "8.2 m/s", "avg": "5.4 m/s"},
                "distance": "4.3 km",
                "sprints": 24,
                "passes": {"total": 45, "successful": 41, "accuracy": "91%"},
                "shots": {"total": 3, "onTarget": 1},
            }
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
