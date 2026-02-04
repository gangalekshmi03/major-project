# ML Team Quick Reference - Integration Points

## Overview
Your ML models need to be integrated at these TODO endpoints. All endpoints return mock data now - replace with your actual model outputs.

---

## 1️⃣ Performance Analysis - Video Processing

**Backend File**: `backend/routers/performance.py`

### Endpoint 1: Submit Video for Analysis
```python
# Line 95-108
POST /performance/ml-process
Input: {
  "video_url": "cloudinary_url",
  "analysis_type": "overall" | "passing" | "shooting" | "movement"
}
Output: {
  "status": "success",
  "job_id": "unique_job_id_from_your_service"
}
```

**Your Task**: Submit video to your ML service, return job_id for polling

### Endpoint 2: Poll Analysis Results
```python
# Line 111-122
GET /performance/ml-status/{job_id}
Output: {
  "job_id": "...",
  "status": "pending" | "processing" | "completed",
  "results": {
    "speed": {"max": "8.2 m/s", "avg": "5.4 m/s"},
    "distance": "4.3 km",
    "sprints": 24,
    "passes": {"total": 45, "successful": 41, "accuracy": "91%"},
    "shots": {"total": 3, "onTarget": 1}
  }
}
```

**Your Task**: Poll your ML service, return results once processing complete

---

## 2️⃣ AI Coaching - Player Analysis

**Backend File**: `backend/routers/coaching.py`

### Endpoint 1: Position Recommendation
```python
# Line 68-78
GET /coaching/position
Output: {
  "position": "Midfielder",
  "confidence": 0.92,
  "reasoning": "Based on movement patterns and passing accuracy"
}
```

**Your Task**: Analyze player performance videos, recommend best position

### Endpoint 2: Strengths Detection
```python
# Line 81-92
GET /coaching/strengths
Output: {
  "strengths": [
    {"skill": "Passing", "percentage": 92},
    {"skill": "Vision", "percentage": 85},
    {"skill": "Work Rate", "percentage": 80}
  ]
}
```

**Your Task**: Analyze videos to detect top 3 strengths with confidence %

### Endpoint 3: Weaknesses/Improvements
```python
# Line 95-105
GET /coaching/weaknesses
Output: {
  "improvements": [
    {"area": "First Touch", "current": 75, "target": 85},
    {"area": "Weak Foot", "current": 60, "target": 75}
  ]
}
```

**Your Task**: Identify improvement areas and set realistic targets

### Endpoint 4: Motivational Insights
```python
# Line 176-186
GET /coaching/motivation
Output: {
  "motivation": "Your passing accuracy has improved 5% this week!",
  "metric": "passes",
  "improvement": 5,
  "emoji": "⚡"
}
```

**Your Task**: Generate GPT-based personalized motivation (optional)

---

## 3️⃣ Injury Recovery - Medical Analysis

**Backend File**: `backend/routers/injury.py`

### Endpoint: Get Recovery Plan
```python
# Line 47-77
GET /injury/recovery-plan/{injury_id}
Output: {
  "timeline": "21 days",
  "dos": [
    "Rest the affected area for 48-72 hours",
    "Apply ice for 15-20 minutes, 3-4 times daily"
  ],
  "donts": [
    "Do not apply heat in the first 72 hours",
    "Avoid strenuous activities"
  ],
  "exercises": [
    {
      "phase": "Phase 1: Rest & Protect",
      "days": "Days 1-3",
      "activities": ["Complete rest", "Ice therapy"]
    }
  ]
}
```

**Your Task**: 
1. Get injury type from database
2. Call your medical AI model for personalized recovery plan
3. Return phases, exercises, dos/donts based on injury severity

---

## ML Service Integration Pattern

