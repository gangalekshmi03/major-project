# Football Social Platform - API Integration Guide

## Overview
Your frontend (React Native/Expo) is now fully connected to your FastAPI backend with all endpoints properly configured. The backend is ready for:
- Video uploads to Cloudinary
- Data storage in MongoDB
- ML model integration by your team

---

## Backend Running

**Backend IP**: `http://192.168.1.5:8000`  
**Auto-Auth**: JWT tokens are automatically injected into all requests via axios interceptor in [api/client.ts](api/client.ts)

To start the backend:
```bash
cd social-backend
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

**Test Backend**: Visit `http://192.168.1.5:8000/docs` for interactive Swagger UI

---

## Module Architecture

### 1️⃣ Performance Analysis Module
**Files**:
- Frontend: [app/(modules)/performance/index.tsx](app/(modules)/performance/index.tsx)
- API: [api/performance.ts](api/performance.ts)
- Backend: [backend/routers/performance.py](backend/routers/performance.py)

**Flow**:
1. User selects video → `uploadPerformanceVideo()` → Backend uploads to Cloudinary
2. Backend returns `video_id` 
3. User gets analysis → `getAnalysisResults(video_id)`
4. Backend queries ML service → Returns metrics (speed, distance, passes, etc.)

**ML Integration Points** (TODO):
```python
# In backend/routers/performance.py:24-28
# TODO: Integrate with ML service here
# Example: 
# job_id = ml_service.submit_video(video_url)
# results = ml_service.get_results(job_id)
```

**Expected Output Format**:
```json
{
  "status": "success",
  "analysis_results": {
    "speed": {"max": "8.2 m/s", "avg": "5.4 m/s"},
    "distance": "4.3 km",
    "sprints": 24,
    "passes": {"total": 45, "successful": 41, "accuracy": "91%"},
    "shots": {"total": 3, "onTarget": 1}
  }
}
```

---

### 2️⃣ Wellness Tracking Module
**Files**:
- Frontend: [app/(modules)/wellness/index.tsx](app/(modules)/wellness/index.tsx)
- API: [api/wellness.ts](api/wellness.ts)
- Backend: [backend/routers/wellness.py](backend/routers/wellness.py)

**Flow**:
1. User logs metrics → `logWellnessData({water, sleep, calories})` 
2. Backend saves to MongoDB with timestamp
3. User views history → `getWellnessHistory(days=7)`
4. Backend returns aggregated data with recommendations

**Endpoints**:
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/wellness/log` | Log water/sleep/calories |
| GET | `/wellness/today` | Today's metrics |
| GET | `/wellness/history?days=7` | Historical data |
| GET | `/wellness/recommendations` | AI recommendations |
| GET | `/wellness/weekly-progress` | 7-day averages |
| GET | `/wellness/streak` | Consecutive logging days |

---

### 3️⃣ AI Coach Module
**Files**:
- Frontend: [app/(modules)/ai-coach/index.tsx](app/(modules)/ai-coach/index.tsx)
- API: [api/coaching.ts](api/coaching.ts)
- Backend: [backend/routers/coaching.py](backend/routers/coaching.py)

**Flow**:
1. User views coaching screen
2. Frontend calls endpoints to get personalized insights:
   - Position recommendation
   - Strengths analysis
   - Weaknesses/improvements
   - Weekly training plan
   - Motivational insights

**ML Integration Points** (TODO):
```python
# In backend/routers/coaching.py:88, 110, 132, 155
# TODO: Integrate with ML team's models for:
# - Position analysis based on performance videos
# - Strength detection
# - Weakness identification
# - Training plan generation
```

---

### 4️⃣ Injury & Recovery Module
**Files**:
- Frontend: [app/(modules)/injury/index.tsx](app/(modules)/injury/index.tsx)
- API: [api/injury.ts](api/injury.ts)
- Backend: [backend/routers/injury.py](backend/routers/injury.py)

**Flow**:
1. User logs injury → `logInjury({injury_type, pain_level, recovery_stage})`
2. Backend saves to MongoDB
3. User gets recovery plan → `getRecoveryPlan(injury_id)`
4. Backend returns exercises, dos/donts, timeline

**Endpoints**:
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/injury/log` | Log new injury |
| GET | `/injury/recovery-plan/{id}` | Recovery plan & exercises |
| GET | `/injury/exercises` | Rehab exercises |
| GET | `/injury/timeline/{id}` | Recovery timeline |
| PUT | `/injury/progress/{id}` | Update recovery progress |
| GET | `/injury/history` | Past injuries |
| GET | `/injury/active` | Current active injuries |
| PUT | `/injury/resolve/{id}` | Mark as healed |

---

### 5️⃣ Matches Module
**Files**:
- Frontend: [app/(tabs)/matches.tsx](app/(tabs)/matches.tsx)
- API: [api/matches.ts](api/matches.ts)
- Backend: [backend/routers/matches.py](backend/routers/matches.py)

**Flow**:
1. User creates/joins matches → `createMatch()`, `joinMatch()`
2. Backend stores match data in MongoDB
3. User can upload video of completed match
4. Video sent to Performance Analysis for processing

