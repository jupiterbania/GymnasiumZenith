# Render Deployment Guide

This guide will help you deploy your Gymnasium Zenith application to Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. Your application code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## ✅ Configuration Complete

Your application has been configured for Render deployment with:
- ✅ MongoDB connection string configured and tested
- ✅ Render configuration file (`render.yaml`) created
- ✅ Environment variables template updated
- ✅ Package.json scripts optimized for Render

## Deployment Steps

### 1. Connect Your Repository

1. Log in to your Render dashboard
2. Click "New +" and select "Web Service"
3. Connect your Git repository
4. Select the repository containing your Gymnasium Zenith application

### 2. Configure the Web Service

Use these settings:

- **Name**: `gymnasium-zenith` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose the closest to your users
- **Branch**: `main` (or your default branch)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Starter` (free tier) or choose a paid plan for better performance

### 3. Environment Variables

Add these environment variables in the Render dashboard:

#### Required Variables:
- `NODE_ENV`: `production`
- `PORT`: `10000` (Render will set this automatically)

#### Firebase Configuration:
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase app ID

#### MongoDB Configuration:
- `MONGODB_URI`: `mongodb+srv://jupiterbania472:KDYd7oJAbDwv60v9@gymnasium.6dylxfl.mongodb.net/?retryWrites=true&w=majority&appName=Gymnasium`

#### Optional (if using Genkit/Google AI):
- `GOOGLE_AI_API_KEY`: Your Google AI API key

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. The first deployment may take 5-10 minutes

### 5. Custom Domain (Optional)

1. Go to your web service settings
2. Click "Custom Domains"
3. Add your domain and follow the DNS configuration instructions

## Important Notes

- **Free Tier Limitations**: The free tier has limitations on build time and monthly usage
- **Environment Variables**: Never commit sensitive environment variables to your repository
- **Database**: Ensure your MongoDB instance is accessible from Render's servers
- **Firebase**: Make sure your Firebase project allows requests from your Render domain

## Troubleshooting

### Common Issues:

1. **Build Failures**: Check the build logs in Render dashboard
2. **Environment Variables**: Ensure all required variables are set
3. **Database Connection**: Verify MongoDB URI and network access
4. **Port Issues**: The `$PORT` variable is automatically set by Render

### Support:

- Check Render's documentation: https://render.com/docs
- Review build logs in your Render dashboard
- Ensure all dependencies are properly listed in `package.json`

## Post-Deployment

After successful deployment:

1. Test all functionality on your live site
2. Set up monitoring and alerts if needed
3. Configure automatic deployments for your main branch
4. Consider setting up a staging environment for testing

Your application will be available at: `https://your-app-name.onrender.com`
