@echo off
setlocal

set "PORT=8000"
set "HOST=localhost"

where php >nul 2>nul
if errorlevel 1 (
  echo [ERROR] PHP is not installed or not in PATH.
  echo Install PHP or XAMPP/WAMP, then run this file again.
  pause
  exit /b 1
)

echo Starting PHP server at http://%HOST%:%PORT%
echo Press Ctrl + C to stop the server.
echo.

php -S %HOST%:%PORT%

endlocal