**Endpoints**:
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/matches/create` | Create new match |
| GET | `/matches/all` | Get all matches (filterable) |
| GET | `/matches/{id}` | Match details |
| POST | `/matches/{id}/join` | RSVP to match |
| POST | `/matches/{id}/leave` | Cancel RSVP |
| GET | `/matches/{id}/participants` | Participants list |
| POST | `/matches/{id}/video` | Upload match video |
| PUT | `/matches/{id}/score` | Update score |
| GET | `/matches/history/user` | User's match history |
| DELETE | `/matches/{id}` | Delete match |

---

## ML Team Integration Guide

### For Your ML Engineers:

**1. Video Analysis Endpoint**
```python
# Replace in backend/routers/performance.py:95-108
@router.post("/ml-process")
def process_video_ml(data: dict):
    """ML team: Submit video to your model here"""
    video_url = data.get("video_url")
    analysis_type = data.get("analysis_type")
    
    # TODO: Call your ML model
    job_id = your_ml_service.submit_video(video_url, analysis_type)
    
    return {"status": "success", "job_id": job_id}
```

**2. Status Polling Endpoint**
```python
# Replace in backend/routers/performance.py:111-122
@router.get("/ml-status/{job_id}")
def check_ml_status(job_id: str):
    """Check processing status"""
    # TODO: Poll your ML service
    status = your_ml_service.get_status(job_id)
    results = your_ml_service.get_results(job_id) if status == "completed" else None
    
    return {
        "job_id": job_id,
        "status": status,  # "pending", "processing", "completed"
        "results": results
    }
```

**3. Expected Result Format** (must match frontend expectations):
```json
{
  "speed": {"max": "8.2 m/s", "avg": "5.4 m/s"},
  "distance": "4.3 km",
  "sprints": 24,
  "passes": {"total": 45, "successful": 41, "accuracy": "91%"},
  "shots": {"total": 3, "onTarget": 1},
  "position_recommendation": "Midfielder",
  "heatmap_url": "cloudinary_url_here"
}
```

---

## Database Schema

### MongoDB Collections

**Users Collection**
```json
{
  "_id": ObjectId,
  "username": "player123",
  "email": "player@example.com",
  "password_hash": "...",
  "created_at": "2024-01-01T00:00:00"
}
```

**Performance Videos Collection**
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "video_url": "cloudinary_url",
  "match_type": "friendly",
  "position": "Midfielder",
  "analysis_results": {...},
  "created_at": "2024-01-01T00:00:00"
}
```

**Wellness Collection**
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "date": "2024-01-01",
  "water": 2.5,
  "sleep": 8,
  "calories": 2500,
  "created_at": "2024-01-01T00:00:00"
}
```

**Injuries Collection**
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "injury_type": "Hamstring Strain",
  "pain_level": 7,
  "recovery_stage": "acute",
  "date_injured": "2024-01-01",
  "status": "active",
  "created_at": "2024-01-01T00:00:00"
}
```

**Matches Collection**
```json
{
  "_id": ObjectId,
  "organizer_id": ObjectId,
  "title": "Weekend Friendly",
  "date": "2024-01-15",
  "time": "15:00",
  "location": "Central Park",
  "match_type": "friendly",
  "participants": [ObjectId, ObjectId, ...],
  "status": "upcoming",
  "score": {"team_a": 0, "team_b": 0},
  "created_at": "2024-01-01T00:00:00"
}
```

---

## Testing

### 1. Test Authentication
```bash
# Get token
curl -X POST http://192.168.1.5:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass"
  }'

# Login
curl -X POST http://192.168.1.5:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass"
  }'
# Returns: {"access_token": "eyJ0eXAi...", "token_type": "bearer"}
```

### 2. Test Wellness Endpoint
```bash
curl -X POST http://192.168.1.5:8000/wellness/log \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "water": 2.5,
    "sleep": 8,
    "calories": 2500
  }'
```

### 3. Use Swagger UI
- Open: `http://192.168.1.5:8000/docs`
- Click "Authorize" and enter your Bearer token
- Test endpoints interactively

---

## Frontend Testing

### Test a Module Locally
```typescript
// In your React Native component
import { uploadPerformanceVideo } from "@/api/performance";

const testUpload = async () => {
  try {
    const result = await uploadPerformanceVideo("video_uri", {
      match_type: "friendly",
      position: "Midfielder"
    });
    console.log("Upload success:", result);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

---

## Troubleshooting

### Issue: CORS Error
**Solution**: Backend already has CORS enabled. Ensure backend is running on `192.168.1.5:8000`

### Issue: Video Upload Fails
**Solution**: Check Cloudinary credentials in backend config and ensure network connectivity

### Issue: MongoDB Connection Error
**Solution**: Verify MongoDB is running and connection string is correct in `backend/db.py`

### Issue: Token Expired
**Solution**: Frontend automatically refreshes token via AsyncStorage interceptor

---

## Deployment Checklist

- [ ] Backend running on production server
- [ ] MongoDB connection string updated
- [ ] Cloudinary API keys configured
- [ ] ML service endpoints provided by team
- [ ] JWT secret key changed from default
- [ ] CORS origins updated for production domains
- [ ] Environment variables set for Expo app
- [ ] Test all modules end-to-end

---

## Next Steps

1. **ML Integration**: Your ML team updates the TODO endpoints with actual model calls
2. **Testing**: Run end-to-end tests with real videos
3. **Refinement**: Based on user feedback, adjust response formats
4. **Deployment**: Deploy backend to cloud (AWS, GCP, etc.)
5. **Analytics**: Add logging and monitoring

---

**Questions?** Check the inline comments in each backend router file marked with `TODO: Integrate with ML service`
