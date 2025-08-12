@echo off
echo ========================================
echo   Gymnasium Zenith - GitHub Push Script
echo ========================================
echo.

echo Checking if Git is installed...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    echo Then run this script again.
    pause
    exit /b 1
)

echo Git is installed. Proceeding...
echo.

echo Initializing Git repository...
git init

echo Adding all files to Git...
git add .

echo Creating initial commit...
git commit -m "Initial commit: Gymnasium Zenith application with MongoDB setup"

echo.
echo ========================================
echo   NEXT STEPS:
echo ========================================
echo.
echo 1. Create a GitHub repository at: https://github.com
echo    - Name: gymnasium-zenith
echo    - Description: Gymnasium Zenith - A modern gym management application
echo    - DO NOT initialize with README, .gitignore, or license
echo.
echo 2. After creating the repository, run these commands:
echo    git remote add origin https://github.com/YOUR_USERNAME/gymnasium-zenith.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Replace YOUR_USERNAME with your actual GitHub username
echo.
echo ========================================
echo.
pause
