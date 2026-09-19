# Frontend - Aplicacao Web de Denuncias Urbanas

Aplicacao Next.js que permite aos moradores registrar problemas urbanos, acompanhar o status das denuncias e visualizar tudo em um mapa.

## Tecnologias

- Next.js 14 (App Router)
- React 18 e TypeScript
- Tailwind CSS para estilos
- react-leaflet para o mapa (tiles do OpenStreetMap)
- Zod para validacao do formulario no cliente

## Como executar

```bash
npm install
npm run dev
```

A aplicacao sobe em `http://localhost:3000`. Ela espera a API do backend em `http://localhost:3001/api`; esse endereco pode ser alterado criando o arquivo `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Paginas

| Rota                   | Descricao                                                       |
| ---------------------- | --------------------------------------------------------------- |
| `/`                    | Pagina inicial com acesso rapido ao cadastro e ao mapa          |
| `/denuncias`           | Lista de denuncias com filtros por categoria e status           |
| `/denuncias/nova`      | Formulario de cadastro com validacao Zod                        |
| `/denuncias/:id`       | Detalhe da denuncia com edicao e remocao                        |
| `/denuncias/:id/editar`| Formulario de edicao, incluindo o campo de status               |
| `/mapa`                | Mapa com um marcador por denuncia, filtros e legenda            |

## Validacao

O formulario valida os dados no cliente com o mesmo conjunto de regras da API (tamanho de titulo e descricao, categoria obrigatoria, limites de coordenadas e formato de URL). Campos invalidos recebem destaque e mensagem, e o envio so acontece quando todos os dados sao validos.
