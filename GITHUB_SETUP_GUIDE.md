# GitHub Setup Guide 🚀

This guide will help you push your Gymnasium Zenith application to GitHub.

## Prerequisites

1. **Git Installation** (if not already installed)
2. **GitHub Account** (create one at https://github.com)
3. **Your project files** (already ready!)

## Step 1: Install Git

### Windows Installation:

1. **Download Git for Windows:**
   - Go to: https://git-scm.com/download/win
   - Download the latest version for Windows
   - Run the installer

2. **Installation Options (Recommended):**
   - Use Git from Git Bash and the Windows Command Prompt
   - Use bundled OpenSSH
   - Use the OpenSSL library
   - Checkout as-is, commit Unix-style line endings
   - Use Windows' default console window
   - Enable file system caching
   - Enable Git Credential Manager

3. **Verify Installation:**
   ```bash
   git --version
   ```

## Step 2: Configure Git

After installing Git, configure it with your information:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Create GitHub Repository

1. **Go to GitHub:** https://github.com
2. **Sign in** to your account
3. **Click "New"** or the "+" icon in the top right
4. **Choose "New repository"**
5. **Repository settings:**
   - **Repository name:** `gymnasium-zenith`
   - **Description:** `Gymnasium Zenith - A modern gym management application`
   - **Visibility:** Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we'll push existing code)
6. **Click "Create repository"**

## Step 4: Initialize Git Repository

Open Command Prompt or PowerShell in your project directory and run:

```bash
# Navigate to your project directory
cd "C:\Users\wwwro\Downloads\Gymnasium-Zenith-main\Gymnasium-Zenith-main"

# Initialize Git repository
git init

# Add all files to Git
git add .

# Create initial commit
git commit -m "Initial commit: Gymnasium Zenith application with MongoDB setup"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/gymnasium-zenith.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 5: Verify Upload

1. **Go to your GitHub repository:** https://github.com/YOUR_USERNAME/gymnasium-zenith
2. **Verify all files are uploaded:**
   - ✅ `src/` directory with all application code
   - ✅ `scripts/` directory with database scripts
   - ✅ `docs/` directory with documentation
   - ✅ Configuration files (`package.json`, `render.yaml`, etc.)
   - ✅ Database setup files

## Important Files to Check:

### ✅ Should be uploaded:
- `src/` - All application source code
- `scripts/` - Database initialization scripts
- `docs/` - Documentation files
- `package.json` - Dependencies and scripts
- `render.yaml` - Render deployment config
- `env.example` - Environment variables template
- `RENDER_DEPLOYMENT.md` - Deployment guide
- `DATABASE_SETUP_COMPLETE.md` - Database setup summary

### ❌ Should NOT be uploaded:
- `node_modules/` (already in .gitignore)
- `.env*` files (already in .gitignore)
- `.next/` (already in .gitignore)
- Any files with sensitive information

## Step 6: Set Up Environment Variables

After pushing to GitHub, you'll need to set up environment variables in Render:

1. **Go to your Render dashboard**
2. **Create a new Web Service**
3. **Connect your GitHub repository**
4. **Set environment variables:**
   - `MONGODB_URI`: `mongodb+srv://jupiterbania472:KDYd7oJAbDwv60v9@gymnasium.6dylxfl.mongodb.net/?retryWrites=true&w=majority&appName=Gymnasium`
   - `NODE_ENV`: `production`
   - Add your Firebase configuration variables

## Troubleshooting

### Common Issues:

1. **Git not found:**
   - Install Git from https://git-scm.com/download/win
   - Restart Command Prompt after installation

2. **Authentication issues:**
   - Use GitHub CLI: `gh auth login`
   - Or use Personal Access Token

3. **Large file uploads:**
   - Check that `node_modules/` is in `.gitignore`
   - Use Git LFS for large files if needed

4. **Permission denied:**
   - Make sure you have write access to the repository
   - Check your GitHub account permissions

## Next Steps After GitHub Upload:

1. **Deploy to Render:**
   - Follow the `RENDER_DEPLOYMENT.md` guide
   - Connect your GitHub repository to Render

2. **Set up CI/CD:**
   - Enable automatic deployments on push
   - Set up branch protection rules

3. **Add collaborators:**
   - Invite team members to the repository
   - Set appropriate permissions

4. **Documentation:**
   - Update README.md with project information
   - Add contribution guidelines

## Repository Structure After Upload:

```
gymnasium-zenith/
├── src/
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   ├── lib/          # Database and utility functions
│   └── types/        # TypeScript type definitions
├── scripts/          # Database setup scripts
├── docs/            # Documentation
├── package.json     # Dependencies and scripts
├── render.yaml      # Render deployment config
├── env.example      # Environment variables template
├── RENDER_DEPLOYMENT.md
├── DATABASE_SETUP_COMPLETE.md
└── README.md
```

---

**Your Gymnasium Zenith application will be ready for deployment once uploaded to GitHub! 🎉**
