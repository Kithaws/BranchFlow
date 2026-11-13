@echo off
cd /d "%~dp0"
title BranchFlow Launcher
echo ========================================================
echo   BranchFlow - AI Student Organization Management System
echo ========================================================
echo.

echo [1/2] Starting Backend Server (FastAPI on http://127.0.0.1:8000)...
start "BranchFlow Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && python run.py"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server (React Vite on http://localhost:5173)...
start "BranchFlow Frontend (Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ========================================================
echo   BranchFlow is running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://127.0.0.1:8000
echo   API Docs: http://127.0.0.1:8000/docs
echo.
echo   NOTE: Please keep both black terminal windows open
echo   while using BranchFlow!
echo ========================================================
echo.
pause
