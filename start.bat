@echo off
title AgencyOS — Dev + Cloudflare Tunnel

:: ── Find cloudflared ───────────────────────────────────────────
set "CF=cloudflared"
where cloudflared >nul 2>&1
if %errorlevel% neq 0 (
    if exist "C:\Program Files (x86)\cloudflared\cloudflared.exe" (
        set "CF=C:\Program Files (x86)\cloudflared\cloudflared.exe"
    ) else if exist "C:\Program Files\cloudflared\cloudflared.exe" (
        set "CF=C:\Program Files\cloudflared\cloudflared.exe"
    ) else (
        echo [ERROR] cloudflared not found. Run: winget install Cloudflare.cloudflared
        pause
        exit /b 1
    )
)

:: ── Start Next.js dev server in a new window ───────────────────
echo [1/2] Starting Next.js dev server on http://localhost:3000 ...
start "AgencyOS Dev Server" cmd /k "cd /d %~dp0 && npm run dev"

:: ── Wait for Next.js to be ready ──────────────────────────────
echo [2/2] Waiting 6s for server to start...
timeout /t 6 /nobreak >nul

:: ── Start cloudflared quick tunnel ────────────────────────────
echo.
echo Starting Cloudflare quick tunnel — your public URL will appear below:
echo (look for the trycloudflare.com URL)
echo.
"%CF%" tunnel --url http://localhost:3000

pause
