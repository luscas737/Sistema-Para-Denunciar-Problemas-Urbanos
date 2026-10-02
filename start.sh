#!/usr/bin/env bash
set -euo pipefail
set -m
cd "$(dirname "$0")"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm nao encontrado. Instale o Node.js 18 ou superior."
  exit 1
fi

if [ ! -x backend/node_modules/.bin/nest ]; then
  echo "Instalando dependencias do backend..."
  (cd backend && npm install)
fi

echo "Iniciando backend (API + Swagger) em http://localhost:3001/api ..."
npm --prefix backend run start:dev &
BACKEND_PID=$!

cleanup() {
  kill -- "-$BACKEND_PID" 2>/dev/null || true
  kill $BACKEND_PID 2>/dev/null || true
}
trap cleanup EXIT

echo "Aguardando o backend responder..."
backend_ok=0
for i in $(seq 1 60); do
  if curl -sf -o /dev/null http://localhost:3001/api/denuncias; then
    backend_ok=1
    break
  fi
  sleep 2
done

if [ "$backend_ok" -eq 0 ]; then
  echo "O backend nao respondeu em http://localhost:3001/api."
  echo "Verifique as mensagens de erro acima e, se necessario, rode: cd backend && npm install"
fi

xdg-open http://localhost:3001/api/docs >/dev/null 2>&1 \
  || open http://localhost:3001/api/docs >/dev/null 2>&1 \
  || echo "Nao foi possivel abrir o navegador automaticamente. Acesse http://localhost:3001/api/docs"

echo "Executando. Pressione Ctrl+C para encerrar o backend. Swagger: http://localhost:3001/api/docs"
wait
