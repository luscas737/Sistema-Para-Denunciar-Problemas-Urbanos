# Sistema Para Denunciar Problemas Urbanos

Plataforma web para registrar e acompanhar problemas urbanos da cidade de Palmares (PE), como buracos nas vias, postes queimados e lixo acumulado. Cada denúncia aparece em um mapa para que outros moradores tenham ciência do problema e possam acompanhar seu status.

## Visão geral

O projeto é dividido em duas partes independentes que se comunicam por HTTP:

| Pasta      | Descrição                                        | Stack                                   |
| ---------- | ------------------------------------------------ | --------------------------------------- |
| `backend`  | API REST com CRUD de denúncias                    | NestJS, TypeORM, SQLite, Zod, Swagger   |
| `frontend` | Aplicação web com lista e mapa das denúncias      | Next.js, React, Tailwind CSS, Leaflet   |

## Funcionalidades

- Cadastro de denúncia com título, descrição, categoria e localização (latitude e longitude)
- Anexo opcional de foto por **URL** ou **upload de arquivo** (seleção de arquivos ou captura pela câmera)
- Listagem com filtros por categoria e status
- Atualização do status: recebida, encaminhada, em andamento ou resolvida
- Mapa com marcadores por categoria e pop-up com detalhes de cada denúncia
- Remoção de denúncias
- Visualização e remoção de anexos (fotos/documentos) no detalhe da denúncia

## Pré-requisitos

- Node.js 18.17 ou superior
- npm 10 ou superior

## Como executar

### Backend

```bash
cd backend
npm install
npm run start:dev
```

A API fica disponível em `http://localhost:3001/api` e a documentação Swagger em `http://localhost:3001/api/docs`. O banco de dados SQLite é criado automaticamente no arquivo `backend/dev.db`. Arquivos enviados (fotos/documentos) são salvos na pasta `backend/uploads/` (configurável com a variável `UPLOADS_DIR`) e servidos em `http://localhost:3001/uploads/<arquivo>`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`. O endereço da API pode ser configurado com a variável `NEXT_PUBLIC_API_URL` (o padrão é `http://localhost:3001/api`).

## Variáveis de ambiente

| Variável             | Padrão                  | Descrição                                  |
| -------------------- | ----------------------- | ------------------------------------------ |
| `NEXT_PUBLIC_API_URL`| `http://localhost:3001/api` | URL da API usada pelo frontend           |
| `UPLOADS_DIR`        | `uploads`               | Pasta onde o backend salva os arquivos     |
| `PORT`               | `3001`                  | Porta do backend                           |
| `FILA_URL`           | `http://localhost:3002` | URL do serviço de filas (bastidor)         |
| `FILA_DENUNCIAS`     | `denuncias.processamento`| Nome da fila de processamento             |

## Scripts de execução rápida

Para iniciar backend e frontend com um único comando:

- Linux e macOS: `./start.sh`
- Windows: execute `start.bat` (ou clique duas vezes nele)

Os scripts instalam as dependências caso ainda não existam, sobem a API e o aplicativo, aguardam o frontend responder e abrem o navegador em `http://localhost:3000`. No Linux e no macOS, pressione Ctrl+C para encerrar os dois processos; no Windows, feche as janelas do backend e do frontend.

## Endpoints da API

| Método | Rota                                  | Descrição                                         |
| ------ | ------------------------------------- | ------------------------------------------------- |
| POST   | `/api/denuncias`                      | Cadastra uma denúncia                             |
| GET    | `/api/denuncias`                      | Lista denúncias (`?categoria=` e `?status=`)      |
| GET    | `/api/denuncias/mapa`                 | Lista denúncias para exibição no mapa             |
| GET    | `/api/denuncias/:id`                  | Detalha uma denúncia (inclui anexos)              |
| PATCH  | `/api/denuncias/:id`                  | Atualiza campos e status de uma denúncia          |
| DELETE | `/api/denuncias/:id`                  | Remove uma denúncia                               |
| POST   | `/api/denuncias/:id/anexos`           | Adiciona um anexo por URL à denúncia              |
| POST   | `/api/denuncias/:id/anexos/upload`    | Faz upload de arquivo (foto/documento)            |
| GET    | `/api/denuncias/:id/anexos`           | Lista os anexos de uma denúncia                   |
| DELETE | `/api/denuncias/:id/anexos/:anexoId`  | Remove um anexo da denúncia                       |

## Validação

O backend valida as requisições com schemas Zod por meio do `nestjs-zod`. Campos fora das regras (título menor que 5 caracteres, coordenadas fora dos limites, categoria inexistente, URL inválida) retornam erro 400. O formulário do frontend aplica as mesmas regras de validação no cliente antes de enviar.

## Documentação

- `docs/Canvas.md`: canvas do projeto com problema, solução, público-alvo e critérios de sucesso.
- `docs/modelo-de-dados.md`: modelo de dados do sistema.
- `docs/consultas.md`: consultas SQL do banco de dados.

## Licença

MIT, conforme definido no canvas do projeto.
