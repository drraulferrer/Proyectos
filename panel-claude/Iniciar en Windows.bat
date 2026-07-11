@echo off
rem Panel de Claude Code - arrancador para Windows (doble clic).
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Falta Node.js en este equipo.
  echo   Descargalo desde https://nodejs.org (boton verde, version LTS),
  echo   instalalo con "siguiente, siguiente" y vuelve a hacer doble clic aqui.
  echo.
  pause
  exit /b 1
)

node server.js
pause
