# Complete Endpoint Reference

## Authentication (auth.py)
```
POST   /auth/register              → User registration
POST   /auth/login                 → User login, returns JWT token
POST   /auth/logout                → User logout
GET    /auth/me                    → Get current user
PUT    /auth/change-password       → Change password
POST   /auth/refresh-token         → Refresh JWT token
```

---

## Performance Analysis (performance.py)
```
POST   /performance/upload         → Upload video to Cloudinary
       Input: FormData with video, match_type, position
       Returns: {status, video_id, video_url}

GET    /performance/analysis/{video_id}
       Returns: {status, analysis_results} with metrics
       TODO: Integrate with ML team for actual analysis

POST   /performance/player-card
       Input: {analysis_id}
       Returns: Shareable player card object

GET    /performance/user
       Returns: User's all videos and analyses

POST   /performance/ml-process
       Input: {video_url, analysis_type}
       Returns: {status, job_id}
       TODO: ML team submits to their service

GET    /performance/ml-status/{job_id}
       Returns: {job_id, status, results}
       TODO: ML team polls their service
```

---

## Wellness Tracking (wellness.py)
```
POST   /wellness/log
       Input: {water, sleep, calories, date}
       Returns: {status, message}

GET    /wellness/today
       Returns: Today's metrics or empty

GET    /wellness/history?days=7
       Returns: Historical data with averages

GET    /wellness/recommendations
       Returns: AI recommendations based on data
       TODO: Integrate with ML for personalized advice

GET    /wellness/weekly-progress
       Returns: 7-day averages

GET    /wellness/streak
       Returns: Consecutive logging days
```

---

## AI Coaching (coaching.py)
```
GET    /coaching/plan
       Returns: 4-day training plan
       TODO: ML team integrates training plan generation

GET    /coaching/position
       Returns: {position, confidence, reasoning}
       TODO: ML team integrates position analysis

GET    /coaching/strengths
       Returns: {strengths} with percentages
       TODO: ML team integrates strength detection

GET    /coaching/weaknesses
       Returns: {improvements} with targets
       TODO: ML team integrates weakness analysis

GET    /coaching/training-plan
       Returns: 5-session weekly plan

GET    /coaching/motivation
       Returns: {motivation, metric, improvement}
       TODO: Optional - integrate GPT for motivation

POST   /coaching/save-achievement
       Input: {title, description, icon}
       Returns: {status, message}

GET    /coaching/history
       Returns: Past coaching records
```

---

## Injury & Recovery (injury.py)
```
POST   /injury/log
       Input: {injury_type, pain_level, recovery_stage, date}
       Returns: {status, injury_id}

GET    /injury/recovery-plan/{injury_id}
       Returns: {dos, donts, exercises, timeline}
       TODO: ML team integrates medical AI

GET    /injury/exercises?injury_type=...
       Returns: {exercises} with details

GET    /injury/timeline/{injury_id}
       Returns: {milestones, duration, progress}

PUT    /injury/progress/{injury_id}
       Input: {pain_level, notes, completed_exercises}
       Returns: {status, message}

GET    /injury/history
       Returns: All past injuries

GET    /injury/active
       Returns: Current active injuries

PUT    /injury/resolve/{injury_id}
       Returns: {status, message}
```

---

## Matches (matches.py)
```
POST   /matches/create
       Input: {title, date, time, location, match_type, max_players}
       Returns: {status, match_id}

GET    /matches/all?filter=all|upcoming|completed
       Returns: {count, matches}

GET    /matches/{match_id}
       Returns: Detailed match info

POST   /matches/{match_id}/join
       Returns: {status, message}

POST   /matches/{match_id}/leave
       Returns: {status, message}

GET    /matches/{match_id}/participants
       Returns: {count, participants}

POST   /matches/{match_id}/video
       Input: FormData with video
       Returns: {status, message}

PUT    /matches/{match_id}/score
       Input: {score, status, end_time}
       Returns: {status, message}

GET    /matches/history/user
       Returns: User's match history

DELETE /matches/{match_id}
       Returns: {status, message}
```

