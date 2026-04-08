@echo off
echo =====================================================
echo    NCTU ERP System - Quick Start Script
echo    جامعة القاهرة الجديدة التكنولوجية
echo =====================================================
echo.

echo [1/4] Checking MySQL service...
net start MySQL80 >nul 2>&1
if %errorlevel% neq 0 (
    echo MySQL service is not running. Please start MySQL service manually.
    pause
    exit /b 1
)
echo MySQL service is running.

echo.
echo [2/4] Setting up database...
mysql -u root -p < "%~dp0database\nctu_erp.sql"
if %errorlevel% neq 0 (
    echo Failed to setup database. Please check MySQL credentials.
    pause
    exit /b 1
)
echo Database setup completed.

echo.
echo [3/4] Starting backend server...
start cmd /k "cd server && npm start"

echo.
echo [4/4] Starting frontend development server...
start cmd /k "cd client\frontend && npm run dev"

echo.
echo =====================================================
echo    NCTU ERP System Started Successfully!
echo =====================================================
echo.
echo Backend Server: http://localhost:5000
echo Frontend App:   http://localhost:5173
echo.
echo Test Accounts:
echo Admin:     admin / admin123
echo Professor: prof_ahmed / prof123
echo Student:   student_ahmed / student123
echo.
echo Press any key to exit...
pause >nul