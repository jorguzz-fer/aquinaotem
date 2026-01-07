# Deploy com Portainer

Como o projeto já tem um `Dockerfile` otimizado e agora um `docker-compose.yml`, a "melhor prática" simples para seu caso é usar **Stacks** do Portainer conectadas ao Git.

## Passo a Passo

1. **Acesse o Portainer** e vá em **Stacks**.
2. Clique em **Add stack**.
3. Selecione a opção **Repository**.
4. Preencha os campos:
   - **Name**: `aquinaotem` (ou outro de sua preferência)
   - **Repository URL**: `https://github.com/jorguzz-fer/aquinaotem.git`
   - **Branch**: `main`
   - **Compose path**: `docker-compose.yml` (Padrão)
5. Em **Environment variables**, adicione:
   - `DATABASE_URL`: `postgresql://usuario:senha@host:5432/banco`
   *(Certifique-se que o host do banco seja acessível pelo container. Se o banco estiver no mesmo Portainer em outra stack, use a rede interna ou IP interno)*.
6. Clique em **Deploy the stack**.

## Observações

- **Build no Server**: Esta configuração fará o build da imagem diretamente no seu servidor. Isso consome CPU/RAM durante o deploy. Para projetos maiores, recomenda-se usar uma imagem pré-buildada (Docker Hub/GHCR), mas para este MVP, o build local é perfeitamente aceitável.
- **Porta**: O app rodará na porta `3000`. Se precisar mudar, altere no `docker-compose.yml` (ex: `8080:3000`).
