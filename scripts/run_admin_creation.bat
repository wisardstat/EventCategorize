@echo off
echo Running admin user creation script...
echo.

REM Change to the scripts directory
cd /d "%~dp0"

REM Run the Python script
python test_db_connection.py
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Database connection test failed. Please check the configuration.
    pause
    exit /b 1
)

echo.
echo Database connection test passed. Proceeding with admin user creation...
echo.

python create_new_admin_user.py

pause