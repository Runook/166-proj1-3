@echo off
REM Windows batch script to start the application

echo 🚀 Starting Graduate Location Map...
echo.

REM Function to kill process on a port (Windows)
:kill_port
set port=%1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%port%') do (
    set pid=%%a
    if not "!pid!"=="" (
        echo ⚠️  Port %port% is in use by PID !pid!
        echo    Killing process on port %port%...
        taskkill /F /PID !pid! >nul 2>&1
        echo ✅ Port %port% is now free
    ) else (
        echo ✅ Port %port% is already free
    )
)
goto :eof

REM Enable delayed expansion
setlocal enabledelayedexpansion

echo Clearing ports...
call :kill_port 3000
call :kill_port 3001
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

REM Start the application
echo 🚀 Starting application...
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3001
echo    Press Ctrl+C to stop
echo.

call npm run dev

