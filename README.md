# CampusStream

A comprehensive educational video streaming platform designed for campus use, allowing students and educators to upload, share, and collaborate on educational content with AI-powered features.

## 🌟 Features

### Video Management
- **Video Upload & Streaming**: Upload educational videos with support for large file sizes
- **Automatic Transcription**: AI-powered automatic transcription of video content using Google Cloud Speech-to-Text
- **Thumbnail Support**: Custom thumbnail upload or automatic generation
- **Video Organization**: Organize videos by subject, year (1st-4th year), semester, unit (CO1-CO5), and topics
- **My Videos**: Personal dashboard to manage your uploaded content
- **Related Videos**: Smart suggestions for related educational content

### AI-Powered Features
- **AI Chatbot**: Interactive chatbot powered by Google Gemini AI that can answer questions about video content
- **Context-Aware Responses**: AI has access to video transcriptions, descriptions, topics, and attached documents
- **Smart Search**: Find videos based on content, not just titles

### Interactive Learning
- **Video Notes**: Take timestamped notes while watching videos
- **Comments System**: Engage with the community through comments on videos
- **Bookmarks**: Save videos for quick access later
- **Watch Later**: Queue videos to watch at a later time
- **Playlists**: Create and manage custom playlists of videos

### User Features
- **User Profiles**: Personalized user profiles with activity tracking
- **Authentication**: Secure authentication powered by Auth0
- **Social Sharing**: Share videos with peers easily

### Content Organization
- **Subject-Based Classification**: Organize content by academic subjects
- **Unit-Based Learning**: Content organized by course outcomes (CO1-CO5)
- **Tag System**: Flexible tagging for better discoverability
- **Document Attachments**: Attach PDF and other documents to videos for supplementary materials

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **TanStack Query** for data fetching and state management
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Auth0 React SDK** for authentication
- **Axios** for API calls
- **Lucide React** for icons
- **React Markdown** for rendering markdown content

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose for database
- **Google Cloud Storage** for video and file storage
- **Google Cloud Speech-to-Text** for transcription
- **Google Cloud Video Intelligence** for video analysis
- **Google Gemini AI** for chatbot functionality
- **Auth0** for authentication and authorization
- **Multer** for file upload handling
- **FFmpeg** for video processing
- **JWT** for token management

### Deployment
- **Vercel** for hosting (serverless functions + static frontend)
- **MongoDB Atlas** for database hosting
- **Google Cloud Platform** for storage and AI services

## 📋 Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MongoDB** account (MongoDB Atlas recommended)
- **Google Cloud Platform** account with the following APIs enabled:
  - Cloud Storage API
  - Speech-to-Text API
  - Video Intelligence API
  - Gemini API (for AI features)
- **Auth0** account
- **Vercel** account (for deployment)

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CampusStream
```

### 2. Backend Setup

#### Install Dependencies

```bash
npm install
```

#### Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=your_mongodb_connection_string

# Auth0 Configuration
AUTH0_DOMAIN=your_auth0_domain
AUTH0_AUDIENCE=your_auth0_api_identifier
AUTH0_ISSUER=https://your_auth0_domain/
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret

# Google Cloud Storage Configuration
GCS_PROJECT_ID=your_gcs_project_id
GCS_BUCKET_NAME=your_gcs_bucket_name
GCS_KEY_FILE=gcs-key.json

# Google AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Vercel Configuration (for production)
VERCEL_URL=your_vercel_deployment_url
```

#### Setup Google Cloud Storage

1. Create a Google Cloud Project
2. Enable required APIs (Storage, Speech-to-Text, Video Intelligence)
3. Create a service account and download the JSON key file
4. Save the key file as `gcs-key.json` in the root directory
5. Create a Cloud Storage bucket for storing videos

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

#### Install Dependencies

```bash
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AUTH0_DOMAIN=your_auth0_domain
REACT_APP_AUTH0_CLIENT_ID=your_auth0_client_id
REACT_APP_AUTH0_AUDIENCE=your_auth0_api_identifier
```

### 4. Auth0 Configuration

1. Create an Auth0 application (Single Page Application)
2. Configure allowed callback URLs:
   - `http://localhost:3000`
   - `https://your-vercel-domain.vercel.app`
3. Configure allowed logout URLs (same as callback URLs)
4. Configure allowed web origins (same as callback URLs)
5. Create an API in Auth0 with a unique identifier (use this as `AUTH0_AUDIENCE`)
6. Enable RBAC in API settings

### 5. Running the Application

#### Development Mode

Start the backend server:

```bash
# From root directory
npm run dev
```

Start the frontend development server:

```bash
# From frontend directory
cd frontend
npm start
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

#### Production Build

Build the frontend:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

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
