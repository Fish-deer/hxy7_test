@echo off
setlocal
cd /d "%~dp0"

echo [V3] First-time setup and start...

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Please install Node.js 18+ first.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm not found. Please reinstall Node.js.
  pause
  exit /b 1
)

cd legacy\next_v1

if not exist .env.local (
  if exist .env.local.example (
    copy /Y .env.local.example .env.local >nul
    echo [V3] Created .env.local from .env.local.example
  ) else (
    echo [WARN] .env.local.example not found. Please create .env.local manually.
  )
)

echo [V3] Installing dependencies...
call npm install
if errorlevel 1 (
  echo [ERROR] npm install failed.
  pause
  exit /b 1
)

echo [V3] Starting Next.js dev server at http://localhost:3000 ...
call npm run dev

endlocal
