# Login/Signup Troubleshooting

## If you're still getting 400 errors:

### Step 1: Restart Backend
```bash
# In terminal with uvicorn running, press Ctrl+C
# Then restart:
cd social-backend
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### Step 2: Verify Backend is Running
- Open browser: `http://192.168.1.5:8000/docs`
- You should see Swagger API docs
- Click "Try it out" on `/auth/login` endpoint
- Test with credentials:
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```

### Step 3: Check MongoDB Connection
- Ensure MongoDB is running
- Verify connection string in `backend/db.py`
- Check users collection exists: `db.users`

### Step 4: Clear App Cache
In Expo:
1. Press `w` in terminal to open web version
2. Or close and fully restart Android emulator
3. This clears cached API responses

---

## Common Login Errors & Solutions

### ❌ "User not found"
- User doesn't exist in database
- **Solution**: Create account via signup screen first

### ❌ "Incorrect password"
- Password doesn't match stored hash
- **Solution**: Check caps lock, verify password spelling

### ❌ "Request failed with status code 400"
- Generic 400 error from backend
- **Check**: Backend logs for specific error message
- **Solution**: Restart backend and try again

### ❌ "Request failed with status code 500"
- Server error
- **Check**: Backend console for stack trace
- **Solution**: 
  1. Verify MongoDB is running
  2. Check backend logs for specific error
  3. Restart backend

### ❌ "Network Error"
- Can't reach backend server
- **Solutions**:
  1. Verify backend is running on `192.168.1.5:8000`
  2. Check your IP address (ensure it matches in code)
  3. Verify phone/emulator is on same network as backend
  4. Try `http://localhost:8000` instead if on same machine

---

## Test Credentials (After First Signup)

Once you create an account, use those credentials to login.

**Example**:
- Email: `john@example.com`
- Password: `Password123`

---

## Manual Test with Backend

### Create User via Backend API
```bash
curl -X POST http://192.168.1.5:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser",
    "full_name": "Test User"
  }'
```

### Login via Backend API
```bash
curl -X POST http://192.168.1.5:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Response should include:
```json
{
  "status": "success",
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user_id": "...",
  "name": "Test User"
}
```

---

## Clear AsyncStorage (If Token Stuck)

In your app, open Chrome DevTools for Emulator:
1. In emulator: Open Chrome
2. Go to `chrome://inspect`
3. Find your app process
4. Open DevTools
5. Go to Application tab
6. Clear all storage

Or reset emulator:
```bash
emulator -avd YourAVDName -wipe-data
```

---

## Logs to Check

### Frontend Logs (Expo)
- Watch for "Login error:" messages
- Should show exact error from backend

### Backend Logs
- Should print "LOGIN HIT: {email}"
- If not printed, backend might not be receiving request

### Network Logs
- Open Chrome DevTools for Emulator
- Go to Network tab
- Look for POST to `/auth/login`
- Check response status and body

---

## Quick Checklist

- [ ] Backend running on correct IP (192.168.1.5:8000)
- [ ] MongoDB running
- [ ] Swagger docs accessible
- [ ] Can create user via signup endpoint
- [ ] Can login with created credentials
- [ ] Token being stored in AsyncStorage
- [ ] No CORS errors in console
- [ ] Frontend IP matches backend IP

---

If still stuck, check:
1. Backend console output
2. Frontend error messages
3. Network tab in DevTools
4. Swagger API test endpoint
