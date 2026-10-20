# Rubrica — Etapa 2: Desenvolvimento do sistema

> **Peso:** 30% da nota final · **Entrega:** semana 18 · **Eliminatória**
> 🔵 backend · 🟣 frontend · ⚪ transversal
> Escala: 4 Excelente · 3 Adequado · 2 Em desenvolvimento · 0–1 Insuficiente

**Equipe:** Jackson V., Lucas Felipe, Tainá Tarcila · **Avaliador:** `<...>` · **Data:** `20/10/2026` (atualizada após P1/P2/P3)

---

## Pré-requisitos (Sim)

| Verificação | Sim | Não |
| --- | :---: | :---: |
| Repositório acessível, com o código do backend | * | ☐ |
| Modelo de dados versionado (migrações aplicadas, sem erro) | * | ☐ |
| Ao menos um endpoint de API funcionando fim a fim (banco → resposta) | * | ☐ |

> Evidência: 7 migrations em `backend/src/database/migrations/` (todas aplicadas no `dev.db`, `migration:show` limpo, `up`/`down` testados em banco descartável); E2E manual das rotas P3 com app no ar (denúncia → histórico → anexo → linha do tempo).

## Bloco A — Modelagem de dados (peso 3) 🔵

| Critério | 4 | 3 | 2 | 0–1 | Nota |
| --- | --- | --- | --- | --- | :---: |
| **A1. Modelo de domínio** | 5+ models, com abstrações que expressam bem o domínio; separações não óbvias e corretas | 5+ models corretos, com 1-N e N-N | 3–4 models; alguma confusão de responsabilidade | Menos de 3 models ou modelagem que não sustenta as regras | 3 |
| **A2. Relações e `on_delete`** | Toda política justificada e coerente com o negócio; nenhum histórico em risco | Políticas adequadas, com justificativa | Alguns `CASCADE` por inércia | `CASCADE` em tudo; risco de perda de dados | 4 |
| **A3. Restrições de integridade** | 3+ constraints expressando regras reais; testadas | 2 constraints funcionando | 1 constraint | Nenhuma; integridade só na validação de formulário | 3 |
| **A4. Migrações** | Histórico limpo, nomeado, sem conflitos; migração de dados quando necessária | Migrações versionadas e aplicadas | Migrações confusas ou refeitas | Migrações fora do Git ou inconsistentes | 4 |

**Nota do bloco A** = (3 + 4 + 3 + 4) ÷ 4 = **3,5**

> Evidências: 9 entidades (`Usuario` base + `Cidadao`/`Atendente`/`Administrador` em herança de tabela única — D1, `Denuncia`, `Setor`, `Encaminhamento`, `HistoricoStatus`, `Anexo`); `CASCADE` só em `anexos` (único caso justificado — seção 5.3), `RESTRICT` em histórico e cidadão-autor, `SET NULL` em autores/setor; CHECKs (mudança real de status, `nivelAcesso` por subtipo, tipo de anexo, status/categoria) + UNIQUEs (e-mail, CPF, matrícula) + limite de 5 anexos; CHECKs validadas em banco descartável e regras cobertas por specs.

## Bloco B — API (peso 4) 🔵

| Critério | 4 | 3 | 2 | 0–1 | Nota |
| --- | --- | --- | --- | --- | :---: |
| **B1. MVP entregue** | Todas as *Must*, mais alguma *Should* | Todas as *Must* funcionando | Faltou uma *Must* | Faltou mais de uma | 3 |
| **B2. CRUD** | 3+ recursos completos, com DTOs de entrada e de saída separados | CRUD completo em 2 recursos | CRUD parcial | Não funciona | 4 |
| **B3. Validação** | Validação por campo e entre campos, com mensagens úteis; erros no formato do contrato | Validação de servidor cobrindo as regras | Validação incompleta | Sem validação de servidor | 4 |
| **B4. Consultas** | Filtros, busca, ordenação declarada e paginação; nenhum N+1 (medido) | Filtros e paginação funcionando | Consulta simples | Sem paginação; N+1 evidente | 3 |
| **B5. Regras de negócio** | No model/service, consultadas pelo controller; bem testadas | Implementadas no lugar certo | Espalhadas nas views | Ausentes ou incorretas | 4 |
| **B6. Swagger e documentação** | Swagger navegável em `/api/docs`, com descrições, exemplos, respostas de erro e schema OpenAPI versionado; contrato confrontado com a implementação | `/api/docs/` coerente e schema versionado | Gerada mas não revisada ou incompleta | Ausente | 2 |
| **B7. Testes automatizados** ⚪ | Cobertura que sustenta a qualidade (regras de negócio, incluindo API e concorrência) | Cobertura das regras de negócio, passando | Poucos testes | Sem testes ou testes quebrados | 3 |
| **B8. Frontend consome o backend** 🟣 | Consome a API real e reflete as mudanças (sem reload) | Interação completa com a API (lista, cria, edita, remove) | Protótipo navegável, consumindo dados reais | Não consome a API | 2 |

**Nota do bloco B** = (3 + 4 + 4 + 3 + 4 + 2 + 3 + 2) ÷ 8 = **3,125**

> Evidências: 5 *Must* do Canvas funcionando (cadastrar, anexar por URL — D4, gerenciar, encaminhar + status, acompanhar via histórico/linha do tempo); CRUD completo em 6 recursos com DTOs de entrada/saída separados (Zod + mappers); erros no formato do contrato (`ErroDto` + `HttpExceptionFilter`); filtros (`status`, `categoria`, `setor`), busca, paginação; máquina de estados + transação única + limite de anexos no service, 74 testes em 5 specs passando, `tsc` limpo; **pendências:** `docs/openapi.json` versionado (B6) e verificação do re-fetch no frontend (B8).

---
