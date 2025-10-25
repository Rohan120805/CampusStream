# 🔐 Authentication Testing Guide

## ✅ How to Verify Authentication is Working

### Step 1: Check Both Servers are Running

**Backend (Port 5000):**
```
✅ MongoDB connected successfully
⚠️  Google Cloud Storage not configured. File uploads will not work.
✅ Server running on port 5000
```

**Frontend (Port 3000):**
```
Compiled successfully!
webpack compiled with 0 errors
```

### Step 2: Test Landing Page (Before Login)

1. Open browser: `http://localhost:3000`
2. You should see:
   - ✨ Animated sparkles background
   - 🎯 "CampusStream" logo with gradient
   - 📊 Stats (1000+ Videos, 50+ Subjects, 5000+ Students)
   - 🔐 Big "Login with Auth0" button
   - ✅ "Secured by Auth0" message at bottom

### Step 3: Test Authentication Flow

1. **Click "Login with Auth0" button**
2. You'll be redirected to Auth0 login page
3. **Sign in with your Auth0 credentials:**
   - Email/password OR
   - Google/GitHub/other providers

4. **After successful login:**
   - You'll be redirected back to `http://localhost:3000/home`
   - The URL will briefly show Auth0 callback parameters

### Step 4: Verify Home Page (After Login)

You should see:

**✅ Authentication Status Card (Top):**
- Your profile picture
- "Welcome back, [Your Name]! 👋"
- Your email address
- Green "Authenticated" badge
- Blue "Token: ✅ Active" status
- Your Auth0 ID (truncated)

**✅ Browser Console (F12):**
```
✅ Auth0 token obtained and stored
```

**✅ LocalStorage:**
- Open DevTools → Application → Local Storage → `http://localhost:3000`
- You should see: `auth0_token` with a JWT value

**✅ Navigation Bar:**
- "Home", "Playlists", "Upload" links
- Your profile picture (clickable)
- "Logout" button

### Step 5: Test Protected Routes

Try clicking these navbar links:
- **Home** → Should work (shows videos or "No videos yet")
- **Playlists** → Should work (shows "Playlists coming soon...")
- **Upload** → Should work (shows "Upload functionality coming soon...")
- **Profile Picture** → Should navigate to `/profile` showing your Auth0 info

### Step 6: Test Logout

1. Click the **"Logout"** button in navbar
2. You should be redirected to Landing Page
3. Try accessing `/home` directly → Should redirect to `/`

---

## 🐛 Troubleshooting

### Issue: "Configuration Error"
**Solution:** Check frontend `.env` file has correct Auth0 credentials

### Issue: Authentication loop/redirect issues
**Solution:** 
1. Check Auth0 Dashboard → Applications → Settings
2. Verify "Allowed Callback URLs" includes: `http://localhost:3000`
3. Verify "Allowed Logout URLs" includes: `http://localhost:3000`

### Issue: Backend 401 errors
**Solution:**
1. Check backend `.env` has correct Auth0 domain and audience
2. Restart backend server
3. Clear browser localStorage and re-login

### Issue: Token not appearing
**Solution:**
1. Open browser console (F12)
2. Look for any Auth0 errors
3. Try logout and login again

---

## 📋 Authentication Checklist

- [ ] Landing page loads with Auth0 login button
- [ ] Clicking login redirects to Auth0
- [ ] Can successfully log in with credentials
- [ ] Redirected to `/home` after login
- [ ] See welcome message with name and email
- [ ] See "Token: ✅ Active" status
- [ ] Console shows "✅ Auth0 token obtained"
- [ ] LocalStorage contains `auth0_token`
- [ ] Can access all protected routes (Home, Playlists, Upload, Profile)
- [ ] Profile page shows Auth0 user info
- [ ] Logout button works and redirects to landing page
- [ ] Cannot access `/home` after logout without logging in again

---

## 🎉 Success Indicators

If you see ALL of these, authentication is working perfectly:

1. ✅ Green "Authenticated" badge on home page
2. ✅ "Token: ✅ Active" message
3. ✅ Your name and email displayed correctly
4. ✅ Profile picture showing in navbar
5. ✅ Can navigate to all protected routes
6. ✅ Logout works and requires re-login

---

## 📸 What You Should See

### Landing Page:
- Large animated hero section
- "🔐 Login with Auth0" button (prominent)
- Sparkle effects in background
- Features grid with gradient cards

### Home Page (After Login):
- **Top Card:** Your profile with green "Authenticated" badge
- **Main Content:** Either videos grid OR "No Videos Yet" message
- **Navbar:** Your picture + Logout button
- **Status:** "Token: ✅ Active" in green/blue

### Browser Console:
```
✅ Auth0 token obtained and stored
✅ Google Cloud Storage initialized (or warning if not configured)
```

---

## 🔑 Important Files to Check

1. **Frontend `.env`**
   ```
   REACT_APP_AUTH0_DOMAIN=campusstreamklh.jp.auth0.com
   REACT_APP_AUTH0_CLIENT_ID=Gnf4N0PVZ3u0HLHD0AENm3W0pEJzIYb5
   REACT_APP_AUTH0_AUDIENCE=https://campusstream-api
   ```

2. **Backend `.env`**
   ```
   AUTH0_DOMAIN=campusstreamklh.jp.auth0.com
   AUTH0_AUDIENCE=https://campusstream-api
   AUTH0_ISSUER=https://campusstreamklh.jp.auth0.com/
   ```

3. **Auth0 Dashboard Settings**
   - Allowed Callback URLs: `http://localhost:3000`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`

---

## 🎯 Quick Test

1. Start backend: `npm start` (in root directory)
2. Start frontend: `npm start` (in frontend directory)
3. Open: `http://localhost:3000`
4. Click: "🔐 Login with Auth0"
5. Login with your credentials
6. Look for: Green "Authenticated" badge and your name
7. Check console: Should see "✅ Auth0 token obtained and stored"

If all above works → **Authentication is working perfectly! 🎉**
