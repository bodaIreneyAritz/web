#!/usr/bin/env bash
# Desplega l’entorn de desenvolupament a 10.10.100.104 (Docker + nginx)
set -euo pipefail

HOST="${DEPLOY_HOST:-10.10.100.104}"
USER="${DEPLOY_USER:-root}"
REMOTE_DIR="${DEPLOY_DIR:-/opt/aritz-irene}"
PORT="${DEPLOY_PORT:-8080}"
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "→ Sync a ${USER}@${HOST}:${REMOTE_DIR}"
ssh -o StrictHostKeyChecking=accept-new "${USER}@${HOST}" "mkdir -p '${REMOTE_DIR}'"

rsync -az --delete \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude 'agent-transcripts' \
  --exclude '.cursor' \
  "${ROOT}/" "${USER}@${HOST}:${REMOTE_DIR}/"

echo "→ Build & up (Docker) a :${PORT}"
ssh "${USER}@${HOST}" bash -s <<EOF
set -euo pipefail
cd '${REMOTE_DIR}'
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker no trobat. Instal·lant (Debian/Ubuntu)…"
  apt-get update -qq
  apt-get install -y -qq docker.io docker-compose-v2 >/dev/null
  systemctl enable --now docker
fi
docker compose down --remove-orphans 2>/dev/null || true
docker compose up -d --build
docker compose ps
echo
echo "Llest: http://${HOST}:${PORT}/"
EOF
