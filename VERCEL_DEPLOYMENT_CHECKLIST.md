# Vercel Deployment Checklist

## Pre-Deployment Steps

### 1. Auth0 Configuration
- [ ] Add your Vercel domain to Auth0 Allowed Callback URLs
  - Format: `https://your-app.vercel.app`
- [ ] Add your Vercel domain to Auth0 Allowed Logout URLs
  - Format: `https://your-app.vercel.app`
- [ ] Add your Vercel domain to Auth0 Allowed Web Origins
  - Format: `https://your-app.vercel.app`
- [ ] Verify Auth0 API settings have correct identifier (audience)

### 2. MongoDB Atlas Configuration
- [ ] Whitelist all IPs (0.0.0.0/0) in Network Access for serverless functions
- [ ] Or add Vercel's IP ranges to Network Access
- [ ] Verify connection string is correct

### 3. Google Cloud Storage Configuration
- [ ] Verify GCS bucket exists and is accessible
- [ ] Check bucket permissions (should allow public read if videos are public)
- [ ] Configure CORS settings on bucket:
  ```json
  [
    {
      "origin": ["https://your-app.vercel.app"],
      "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
      "responseHeader": ["Content-Type"],
      "maxAgeSeconds": 3600
    }
  ]
  ```
- [ ] Get service account key JSON ready for GCS_CREDENTIALS

### 4. Environment Variables in Vercel
Go to your Vercel project → Settings → Environment Variables

#### Backend Variables:
- [ ] `MONGO_URI` - Your MongoDB connection string
- [ ] `AUTH0_DOMAIN` - Your Auth0 domain
- [ ] `AUTH0_AUDIENCE` - Your Auth0 API identifier
- [ ] `AUTH0_ISSUER` - Your Auth0 issuer URL
- [ ] `GCS_PROJECT_ID` - Your GCS project ID
- [ ] `GCS_BUCKET_NAME` - Your GCS bucket name
- [ ] `GCS_CREDENTIALS` - Your service account JSON (as string)
- [ ] `GOOGLE_AI_API_KEY` - Your Google AI API key
- [ ] `FRONTEND_URL` - Your Vercel app URL (e.g., https://your-app.vercel.app)
- [ ] `NODE_ENV` - Set to `production`

#### Frontend Variables:
- [ ] `REACT_APP_AUTH0_DOMAIN` - Your Auth0 domain
- [ ] `REACT_APP_AUTH0_CLIENT_ID` - Your Auth0 client ID
- [ ] `REACT_APP_AUTH0_AUDIENCE` - Your Auth0 API identifier
- [ ] `REACT_APP_AUTH0_REDIRECT_URI` - Your Vercel app URL
- [ ] `REACT_APP_API_URL` - Set to `/api` (or leave unset)

## Deployment Steps

### Option 1: Deploy via GitHub (Recommended)
1. [ ] Push your code to GitHub repository
2. [ ] Connect repository to Vercel
3. [ ] Vercel will auto-deploy on push

### Option 2: Deploy via Vercel CLI
1. [ ] Install Vercel CLI: `npm install -g vercel`
2. [ ] Login: `vercel login`
3. [ ] Deploy: `vercel --prod`

## Post-Deployment Verification

### 1. Check Deployment Status
- [ ] Visit Vercel dashboard to ensure deployment succeeded
- [ ] Check build logs for any errors
- [ ] Verify all functions deployed correctly

### 2. Test Backend API
- [ ] Visit `https://your-app.vercel.app/health`
- [ ] Should return: `{"status":"OK","message":"Server is running"}`

### 3. Test Frontend
- [ ] Visit `https://your-app.vercel.app`
- [ ] Landing page should load correctly

### 4. Test Authentication
- [ ] Click "Login" button
- [ ] Should redirect to Auth0
- [ ] After login, should redirect back to app
- [ ] Should see user profile in navbar

### 5. Test Core Features
- [ ] Upload a video (if you have credits/storage)
- [ ] View uploaded videos
- [ ] Create a playlist
- [ ] Add comments
- [ ] Test AI chatbot
- [ ] Test video playback

## Troubleshooting Common Issues

### Issue: "Configuration Error" on frontend
**Solution:** Check that all REACT_APP_* environment variables are set in Vercel

### Issue: 401/403 errors on API calls
**Solution:** 
- Verify Auth0 configuration matches
- Check that JWT tokens are being sent correctly
- Verify AUTH0_AUDIENCE matches in both frontend and backend

### Issue: Video upload fails
**Solution:**
- Check GCS_CREDENTIALS is valid JSON
- Verify bucket name is correct
- Check bucket permissions

### Issue: Database connection fails
**Solution:**
- Verify MONGO_URI is correct
- Check MongoDB Atlas Network Access allows Vercel IPs
- Test connection string locally first

### Issue: CORS errors
**Solution:**
- Check FRONTEND_URL in backend environment variables
- Verify GCS bucket CORS settings
- Check Auth0 allowed origins

## Quick Fix Commands

If you need to redeploy after fixing issues:

```bash
# Redeploy with latest changes
vercel --prod

# Check logs
vercel logs

# View environment variables
vercel env ls
```

## Success Indicators

✅ Deployment status shows "Ready"
✅ Health endpoint returns 200 OK
✅ Landing page loads without errors
✅ Auth0 login/logout works
✅ Can navigate between pages
✅ API calls succeed (check browser console)
✅ Videos can be uploaded and played

## Need Help?

- Check Vercel deployment logs
- Check browser console for frontend errors
- Check Auth0 logs for authentication issues
- Verify all environment variables are set correctly
- Test each component individually
