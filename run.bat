@echo off
setlocal enabledelayedexpansion

:: ===================================
:: Packly Development Runner Script (Windows)
:: ===================================

echo [INFO] 🚀 Starting Packly Development Environment...

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo [ERROR] Please install Node.js 24.0.0 or higher from https://nodejs.org/
    pause
    exit /b 1
)

:: Get Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
set NODE_VERSION=%NODE_VERSION:v=%
echo [SUCCESS] Node.js version %NODE_VERSION% is available ✓

:: Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not available!
    pause
    exit /b 1
)

:: Get npm version
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [SUCCESS] npm version %NPM_VERSION% is available ✓

:: Check if we need to install dependencies
if not exist "node_modules" (
    echo [INFO] 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed ✓
) else (
    echo [INFO] 📦 Dependencies are up to date ✓
)

:: Check for environment variables
set ENV_FILE=.env.local
if not exist "%ENV_FILE%" set ENV_FILE=.env

if not exist "%ENV_FILE%" (
    echo [WARNING] No environment file found (.env.local or .env^)
    echo [WARNING] You may need to create one with your Supabase credentials:
    echo.
    echo VITE_SUPABASE_URL=your_supabase_project_url
    echo VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    echo.
    echo [WARNING] The app will run in development mode with mock data if no Supabase config is found.
) else (
    echo [SUCCESS] Environment file found: %ENV_FILE% ✓
)

echo [SUCCESS] 🎉 Environment setup complete!
echo [INFO] Starting development server...
echo [INFO] The application will be available at: http://localhost:5173
echo [INFO] Press Ctrl+C to stop the server
echo.
echo ==================================================
echo   🎒 PACKLY - Smart Travel Packing Lists
echo ==================================================
echo.

:: Start the development server
npm run dev

pause 