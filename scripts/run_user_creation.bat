@echo off
REM Batch script to run the user creation Python script
REM This script makes it easier to create new users on Windows systems

echo ========================================
echo    User Creation Script Runner
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.6 or higher
    pause
    exit /b 1
)

REM Check if requests library is installed
echo 🔍 Checking if requests library is installed...
python -c "import requests" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  requests library not found, installing...
    pip install requests
    if %errorlevel% neq 0 (
        echo ❌ Failed to install requests library
        echo Please install it manually: pip install requests
        pause
        exit /b 1
    )
    echo ✅ requests library installed successfully
) else (
    echo ✅ requests library is already installed
)

echo.

REM Ask user for creation mode
set /p mode="Choose mode - (I)nteractive or (C)ommand line: "

if /i "%mode%"=="I" (
    echo.
    echo 🚀 Starting interactive mode...
    python create_new_user.py --interactive
) else if /i "%mode%"=="C" (
    echo.
    echo 📝 Command line mode selected
    set /p user_code="Enter user code (e.g., USER001): "
    set /p user_fname="Enter first name: "
    set /p user_lname="Enter last name: "
    set /p user_login="Enter login username: "
    set /p user_password="Enter password: "
    set /p api_url="Enter API URL (default: http://localhost:8000): "
    
    if "%api_url%"=="" set api_url=http://localhost:8000
    
    echo.
    echo 👤 Creating user...
    python create_new_user.py "%user_code%" "%user_fname%" "%user_lname%" "%user_login%" "%user_password%" --url "%api_url%"
) else (
    echo ❌ Invalid mode selected. Please choose 'I' for Interactive or 'C' for Command line.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Script execution completed
echo ========================================
pause