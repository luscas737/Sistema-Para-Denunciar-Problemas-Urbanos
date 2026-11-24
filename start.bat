@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

###############################################################################
# Sistema Para Denunciar Problemas Urbanos
# Script de inicialização rápida (Windows)
#
# - Instala dependências do backend e frontend (se necessário)
# - Cria o .env do frontend a partir do .env.example (se necessário)
# - Executa as migrations do banco de dados
# - Inicia o backend (API) em http://localhost:3001/api
# - Inicia o frontend em http://localhost:3000
# - Abre o navegador no frontend
###############################################################################

echo ============================================================
echo   Sistema Para Denunciar Problemas Urbanos
echo ============================================================

:: --- Verificações iniciais -------------------------------------------------
where npm >nul 2>nul
if errorlevel 1 (
  echo ERRO: npm não encontrado. Instale o Node.js 18 ou superior.
  pause
  exit /b 1
)

:: --- Instala dependências --------------------------------------------------
echo.
echo [1/4] Verificando dependências do backend...
if exist "backend\node_modules" (
  echo   Dependências do backend já instaladas.
) else (
  echo   Instalando dependências do backend...
  pushd backend
  call npm install
  popd
)

echo [2/4] Verificando dependências do frontend...
if exist "frontend\node_modules" (
  echo   Dependências do frontend já instaladas.
) else (
  echo   Instalando dependências do frontend...
  pushd frontend
  call npm install
  popd
)

:: --- Variáveis de ambiente do frontend -------------------------------------
echo [3/4] Verificando frontend/.env...
if not exist "frontend\.env" (
  echo   Criando frontend/.env a partir do .env.example...
  copy frontend\.env.example frontend\.env >nul
) else (
  echo   frontend/.env já existe.
)

:: --- Migrations do banco ----------------------------------------------------
echo [4/4] Executando migrations do banco de dados...
pushd backend
call npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts
popd

:: --- Inicia o backend --------------------------------------------------------
echo.
echo Iniciando backend (API) em http://localhost:3001/api ...
start "Backend - API" /min cmd /c "cd /d "%~dp0backend" && npm run start:dev"

:: --- Inicia o frontend -------------------------------------------------------
echo Iniciando frontend em http://localhost:3000 ...
start "Frontend - App" /min cmd /c "cd /d "%~dp0frontend" && npm run dev"

:: --- Aguarda o backend responder --------------------------------------------
echo.
echo Aguardando o backend responder...
set /a tentativas=0
:aguardar_backend
timeout /t 2 /nobreak >nul
curl -s -o nul http://localhost:3001/api/denuncias 2>nul
if errorlevel 1 (
  set /a tentativas+=1
  if !tentativas! lss 60 goto aguardar_backend
  echo AVISO: O backend não respondeu em http://localhost:3001/api.
  echo        Verifique a janela "Backend - API".
) else (
  echo Backend online!
)

:: --- Aguarda o frontend responder -------------------------------------------
echo Aguardando o frontend responder...
set /a tentativas=0
:aguardar_frontend
timeout /t 2 /nobreak >nul
curl -s -o nul http://localhost:3000 2>nul
if errorlevel 1 (
  set /a tentativas+=1
  if !tentativas! lss 60 goto aguardar_frontend
  echo AVISO: O frontend não respondeu em http://localhost:3000.
  echo        Verifique a janela "Frontend - App".
) else (
  echo Frontend online!
)

:: --- Abre o navegador --------------------------------------------------------
echo.
echo Abrindo o navegador em http://localhost:3000 ...
start http://localhost:3000 2>nul || (
  echo Não foi possível abrir o navegador automaticamente.
  echo Acesse manualmente: http://localhost:3000
)

echo.
echo ============================================================
echo   Em execução.
echo   - Frontend:  http://localhost:3000
echo   - Backend:   http://localhost:3001/api
echo   - Swagger:   http://localhost:3001/api/docs
echo ============================================================
echo Feche as janelas "Backend - API" e "Frontend - App" para encerrar.
pause
