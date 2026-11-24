#!/usr/bin/env bash
###############################################################################
# Sistema Para Denunciar Problemas Urbanos
# Script de inicialização rápida (Linux / macOS)
#
# - Instala dependências do backend e frontend (se necessário)
# - Cria o .env do frontend a partir do .env.example (se necessário)
# - Executa as migrations do banco de dados
# - Inicia o backend (API) em http://localhost:3001/api
# - Inicia o frontend em http://localhost:3000
# - Abre o navegador no frontend
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"

# --- Verificações iniciais ---------------------------------------------------
if ! command -v npm >/dev/null 2>&1; then
  echo "ERRO: npm não encontrado. Instale o Node.js 18 ou superior."
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "ERRO: curl não encontrado. Instale o curl para usar este script."
  exit 1
fi

echo "============================================================"
echo "  Sistema Para Denunciar Problemas Urbanos"
echo "============================================================"

# --- Instala dependências ----------------------------------------------------
if [ ! -d "backend/node_modules" ]; then
  echo ""
  echo "[1/4] Instalando dependências do backend..."
  (cd backend && npm install)
else
  echo "[1/4] Dependências do backend já instaladas."
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "[2/4] Instalando dependências do frontend..."
  (cd frontend && npm install)
else
  echo "[2/4] Dependências do frontend já instaladas."
fi

# --- Variáveis de ambiente do frontend ---------------------------------------
if [ ! -f "frontend/.env" ]; then
  echo "[3/4] Criando frontend/.env a partir do .env.example..."
  cp frontend/.env.example frontend/.env
else
  echo "[3/4] frontend/.env já existe."
fi

# --- Migrations do banco -----------------------------------------------------
echo "[4/4] Executando migrations do banco de dados..."
(cd backend && npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts 2>/dev/null || true)

# --- Limpeza de processos ao sair --------------------------------------------
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  echo "Encerrando processos..."
  [ -n "$BACKEND_PID" ]   && kill "$BACKEND_PID"   2>/dev/null || true
  [ -n "$FRONTEND_PID" ]  && kill "$FRONTEND_PID"  2>/dev/null || true
}
trap cleanup EXIT INT TERM

# --- Inicia o backend --------------------------------------------------------
echo ""
echo "Iniciando backend (API) em http://localhost:3001/api ..."
(cd backend && npm run start:dev) &
BACKEND_PID=$!

# --- Inicia o frontend -------------------------------------------------------
echo "Iniciando frontend em http://localhost:3000 ..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

# --- Aguarda o backend responder ---------------------------------------------
echo ""
echo "Aguardando o backend responder..."
backend_ok=0
for i in $(seq 1 60); do
  if curl -sf -o /dev/null http://localhost:3001/api/denuncias 2>/dev/null; then
    backend_ok=1
    break
  fi
  sleep 2
done

if [ "$backend_ok" -eq 1 ]; then
  echo "Backend online!"
else
  echo "AVISO: O backend não respondeu em http://localhost:3001/api."
  echo "       Verifique a saída acima para erros."
fi

# --- Aguarda o frontend responder --------------------------------------------
echo "Aguardando o frontend responder..."
frontend_ok=0
for i in $(seq 1 60); do
  if curl -sf -o /dev/null http://localhost:3000 2>/dev/null; then
    frontend_ok=1
    break
  fi
  sleep 2
done

if [ "$frontend_ok" -eq 1 ]; then
  echo "Frontend online!"
else
  echo "AVISO: O frontend não respondeu em http://localhost:3000."
  echo "       Verifique a saída acima para erros."
fi

# --- Abre o navegador --------------------------------------------------------
if [ "$frontend_ok" -eq 1 ]; then
  xdg-open http://localhost:3000 >/dev/null 2>&1 \
    || open http://localhost:3000 >/dev/null 2>&1 \
    || echo "Não foi possível abrir o navegador automaticamente. Acesse: http://localhost:3000"
else
  echo "Acesse manualmente: http://localhost:3000 (frontend) e http://localhost:3001/api/docs (Swagger)"
fi

echo ""
echo "============================================================"
echo "  Em execução. Pressione Ctrl+C para encerrar tudo."
echo "============================================================"
wait
