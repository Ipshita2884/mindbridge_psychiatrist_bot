@echo off
title 🧠 MindBridge Aura: Neural Sanctuary Setup
color 0b
echo ==================================================
echo   ✨ WELCOME TO MINDBRIDGE AURA MAGIC SETUP ✨
echo ==================================================
echo.
echo [1/4] Checking for Node.js magic...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] ERROR: No Node.js found! Go to https://nodejs.org
    pause
    exit /b
)

echo [2/4] Clearing the Neural Pathways (Cleaning old ports)...
:: This magic command kills anything on ports 5000 and 8085
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8085') do taskkill /f /pid %%a >nul 2>&1
echo ✅ Neural pathways cleared!

echo [3/4] Preparing the Sanctuary and Brain...
echo (I'm downloading the magic libraries now, please wait...)
call npm install --legacy-peer-deps >nul 2>&1
cd backend
call npm install >nul 2>&1
cd ..
echo ✅ Ready!

echo [4/4] Running Neural Setup...
node setup.js

echo.
echo ==================================================
echo   🚀 STARTING MINDBRIDGE AURA Hub... 🚀
echo ==================================================
echo.
npm run aura
pause
