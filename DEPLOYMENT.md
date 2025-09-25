# Deployment Guide

This guide covers different deployment options for the SplitWise Clone application.

## GitHub Pages (Frontend Only)

For hosting just the frontend on GitHub Pages:

1. **Build the React app**:
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "Deploy from a branch"
   - Choose the `gh-pages` branch or `main` branch with `/build` folder

3. **Update API URL**:
   - Set `REACT_APP_API_URL` to your backend URL in production

## Vercel (Recommended for Full Stack)

1. **Connect your GitHub repository to Vercel**
2. **Configure build settings**:
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`

3. **Set environment variables in Vercel**:
   - `REACT_APP_API_URL`: Your backend API URL

## Netlify

1. **Connect your GitHub repository to Netlify**
2. **Build settings**:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/build`

## Heroku (Full Stack)

1. **Install Heroku CLI**
2. **Create Heroku apps**:
   ```bash
   # For backend
   heroku create your-app-backend
   
   # For frontend
   heroku create your-app-frontend
   ```

3. **Deploy backend**:
   ```bash
   cd server
   heroku git:remote -a your-app-backend
   git subtree push --prefix=server heroku main
   ```

4. **Deploy frontend**:
   ```bash
   cd client
   heroku git:remote -a your-app-frontend
   git subtree push --prefix=client heroku main
   ```

## Railway (Full Stack)

1. **Connect GitHub repository to Railway**
2. **Create two services**:
   - Backend service (root: `server`)
   - Frontend service (root: `client`)

3. **Set environment variables**:
   - Backend: `MONGODB_URI`, `JWT_SECRET`
   - Frontend: `REACT_APP_API_URL`

## MongoDB Atlas

For production database:

1. **Create MongoDB Atlas account**
2. **Create a cluster**
3. **Get connection string**
4. **Update environment variables**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/splitwise
   ```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/splitwise
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=production
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-url.com
```

## Production Checklist

- [ ] Set up MongoDB Atlas or production database
- [ ] Configure environment variables
- [ ] Update CORS settings for production domain
- [ ] Set up SSL certificates
- [ ] Configure domain names
- [ ] Set up monitoring and logging
- [ ] Test all functionality in production
