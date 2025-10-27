@echo off
echo ======================================
echo Columbia Spec Parser - Test Script
echo ======================================
echo.

echo Step 1: Checking PostgreSQL...
pg_isready
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL is not running!
    echo Please start PostgreSQL and try again.
    pause
    exit
)
echo [OK] PostgreSQL is running
echo.

echo Step 2: Creating test database...
psql -U postgres -c "CREATE DATABASE trim_ordering_automation;" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Database created or already exists
) else (
    echo [INFO] Database might already exist
)
echo.

echo Step 3: Running schema...
psql -U postgres -d trim_ordering_automation -f database/columbia_spec_schema.sql
if %errorlevel% equ 0 (
    echo [OK] Schema loaded successfully
) else (
    echo [ERROR] Failed to load schema
    pause
    exit
)
echo.

echo Step 4: Starting backend server...
cd backend
start cmd /k "python main.py"
timeout /t 3 /nobreak
echo [OK] Backend starting...
echo.

echo Step 5: Installing frontend dependencies...
cd ..\frontend
call npm install
echo [OK] Dependencies installed
echo.

echo Step 6: Starting frontend...
start cmd /k "npm run dev"
echo [OK] Frontend starting...
echo.

echo ======================================
echo Setup complete!
echo ======================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Open your browser and test the Columbia Spec Parser!
echo.
pause

