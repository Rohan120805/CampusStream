# ✅ Automatic Transcription Setup Checklist

## Current Status
- ✅ Packages installed: `@google-cloud/speech`, `@google/generative-ai`, `fluent-ffmpeg`
- ✅ Backend code ready: Automatic transcription triggers on video upload
- ✅ Frontend updated: Shows transcription below video description
- ⚠️ Configuration needed: Follow steps below

---

## Required Steps (Do These Now)

### Step 1: Install FFmpeg on Your Computer

**Windows:**
1. Download FFmpeg: https://github.com/BtbN/FFmpeg-Builds/releases
2. Download the file: `ffmpeg-master-latest-win64-gpl.zip`
3. Extract to `C:\ffmpeg`
4. Add to PATH:
   - Press `Win + X` → System → Advanced system settings
   - Click "Environment Variables"
   - Under "System variables", find and edit "Path"
   - Click "New" and add: `C:\ffmpeg\bin`
   - Click OK on all windows
5. **Close and reopen your terminal**
6. Test it works: `ffmpeg -version`

---

### Step 2: Enable Speech-to-Text API in Google Cloud

1. Go to: https://console.cloud.google.com/
2. Select your project: **campusstream**
3. Go to: **APIs & Services** → **Library**
4. Search for: **"Cloud Speech-to-Text API"**
5. Click **ENABLE**
6. Wait 1-2 minutes for it to activate

**Your existing `gcs-key.json` will work for Speech-to-Text too!**

---

### Step 3: Get Gemini API Key (FREE)

1. Go to: https://makersuite.google.com/app/apikey
2. Click **"Create API Key"**
3. Select **"Create API key in new project"** (or use existing)
4. Copy the API key
5. Open your `.env` file
6. Replace `your-gemini-api-key` with your actual key:
   ```
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
7. Save the file

**Gemini is FREE** with generous limits: 60 requests/minute

---

### Step 4: Restart Your Backend Server

1. Stop the current backend server (Ctrl+C)
2. Restart it:
   ```bash
   cd c:\Users\rohan\OneDrive\Desktop\CampusStream
   node backend/server.js
   ```
3. You should see:
   ```
   ✅ Google Cloud Storage initialized
   🔧 Environment Configuration Check:
     AUTH0_DOMAIN: campusstreamklh.jp.auth0.com
     ...
   Server is running on http://localhost:5000
   ```

---

## How to Test It Works

### Option 1: Upload a NEW Video
1. Go to http://localhost:3000/upload
2. Upload a short video (1-2 minutes)
3. Wait for upload to complete
4. Check backend terminal - you should see:
   ```
   🎬 Starting background transcription process...
   📥 Downloading video from GCS...
   ✅ Audio extracted successfully
   🎤 Starting transcription...
   ✅ Transcript generated successfully
   ```
5. Wait 2-5 minutes
6. Refresh the video page
7. **Transcript should appear below the description!**

### Option 2: Check an EXISTING Video
**Note:** Videos uploaded BEFORE the server restart won't have transcripts automatically. They were uploaded before the transcription code was active.

---

## Troubleshooting

### "FFmpeg not found"
- Make sure FFmpeg is in your PATH
- Restart your terminal/VSCode after adding to PATH
- Test with: `ffmpeg -version`

### "Speech-to-Text API not enabled"
- Wait a few minutes after enabling in GCP Console
- Check the API is enabled at: https://console.cloud.google.com/apis/library

### "Invalid Gemini API key"
- Make sure you copied the full key (starts with `AIza...`)
- No spaces or quotes around the key in `.env`
- Check at: https://makersuite.google.com/app/apikey

### "Transcription not appearing"
- It runs in the BACKGROUND - takes 2-10 minutes
- Check backend logs for errors
- Only NEW videos (uploaded after server restart) get transcripts
- Refresh the video page after waiting

### "Background transcription failed"
Check backend logs for specific error:
- If it says "FFmpeg": Install FFmpeg
- If it says "API not enabled": Enable Speech-to-Text API
- If it says "quota": You might have hit free tier limits

---

## What Happens Automatically

When a user uploads a video:

1. ✅ Video uploads to Google Cloud Storage
2. ✅ Video metadata saves to MongoDB  
3. ✅ **Background process starts** (doesn't block upload)
4. 🔄 Video downloads to temp file
5. 🔄 Audio extracts using FFmpeg
6. 🔄 Audio transcribes using Google Speech-to-Text
7. 🔄 Summary generates using Gemini AI
8. ✅ Transcript & summary save to database
9. ✅ Temp files clean up
10. ✅ **Transcript displays on video page!**

**Duration:** 2-10 minutes depending on video length

---

## Quick Commands Reference

**Restart backend:**
```bash
cd c:\Users\rohan\OneDrive\Desktop\CampusStream
node backend/server.js
```

**Check FFmpeg:**
```bash
ffmpeg -version
```

**View backend logs:**
Watch the terminal where backend is running for transcription progress

---

## Cost Information

### Google Speech-to-Text
- **FREE**: First 60 minutes/month
- **After**: $0.006 per 15 seconds ($1.44/hour)
- Videos are only transcribed ONCE (on upload)

### Gemini API
- **FREE**: 60 requests/minute
- Plenty for a campus streaming platform

### Tips to Stay Free
- Short videos use less quota
- Each video transcribed only once
- Transcripts stored in database (no re-processing)

---

## Need Help?

If you're stuck on any step, let me know which step and I'll help you through it!

Ready to test? Follow Steps 1-4 above, then upload a new video! 🚀
