@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo npm nao encontrado. Instale o Node.js 18 ou superior.
  pause
  exit /b 1
)

if not exist "backend\node_modules" (
  echo Instalando dependencias do backend...
  pushd backend
  call npm install
  popd
)

if not exist "frontend\node_modules" (
  echo Instalando dependencias do frontend...
  pushd frontend
  call npm install
  popd
)

echo Iniciando backend em http://localhost:3001/api ...
start "Backend - API" cmd /k "cd backend && npm run start:dev"

echo Iniciando frontend em http://localhost:3000 ...
start "Frontend - App" cmd /k "cd frontend && npm run dev"

echo Aguardando o frontend responder...
set /a tentativas=0
:aguardar
timeout /t 2 /nobreak >nul
curl -s -o nul http://localhost:3000
if errorlevel 1 (
  set /a tentativas+=1
  if !tentativas! lss 30 goto aguardar
  echo O frontend nao respondeu a tempo. Verifique as janelas do backend e do frontend.
  pause
  exit /b 1
)

start http://localhost:3000
echo Executando. Feche as janelas do backend e do frontend para encerrar.
