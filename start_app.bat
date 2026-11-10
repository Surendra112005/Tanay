@echo off
echo ========================================================
echo               TANAY AI INTEGRATION LAUNCHER
echo ========================================================
echo.
echo Starting FastAPI Backend Server on port 8000...
start "Tanay AI Backend Server" cmd /k "cd backend && ..\.venv\Scripts\activate && python server.py"

echo.
echo Starting Vite Frontend Server...
start "Tanay AI Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers initiated!
echo Access the webpage at: http://localhost:5173
echo.
echo ========================================================
pause
