# Sistema Para Denunciar Problemas Urbanos

Plataforma web para registrar e acompanhar problemas urbanos da cidade de Palmares (PE), como buracos nas vias, postes queimados e lixo acumulado. Cada denuncia aparece em um mapa para que outros moradores tenham ciencia do problema e possam acompanhar seu status.

## Visao geral

O projeto e dividido em duas partes independentes que se comunicam por HTTP:

| Pasta      | Descricao                                        | Stack                                   |
| ---------- | ------------------------------------------------ | --------------------------------------- |
| `backend`  | API REST com CRUD de denuncias                    | NestJS, TypeORM, SQLite, Zod, Swagger   |
| `frontend` | Aplicacao web com lista e mapa das denuncias      | Next.js, React, Tailwind CSS, Leaflet   |

## Funcionalidades

- Cadastro de denuncia com titulo, descricao, categoria e localizacao (latitude e longitude)
- Anexo opcional de foto por URL
- Listagem com filtros por categoria e status
- Atualizacao do status: recebida, encaminhada, em andamento ou resolvida
- Mapa com marcadores por categoria e pop-up com detalhes de cada denuncia
- Remocao de denuncias

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

A API fica disponivel em `http://localhost:3001/api` e a documentacao Swagger em `http://localhost:3001/api/docs`. O banco de dados SQLite e criado automaticamente no arquivo `backend/dev.db`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicacao fica disponivel em `http://localhost:3000`. O endereco da API pode ser configurado com a variavel `NEXT_PUBLIC_API_URL` (o padrao e `http://localhost:3001/api`).

## Scripts de execucao rapida

Para iniciar backend e frontend com um unico comando:

- Linux e macOS: `./start.sh`
- Windows: execute `start.bat` (ou clique duas vezes nele)

Os scripts instalam as dependencias caso ainda nao existam, sobem a API e o aplicativo, aguardam o frontend responder e abrem o navegador em `http://localhost:3000`. No Linux e no macOS, pressione Ctrl+C para encerrar os dois processos; no Windows, feche as janelas do backend e do frontend.

## Endpoints da API

| Metodo | Rota                  | Descricao                                        |
| ------ | --------------------- | ------------------------------------------------ |
| POST   | `/api/denuncias`      | Cadastra uma denuncia                            |
| GET    | `/api/denuncias`      | Lista denuncias (`?categoria=` e `?status=`)     |
| GET    | `/api/denuncias/mapa` | Lista denuncias para exibicao no mapa            |
| GET    | `/api/denuncias/:id`  | Detalha uma denuncia                             |
| PATCH  | `/api/denuncias/:id`  | Atualiza campos e status de uma denuncia         |
| DELETE | `/api/denuncias/:id`  | Remove uma denuncia                              |

## Validacao

O backend valida as requisicoes com schemas Zod por meio do `nestjs-zod`. Campos fora das regras (titulo menor que 5 caracteres, coordenadas fora dos limites, categoria inexistente, URL invalida) retornam erro 400. O formulario do frontend aplica as mesmas regras de validacao no cliente antes de enviar.

## Documentacao

- `docs/Canvas.md`: canvas do projeto com problema, solucao, publico-alvo e criterios de sucesso.

## Licenca

MIT, conforme definido no canvas do projeto.
