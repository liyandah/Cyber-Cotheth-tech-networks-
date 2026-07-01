@echo off
setlocal

set "PORT=8000"
set "HOST=localhost"

where node >nul 2>nul
if not errorlevel 1 (
  if exist package.json (
    if not exist node_modules (
      echo Installing Node.js dependencies...
      call npm.cmd install
      if errorlevel 1 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
      )
    )
    echo Starting CCTN Node.js server at http://%HOST%:%PORT%
    echo Sporting: http://%HOST%:%PORT%/sporting/
    echo Press Ctrl + C to stop the server.
    echo.
    node server/index.js
    goto :done
  )
)

where php >nul 2>nul
if not errorlevel 1 (
  echo Starting PHP server at http://%HOST%:%PORT%
  echo Press Ctrl + C to stop the server.
  echo.
  php -S %HOST%:%PORT%
  goto :done
)

where python >nul 2>nul
if not errorlevel 1 (
  echo [INFO] Node/PHP not found. Using Python static server.
  echo [INFO] Sporting auth and wallet require Node.js — run: npm install ^&^& npm start
  echo Starting server at http://%HOST%:%PORT%
  echo Press Ctrl + C to stop the server.
  echo.
  python -m http.server %PORT% --bind %HOST%
  goto :done
)

echo [ERROR] Node.js is required for the Sporting platform.
echo Install Node.js from https://nodejs.org/ then run this file again.
pause
exit /b 1

:done
endlocal
