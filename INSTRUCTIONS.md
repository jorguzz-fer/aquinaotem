# Aqui Não Tem - MVP

## Instalação

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configuração do Banco de Dados:
   - Crie um arquivo `.env` na raiz do projeto (copie de `.env.example`).
   - Adicione sua string de conexão Postgres em `DATABASE_URL`.
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/aquinaotem?schema=public"
   ```

3. Setup do Banco (Prisma):
   Execute o comando para criar as tabelas no banco:
   ```bash
   npx prisma migrate dev --name init
   ```
   *Nota: Se você não tiver um banco local rodando, precisará subir um (ex: Docker ou local) ou usar um banco na nuvem (Supabase, Neon, etc).*

## Rodando o Projeto

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse `http://localhost:3000`.

## Estrutura

- `src/app/page.tsx`: Página principal com o formulário.
- `src/app/api/missing-items/route.ts`: API Endpoint (POST) com validação e rate limiting.
- `prisma/schema.prisma`: Schema do banco de dados (`MissingItem`).
- `src/app/globals.css` e `src/app/page.module.css`: Estilos.

## Stack

- Next.js 14+ (App Router)
- TypeScript
- Prisma ORM
- Postgres
- CSS Modules (Vanilla API)
