@echo off
title AgencyOS — AI Employee
cd /d "%~dp0"

echo.
echo  ==========================================
echo   AgencyOS - AI Employee for Agencies
echo  ==========================================
echo.

echo  [1/3] Stopping any existing server...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul

echo  [2/3] Starting dev server...
start "AgencyOS Dev Server" /min cmd /c "npm run dev"

echo  [3/3] Waiting for server to be ready...
timeout /t 8 /nobreak >nul

echo.
echo  ==========================================
echo   Local:    http://localhost:3000
echo   Sharing:  generating public link...
echo  ==========================================
echo.
start "" "http://localhost:3000"
lt --port 3000
pause
