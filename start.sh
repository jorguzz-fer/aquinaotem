#!/bin/sh

# Sincronizar schema com o banco (db push é ideal para MVP sem migrations)
echo "📌 Sincronizando banco de dados..."
npx prisma db push --accept-data-loss --skip-generate

# Iniciar o servidor Next.js
echo "🚀 Iniciando servidor..."
node server.js
