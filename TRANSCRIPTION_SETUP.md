# Auto-Transcription Setup Guide

## Overview
CampusStream now automatically generates transcriptions for uploaded videos using Google Cloud Speech-to-Text API and creates AI-powered summaries using Google's Gemini API.

## Prerequisites

1. **Google Cloud Platform Account** with:
   - Speech-to-Text API enabled
   - The same service account key file (`gcs-key.json`) used for Cloud Storage

2. **Gemini API Key** from Google AI Studio

## Installation Steps

### 1. Install Required Packages

Run the following command from the root directory:

```bash
npm install @google-cloud/speech @google/generative-ai fluent-ffmpeg
```

### 2. Install FFmpeg

FFmpeg is required for audio extraction from video files.

#### Windows:
1. Download FFmpeg from: https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to your system PATH
4. Restart your terminal/IDE

#### macOS:
```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install ffmpeg
```

Verify installation:
```bash
ffmpeg -version
```

### 3. Enable Speech-to-Text API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (campusstream)
3. Navigate to **APIs & Services** → **Library**
4. Search for "Cloud Speech-to-Text API"
5. Click **Enable**

### 4. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the API key
4. Add it to your `.env` file:

```env
GEMINI_API_KEY=your-actual-gemini-api-key-here
```

## How It Works

### 1. Upload Process
When a user uploads a video:
1. Video is uploaded to Google Cloud Storage
2. Video metadata is saved to MongoDB
3. **Background transcription process starts automatically**

### 2. Transcription Process
The transcription happens in the background:
1. Video is downloaded from GCS to a temporary file
2. Audio is extracted from the video using FFmpeg
3. Audio is transcribed using Google Speech-to-Text API
4. Transcript is saved to the database
5. Temporary files are cleaned up

### 3. Summary Generation
Once transcription is complete:
1. Transcript is sent to Gemini AI
2. AI generates a concise summary (3-5 sentences)
3. Summary is saved to the database

### 4. Display
- Transcript appears below the video description on the video page
- Summary is also displayed if available
- No manual upload needed - it's all automatic!

## Features

✅ **Automatic transcription** - No manual work required
✅ **AI-powered summaries** - Quick overview of video content  
✅ **Background processing** - Doesn't block video upload
✅ **Temporary file cleanup** - Automatically removes temp files
✅ **Error handling** - Gracefully handles failures
✅ **Searchable transcripts** - Can be indexed for search

## File Structure

```
backend/
├── utils/
│   ├── transcriptionService.js   # Main transcription service
│   └── videoProcessor.js          # Original placeholder (can be removed)
├── controllers/
│   └── video.controller.js        # Triggers background transcription
```

## Troubleshooting

### "FFmpeg not found"
- Make sure FFmpeg is installed and added to PATH
- Restart your terminal/IDE after installation

### "Speech-to-Text API not enabled"
- Enable the API in Google Cloud Console
- Wait a few minutes for activation

### "Invalid Gemini API key"
- Verify your API key in `.env` file
- Get a new key from Google AI Studio if needed

### Transcription not appearing
- Check server logs for errors
- Transcription runs in background, may take 2-10 minutes
- Refresh the video page after a few minutes

### Large video files
- For videos > 1 hour, transcription uses long-running recognition
- This may take 10-30 minutes depending on video length

## Cost Considerations

### Google Speech-to-Text API
- **Free tier**: 60 minutes/month
- **After free tier**: $0.006 per 15 seconds (~$1.44 per hour)

### Gemini API
- **Free tier**: 60 requests/minute
- Check [Google AI pricing](https://ai.google.dev/pricing) for updates

### Tips to Reduce Costs
- Videos are only transcribed once (on upload)
- Transcripts are stored in database
- Consider setting a maximum video length limit
- Monitor usage in Google Cloud Console

## Testing

To test the transcription:
1. Upload a short video (1-2 minutes)
2. Check server logs for transcription progress
3. Wait 2-5 minutes
4. Refresh the video page
5. Transcript should appear below description

## Future Enhancements

- [ ] Transcript timestamps for video seeking
- [ ] Multi-language support
- [ ] Speaker diarization (identify different speakers)
- [ ] Keyword extraction
- [ ] Auto-generated captions/subtitles (SRT files)
- [ ] Retry failed transcriptions
- [ ] Progress indicator on video page

## Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify all environment variables are set
3. Ensure APIs are enabled in Google Cloud Console
4. Check that FFmpeg is properly installed
