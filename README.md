# CampusStream - Now 100% FREE! 🎉

A comprehensive educational video streaming platform with AI-powered features, using **completely FREE services** - no credit card required!

## 🌟 What Changed?

**Replaced Google Cloud (paid) with free alternatives:**
- ❌ Google Cloud Storage → ✅ **Cloudinary** (25GB free storage)
- ❌ Google Speech-to-Text → ✅ **Manual transcription** (optional)
- ❌ Google Video Intelligence → ✅ Removed (optional feature)
- ✅ **Kept Gemini AI** (1500 free requests/day for chatbot & quizzes)

## 💰 Cost Breakdown (All FREE!)

| Service | Free Tier | Usage |
|---------|-----------|-------|
| **Cloudinary** | 25GB storage + 25GB bandwidth/month | Videos, thumbnails, documents |
| **Gemini AI** | 1500 requests/day | Chatbot, quizzes, summaries |
| **MongoDB Atlas** | 512MB storage | User data, videos metadata |
| **Vercel** | 100GB bandwidth | Hosting frontend + API |
| **Auth0** | 7,000 active users | Authentication |

**Total Monthly Cost: $0** ✨

## 🚀 Quick Setup (3 Steps)

### 1. Install Dependencies
```bash
npm install
cd frontend && npm install
```

### 2. Get Your FREE API Keys

#### Cloudinary (Video/File Storage)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Dashboard → Copy: Cloud Name, API Key, API Secret

#### Gemini AI (Chatbot/Quizzes)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API Key → Copy it

#### MongoDB Atlas
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster → Get connection string

