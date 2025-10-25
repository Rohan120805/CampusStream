# CampusStream - Vercel Deployment Guide

## Environment Variables Required in Vercel

Configure these environment variables in your Vercel project settings:

### Backend Environment Variables

```
# MongoDB
MONGO_URI=your_mongodb_connection_string

# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your_auth0_api_identifier
AUTH0_ISSUER=https://your-domain.auth0.com/

# Google Cloud Storage
GCS_PROJECT_ID=your_gcs_project_id
GCS_BUCKET_NAME=your_bucket_name
GCS_CREDENTIALS={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}

# Note: For local development, use GCS_KEY_FILE instead:
# GCS_KEY_FILE=gcs-key.json

# Google AI
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Frontend URL (will be auto-set by Vercel)
FRONTEND_URL=https://your-app.vercel.app

# Node Environment
NODE_ENV=production
```

### Frontend Environment Variables

```
# Auth0
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your_auth0_client_id
REACT_APP_AUTH0_AUDIENCE=your_auth0_api_identifier
REACT_APP_AUTH0_REDIRECT_URI=https://your-app.vercel.app

# API URL (optional, will default to relative path /api in production)
REACT_APP_API_URL=/api
```

## Important Notes

1. **Google Cloud Service Account Key**: 
   - In Vercel, set `GCS_CREDENTIALS` environment variable with your entire service account JSON as a string
   - To convert your `gcs-key.json` to a string: Copy the entire JSON content without line breaks
   - Example: `{"type":"service_account","project_id":"your-project",...}`
   - For local development, use `GCS_KEY_FILE=gcs-key.json` instead
   
2. **Auth0 Configuration**:
   - Add your Vercel deployment URL to Auth0 Allowed Callback URLs
   - Add your Vercel URL to Auth0 Allowed Logout URLs
   - Add your Vercel URL to Auth0 Allowed Web Origins
   - Format: `https://your-app.vercel.app`

3. **MongoDB**:
   - Make sure your MongoDB Atlas allows connections from all IPs (0.0.0.0/0) for Vercel's serverless functions
   - Or whitelist Vercel's IP ranges

4. **GCS Bucket**:
   - Ensure your GCS bucket has proper CORS configuration
   - Set public access for video files if needed

## Deployment Steps

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Link to Vercel**:
   ```bash
   vercel link
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

   Or simply push to your GitHub repository if connected to Vercel.

## Project Structure

```
CampusStream/
├── api/
│   └── index.js          # Serverless function entry point
├── backend/
│   └── server.js         # Express server
├── frontend/
│   ├── build/            # Built React app
│   └── package.json
├── vercel.json           # Vercel configuration
└── .vercelignore         # Files to ignore during deployment
```

## Troubleshooting

### Issue: 404 on API routes
- Check that your API routes start with `/api/`
- Verify `vercel.json` routing configuration

### Issue: Auth0 login fails
- Verify all Auth0 URLs in the Auth0 dashboard include your Vercel domain
- Check that environment variables are set correctly

### Issue: Database connection fails
- Verify MongoDB connection string
- Check MongoDB Atlas network access settings

### Issue: Video upload fails
- Verify GCS credentials and bucket name
- Check GCS bucket permissions and CORS settings

## Local Development

For local development, create a `.env` file in the root directory with the same variables as above.

Run:
```bash
# Backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm start
```

## Support

For issues or questions, please check the project documentation or create an issue in the repository.
