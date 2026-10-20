@echo off
title Chronos Forensics Cyber Intelligence Launcher
echo ========================================================
echo   CHRONOS FORENSICS — CYBER CRIME INVESTIGATION PLATFORM
echo ========================================================
echo.
echo [1/2] Starting Python FastAPI Backend Server (Port 8000)...
start "Chronos Forensics Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo [2/2] Starting Next.js Frontend Server (Port 3005)...
start "Chronos Forensics Frontend" cmd /k "cd /d %~dp0 && npm.cmd run dev -- -p 3005"

echo.
echo Waiting for servers to initialize...
timeout /t 3 >nul

echo Launching Chronos Forensics Web Portal...
start http://localhost:3005

echo.
echo Chronos Forensics is running!
echo Frontend: http://localhost:3005
echo Backend API: http://localhost:8000/docs
echo.
