@echo off
REM iFinWell Mobile App Setup Script (Windows)
REM Automates: clone, install, and run setup

echo.
echo 🚀 iFinWell Mobile App Setup
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%
echo.

REM Check if we're in the mobile directory
if not exist "package.json" (
    echo ❌ Please run this script from the mobile\ directory
    echo.    cd iExpenseApps\mobile
    echo.    scripts\setup.bat
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies (this may take 5-10 minutes)...
echo.
call npm install

REM Check if Expo CLI is installed
where expo >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo 📱 Installing Expo CLI globally...
    call npm install -g expo-cli
)

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo   1. Make sure Expo Go is installed on your iPhone (App Store)
echo   2. Run: npm start
echo   3. Scan the QR code with Expo Go
echo.
pause
