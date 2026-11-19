# Backend — Sistema Para Denunciar Problemas Urbanos

API NestJS + TypeORM + SQLite.

## Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run build` | Compila o TypeScript para `dist/` |
| `npm run start:dev` | Inicia a API em modo watch (ts-node) |
| `npm run start` | Inicia a API a partir de `dist/` |
| `npm run migration:run` | Aplica todas as migrações pendentes |
| `npm run migration:revert` | Desfaz a última migração aplicada |
| `npm run migration:generate src/migracoes/<Nome>` | Gera uma nova migração comparando entidades com o banco |
| `npm run migration:create src/database/migrations/<Nome>` | Cria um arquivo de migração em branco |
| `npm run seed` | Popula o banco com dados de exemplo (semear.ts) |
| `npm test` | Executa os testes (jest) |

## Sequência para subir o ambiente do zero

```bash
# 1. Certifique-se de que não há banco antigo (opcional, para começar limpo)
rm -f dev.db

# 2. Suba o banco a partir das migrações
npm run migration:run

# 3. Popule com dados de exemplo (exercita todas as relações, inclusive N-N)
npm run seed

# 4. Suba a API
npm run start:dev
# ou: npm run start (após npm run build)
```

A API escuta na porta 3001 (variável `PORT`). Rotas principais sob `/api`.

## Verificação de restrições

- **UNIQUE `usuarios.email`**: tentar cadastrar e-mail já existente retorna `409` (não `500`).
- **RESTRICT**: excluir um cidadão que possui denúncias vinculadas é rejeitado pelo banco (`FOREIGN KEY constraint failed`).
- **CASCADE**: excluir uma denúncia remove seus anexos e vínculos de categoria automaticamente.

## Logging de consultas

Para ver todas as queries SQL (útil para contar consultas da listagem e confirmar ausência de N+1):

```bash
LOG_QUERIES=true npm run start:dev
```

A listagem de denúncias (`GET /api/denuncias`) carrega `setorAtual` e `categorias.categoria` via `LEFT JOIN` em uma única consulta (2 queries no total: 1 para `COUNT`, 1 para os dados), sem N+1.
