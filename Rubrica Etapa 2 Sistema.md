# Rubrica — Etapa 2: Sistema preliminar

**Equipe:** `<Lucas Felipe, Jackson Vitorio, Tainá Tarcila>` · **Avaliador:** `<Hélio Bentzen>` · **Data:** `<22/09/2026>`

## Pré-requisitos (sim/não)

Sem eles, a entrega volta para a equipe antes de ser pontuada.

| Verificação | Sim | Não |
| --- | :---: | :---: |
| Repositório acessível, com o código do backend | * | ☐ |
| Modelo de dados versionado (migrações aplicadas, sem erro) | ☐ | * |
| Ao menos um endpoint de API funcionando fim a fim (banco → resposta) | * | ☐ |

## Critérios

| Critério | Peso | 4 — Excelente | 3 — Adequado | 2 — Em desenvolvimento | 0–1 — Insuficiente | Nível |
| --- | ---: | --- | --- | --- | --- | :---: |
| **1. Modelo de dados** | 3,0 | 5+ models corretos, com relações, `on_delete` justificado e restrições de integridade testadas | 5+ models corretos, com relações e restrições básicas | 3–4 models ou relações confusas | Menos de 3 models ou modelagem que não sustenta as regras | 1 |
| **2. API e CRUD** | 4,0 | CRUD completo em 3+ recursos, com DTOs de entrada e saída separados | CRUD completo em 2 recursos | CRUD parcial | Não funciona | 2 |
| **3. Validação e consultas** | 2,0 | Validação de servidor cobrindo as regras, mais filtros ou paginação | Validação de servidor cobrindo as regras principais | Validação incompleta | Sem validação de servidor | 4 |
| **4. Organização do código** | 1,0 | Código legível, lint limpo, regra de negócio fora da view/controller | Lint limpo, código compreensível | Alguns problemas de organização | Código ilegível ou duplicado | 4 |
| **Total** | **10** | | | | | |

**Nota da etapa** = Σ (nível × peso) ÷ 4
=======
# Rubrica — Etapa 2: Desenvolvimento do sistema

> **Peso:** 30% da nota final · **Entrega:** semana 18 · **Eliminatória**
> 🔵 backend · 🟣 frontend · ⚪ transversal
> Escala: 4 Excelente · 3 Adequado · 2 Em desenvolvimento · 0–1 Insuficiente

**Equipe:** Jackson V., Lucas Felipe, Tainá Tarcila · **Avaliador:** `<...>` · **Data:** `<...>`

---

## Bloco A — Modelagem de dados (peso 3)

| Critério | 4 | 3 | 2 | 0–1 | Nota |
| --- | --- | --- | --- | --- | :---: |
| **A1. Modelo de domínio** | 5+ models, com abstrações que expressam bem o domínio; separações não óbvias e corretas | 5+ models corretos, com 1-N e N-N | 3–4 models; alguma confusão de responsabilidade | Menos de 3 models ou modelagem que não sustenta as regras | 0 |
| **A2. Relações e `on_delete`** | Toda política justificada e coerente com o negócio; nenhum histórico em risco | Políticas adequadas, com justificativa | Alguns `CASCADE` por inércia | `CASCADE` em tudo; risco de perda de dados | 0 |
| **A3. Restrições de integridade** | 3+ constraints expressando regras reais; testadas | 2 constraints funcionando | 1 constraint | Nenhuma; integridade só na validação de formulário | 0 |
| **A4. Migrações** | Histórico limpo, nomeado, sem conflitos; migração de dados quando necessária | Migrações versionadas e aplicadas | Migrações confusas ou refeitas | Migrações fora do Git ou inconsistentes | 0 |

## Bloco B — API (peso 4) 🔵

| Critério | 4 | 3 | 2 | 0–1 | Nota |
| --- | --- | --- | --- | --- | :---: |
| **B1. MVP entregue** | Todas as *Must*, mais alguma *Should* | Todas as *Must* funcionando | Faltou uma *Must* | Faltou mais de uma | 3 |
| **B2. CRUD** | 3+ recursos completos, com DTOs de entrada e de saída separados | CRUD completo em 2 recursos | CRUD parcial | Não funciona | 2.5 |
| **B3. Validação** | Validação por campo e entre campos, com mensagens úteis; erros no formato do contrato | Validação de servidor cobrindo as regras | Validação incompleta | Sem validação de servidor | 3 |
| **B4. Consultas** | Filtros, busca, ordenação declarada e paginação; nenhum N+1 (medido) | Filtros e paginação funcionando | Consulta simples | Sem paginação; N+1 evidente | 2 |
| **B5. Regras de negócio** | No model/service, consultadas pelo controller; bem testadas | Implementadas no lugar certo | Espalhadas nas views | Ausentes ou incorretas | 4 |
| **B6. Swagger e documentação** | Swagger navegável em `/api/docs`, com descrições, exemplos, respostas de erro e schema OpenAPI versionado; contrato confrontado com a implementação | `/api/docs/` coerente e schema versionado | Gerada mas não revisada ou incompleta | Ausente | 2 |

