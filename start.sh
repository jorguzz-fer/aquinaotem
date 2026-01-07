#!/bin/sh

# Rodar migrations do Prisma
echo "📌 Rodando migrations..."
npx prisma migrate deploy

# Iniciar o servidor Next.js
echo "🚀 Iniciando servidor..."
node server.js