---

## Social Features (posts.py & users.py)
```
POST   /posts/create
       → Create social post

GET    /posts/feed?page=1
       → Get feed posts

POST   /posts/{post_id}/like
       → Like a post

POST   /posts/{post_id}/comment
       → Add comment to post

GET    /users/{user_id}
       → Get user profile

POST   /users/{user_id}/follow
       → Follow user

GET    /users/leaderboard
       → Get leaderboard rankings

PUT    /users/profile
       → Update profile info
```

---

## Request/Response Format

### All requests require:
```
Header: Authorization: Bearer {jwt_token}
Header: Content-Type: application/json (or multipart/form-data for file uploads)
```

### All responses follow:
```json
{
  "status": "success" | "error",
  "message": "Human readable message",
  "data": { /* endpoint specific data */ }
}
```

---

## Error Codes

```
200  OK              - Request succeeded
201  Created         - Resource created
400  Bad Request     - Invalid input
401  Unauthorized    - Missing/invalid token
403  Forbidden       - User doesn't have permission
404  Not Found       - Resource not found
500  Server Error    - Backend issue
```

---

## Frontend to Backend Mapping

| Frontend Module | API File | Backend Router | Status |
|---|---|---|---|
| Performance | api/performance.ts | performance.py | ✅ Connected |
| Wellness | api/wellness.ts | wellness.py | ✅ Connected |
| AI Coach | api/coaching.ts | coaching.py | ✅ Connected |
| Injury | api/injury.ts | injury.py | ✅ Connected |
| Matches | api/matches.ts | matches.py | ✅ Connected |
| Social Posts | api/posts.ts | posts.py | ✅ Connected |
| Profile | api/users.ts | users.py | ✅ Connected |

---

## Database Collections

| Collection | Purpose | Indexed Fields |
|---|---|---|
| users | User accounts | email, username |
| performance_videos | Uploaded match videos | user_id, created_at |
| wellness_logs | Daily health metrics | user_id, date |
| injuries | Injury records | user_id, status |
| matches | Match scheduling | organizer_id, date |
| posts | Social feed | user_id, created_at |
| achievements | User achievements | user_id, unlocked_at |

---

## Quick Test Commands

### Get Token
```bash
curl -X POST http://192.168.1.5:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

### Log Wellness Data
```bash
curl -X POST http://192.168.1.5:8000/wellness/log \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"water": 2.5, "sleep": 8, "calories": 2500}'
```

### Get Coaching Plan
```bash
curl -X GET http://192.168.1.5:8000/coaching/plan \
  -H "Authorization: Bearer TOKEN"
```

### Create Match
```bash
curl -X POST http://192.168.1.5:8000/matches/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Weekend Game",
    "date": "2024-01-20",
    "time": "15:00",
    "location": "Central Park",
    "match_type": "friendly"
  }'
```

---

## Environment Variables Needed

### Backend (.env)
```
DATABASE_URL=mongodb://localhost:27017/football_social
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_secret_key_change_this
JWT_ALGORITHM=HS256
```

### Frontend (.env)
```
EXPO_PUBLIC_API_URL=http://192.168.1.5:8000
```

---

## ML Integration Checklist

- [ ] Review all TODO comments in backend routers
- [ ] Implement ML service client class
- [ ] Update performance.py ml-process endpoint
- [ ] Update performance.py ml-status endpoint
- [ ] Update coaching.py position endpoint
- [ ] Update coaching.py strengths endpoint
- [ ] Update coaching.py weaknesses endpoint
- [ ] Update injury.py recovery-plan endpoint
- [ ] Test all endpoints with real ML models
- [ ] Load test with production videos
- [ ] Monitor error rates and latency

---

Last Updated: 2024-01-01
API Version: 1.0