#### Auth0 (Authentication)
1. Sign up at [auth0.com](https://auth0.com)
2. Create SPA application → Get Domain, Client ID, Audience

### 3. Configure Environment

Create `.env` in root:
```env
MONGO_URI=your_mongodb_connection_string
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-auth0-api-identifier
AUTH0_ISSUER=https://your-domain.auth0.com/
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:3000
PORT=5000
```

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=your-auth0-api-identifier
```

### 4. Run Application
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend  
cd frontend && npm start
```

Visit **http://localhost:3000** 🎉

## 📋 Features

### Video Management
- ✅ Upload videos (up to 100MB recommended on free tier)
- ✅ Custom thumbnail upload
- ✅ Organize by subject, year (1st-4th), semester, unit (CO1-CO5)
- ✅ **Manual transcript upload** (.txt files)
- ✅ Document attachments (PDF, PPT, DOCX)
- ✅ My Videos dashboard
- ✅ Related video suggestions

### AI-Powered Features (Gemini AI - FREE)
- ✅ **AI Chatbot** - Ask questions about video content
- ✅ **Quiz Generation** - Auto-generate quizzes from transcripts
- ✅ **Smart Summaries** - Get lecture summaries
- ✅ Context-aware responses (uses transcripts, descriptions, topics)

### Interactive Learning
- ✅ Timestamped video notes
- ✅ Comments system
- ✅ Bookmarks
- ✅ Watch Later queue
- ✅ Custom playlists

### User Features
- ✅ User profiles with activity tracking
- ✅ Secure Auth0 authentication
- ✅ Social sharing

### Content Organization
- ✅ Subject-based classification
- ✅ Unit-based learning (CO1-CO5)
- ✅ Tag system
- ✅ Advanced search & filters

## 🏗️ Tech Stack

### Frontend
- React 18 + TypeScript
- TailwindCSS + Framer Motion
- TanStack Query
- Auth0 React SDK

### Backend
- Node.js + Express
- MongoDB + Mongoose
- **Cloudinary** (video/file storage) ✨ NEW
- **Google Gemini AI** (chatbot/quizzes)
- Auth0 + JWT
- Multer

### Deployment (All FREE)
- Vercel (hosting)
- MongoDB Atlas (database)
- Cloudinary (storage)

## 🎯 What Works Without Google Cloud?

✅ **Working:**
- Video uploads (Cloudinary)
- All file uploads
- Video streaming
- AI chatbot (Gemini)
- Quiz generation
- All user features

❌ **Removed:**
- Automatic video transcription
  - **Solution:** Upload .txt transcript files manually

## 📦 Deployment

### Deploy to Vercel

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy:

```bash
npm run deploy
```

3. Configure environment variables in Vercel dashboard:
   - Add all environment variables from `.env` files
   - Ensure `GCS_KEY_FILE` content is added as a secret

### Vercel Configuration

The project includes a `vercel.json` configuration file that handles:
- Static frontend deployment
- Serverless backend API functions
- Proper routing between frontend and backend

## 🗂️ Project Structure

```
CampusStream/
├── backend/               # Backend server code
│   ├── config/           # Configuration files (DB, Auth0, GCS)
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware (auth, upload)
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   └── utils/           # Utility functions
├── frontend/            # React frontend
│   ├── public/         # Static assets
│   └── src/
│       ├── components/ # React components
│       ├── pages/      # Page components
│       ├── services/   # API service functions
│       ├── types/      # TypeScript type definitions
│       └── lib/        # Utility libraries
├── api/                # Vercel serverless functions
├── gcs-key.json        # Google Cloud service account key
└── vercel.json         # Vercel deployment configuration
```

## 🔧 Configuration Details

### Video Upload Limits
- Configured in Multer middleware
- Default: 500MB per video file
- Supports multiple file uploads (video, thumbnail, documents)

### Supported Video Formats
- MP4
- AVI
- MOV
- WebM
- And other formats supported by FFmpeg

### Database Schema
- **Users**: User profiles and authentication data
- **Videos**: Video metadata, URLs, transcriptions
- **Playlists**: User-created playlists
- **Comments**: Video comments with user references
- **Notes**: Timestamped video notes

## 🔒 Security Features

- JWT-based authentication with Auth0
- Protected API routes with middleware
- CORS configuration for allowed origins
- Secure file upload handling
- Environment variable protection

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Videos
- `GET /api/videos` - Get all videos
- `GET /api/videos/:id` - Get single video
- `POST /api/videos` - Upload video
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video
- `POST /api/videos/:id/view` - Increment view count

### Playlists
- `GET /api/playlists` - Get user playlists
- `GET /api/playlists/:id` - Get single playlist
- `POST /api/playlists` - Create playlist
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:id/videos` - Add video to playlist

### Comments
- `GET /api/comments/:videoId` - Get video comments
- `POST /api/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment

### Notes
- `GET /api/notes/:videoId` - Get video notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### AI
- `POST /api/ai/chat` - Chat with AI about video content
- `POST /api/ai/generate-summary` - Generate video summary

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/bookmark/:videoId` - Bookmark video
- `POST /api/users/watch-later/:videoId` - Add to watch later

## 🐛 Troubleshooting

### Common Issues

**Issue**: Videos not uploading
- Check GCS credentials and bucket permissions
- Verify file size limits in Multer configuration
- Check network connectivity

**Issue**: Authentication errors
- Verify Auth0 configuration
- Check if environment variables are correctly set
- Ensure callback URLs are configured in Auth0

**Issue**: Transcription not working
- Verify Google Cloud Speech-to-Text API is enabled
- Check service account permissions
- Ensure video format is supported

**Issue**: Database connection errors
- Verify MongoDB URI is correct
- Check MongoDB Atlas network access settings
- Ensure IP address is whitelisted

## 📄 License

This project is licensed under the ISC License.

## 👥 Support

For support, please open an issue in the repository or contact the development team.

## 🙏 Acknowledgments

- Auth0 for authentication services
- Google Cloud Platform for storage and AI services
- Vercel for hosting
- The open-source community for amazing tools and libraries

---

**Note**: Remember to never commit sensitive information like API keys or credentials to version control. Always use environment variables and keep your `.env` files in `.gitignore`.
