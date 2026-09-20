#!/usr/bin/env bash
set -euo pipefail
set -m
cd "$(dirname "$0")"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm nao encontrado. Instale o Node.js 18 ou superior."
  exit 1
fi

if [ ! -d backend/node_modules ]; then
  echo "Instalando dependencias do backend..."
  (cd backend && npm install)
fi

if [ ! -d frontend/node_modules ]; then
  echo "Instalando dependencias do frontend..."
  (cd frontend && npm install)
fi

echo "Iniciando backend em http://localhost:3001/api ..."
npm --prefix backend run start:dev &
BACKEND_PID=$!

echo "Iniciando frontend em http://localhost:3000 ..."
npm --prefix frontend run dev &
FRONTEND_PID=$!

cleanup() {
  kill -- "-$BACKEND_PID" "-$FRONTEND_PID" 2>/dev/null || true
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
}
trap cleanup EXIT

echo "Aguardando o frontend responder..."
for i in $(seq 1 30); do
  if curl -sf -o /dev/null http://localhost:3000; then
    break
  fi
  sleep 2
done

xdg-open http://localhost:3000 >/dev/null 2>&1 \
  || open http://localhost:3000 >/dev/null 2>&1 \
  || echo "Nao foi possivel abrir o navegador automaticamente. Acesse http://localhost:3000"

echo "Executando. Pressione Ctrl+C para encerrar backend e frontend."
wait
