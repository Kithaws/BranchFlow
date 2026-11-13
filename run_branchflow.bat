@echo off
title BranchFlow Launcher
echo ========================================================
echo   BranchFlow - AI Student Organization Management System
echo ========================================================
echo.

echo [1/2] Starting Backend Server (FastAPI on port 8000)...
start "BranchFlow Backend (FastAPI)" cmd /k "cd backend && python run.py"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend Server (Vite on port 5173)...
start "BranchFlow Frontend (React)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   Both services are launching in separate windows!
echo   Frontend:  http://localhost:5173
echo   Backend:   http://127.0.0.1:8000
echo   API Docs:  http://127.0.0.1:8000/docs
echo ========================================================
echo.
pause