### Example Implementation
```python
# In backend/routers/performance.py
from your_ml_service import MLServiceClient

ml_client = MLServiceClient(api_key="your_key", base_url="your_service_url")

@router.post("/ml-process")
def process_video_ml(data: dict):
    video_url = data.get("video_url")
    
    # Submit to ML service
    job_id = ml_client.submit_video(video_url)
    
    # Store job_id in database (optional, for tracking)
    ml_jobs.insert_one({
        "job_id": job_id,
        "video_url": video_url,
        "status": "submitted",
        "created_at": datetime.utcnow()
    })
    
    return {"status": "success", "job_id": job_id}

@router.get("/ml-status/{job_id}")
def check_ml_status(job_id: str):
    # Poll ML service
    status = ml_client.get_status(job_id)
    
    if status == "completed":
        results = ml_client.get_results(job_id)
        return {
            "job_id": job_id,
            "status": "completed",
            "results": results
        }
    else:
        return {
            "job_id": job_id,
            "status": status,
            "results": None
        }
```

---

## Data Flow Diagrams

### Performance Analysis Flow
```
User Uploads Video (Expo App)
        ↓
uploadPerformanceVideo() → Backend: POST /performance/upload
        ↓
Backend saves to Cloudinary, returns video_id
        ↓
User views analysis screen
        ↓
getAnalysisResults() → Backend: GET /performance/analysis/{id}
        ↓
Backend calls YOUR ML SERVICE (through TODO endpoints)
        ↓
Returns analysis results to frontend
        ↓
Frontend displays metrics, charts, player card
```

### Coaching Analysis Flow
```
User opens AI Coach screen
        ↓
Frontend calls multiple endpoints in parallel:
  - getPositionRecommendation()
  - getStrengthsAnalysis()
  - getWeaknessesAnalysis()
  - getWeeklyTrainingPlan()
        ↓
Each calls YOUR ML SERVICE endpoints
        ↓
Results combined and displayed on single screen
```

---

## API Service Template

Use this as a starting point for your ML service wrapper:

```python
class FootballMLService:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.client = httpx.AsyncClient()
    
    async def submit_video(self, video_url: str, analysis_type: str):
        """Submit video for analysis, return job_id"""
        response = await self.client.post(
            f"{self.base_url}/analyze",
            json={"video_url": video_url, "type": analysis_type},
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        return response.json()["job_id"]
    
    async def get_status(self, job_id: str):
        """Check processing status"""
        response = await self.client.get(
            f"{self.base_url}/status/{job_id}",
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        return response.json()["status"]
    
    async def get_results(self, job_id: str):
        """Get analysis results once complete"""
        response = await self.client.get(
            f"{self.base_url}/results/{job_id}",
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        return response.json()["results"]
```

---

## Testing Your Integration

### 1. Test Video Upload
```bash
# First, upload a video
curl -X POST http://192.168.1.5:8000/performance/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "video=@test_video.mp4" \
  -F "match_type=friendly" \
  -F "position=Midfielder"

# Returns: {"status": "success", "video_id": "...", "video_url": "..."}
```

### 2. Trigger ML Analysis
```bash
curl -X POST http://192.168.1.5:8000/performance/ml-process \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "video_url": "cloudinary_url_from_above",
    "analysis_type": "overall"
  }'

# Your endpoint should return: {"status": "success", "job_id": "unique_id"}
```

### 3. Poll Results
```bash
curl -X GET http://192.168.1.5:8000/performance/ml-status/unique_id \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return analysis results
```

---

## Performance Optimization Tips

1. **Async Processing**: Use job_id pattern for long-running analyses
2. **Caching**: Cache results for same video across requests
3. **Batching**: Batch multiple videos for efficiency
4. **Queue**: Use message queue (Celery, RabbitMQ) for processing pipeline

---

## Contact Points

- **Performance Analysis**: See `backend/routers/performance.py` lines 95-122
- **Coaching Analysis**: See `backend/routers/coaching.py` lines 68-186
- **Injury Recovery**: See `backend/routers/injury.py` lines 47-77

**All marked with**: `# TODO: Integrate with ML service here`

---

## Expected Timeline

1. **Week 1**: Review integration points, understand data flow
2. **Week 2**: Implement ML service client/wrapper
3. **Week 3**: Update endpoints with real model calls
4. **Week 4**: Testing and refinement

Good luck! 🚀
