# Canvas do Projeto

**Projeto:** `Sistema-Para-Denunciar-Problemas-Urbanos` · **Equipe:** `Lucas Felipe, Jackson Vitorio, Tainá Tarcila` · **Data:** `2026-09-16`
**Organização parceira:** `Instituto Federal de Pernambuco, Campus Palmares`

---

## 1. Problema

> Na `cidade de Palmares`, `os moradores` precisam `entrar em contato informal com pessoas associadas à prefeitura`, o que causa `retardo para resolução do problema`.

**Evidências de que o problema existe** (dados, falas, observação):

- Em muitas ruas da cidade, quando vemos postes quebrados, crateras no chão e outros problemas urbanos, temos o costume de entrar em contato com funcionários da prefeitura, ou pessoas de influência.
- Não existe um meio simples e divulgado pela prefeitura para denunciar esses tipos de problemas.

## 2. Quem é afetado

| Quem | Quantas pessoas | Como é afetado hoje |
|---|---|---|
| Moradores, principalmente os de bairros mais pobres | 65.000 | Não existem meios simples para denunciar problemas urbanos |

## 3. Solução proposta

Em duas frases, sem jargão técnico:

> Queremos criar um aplicativo para que as pessoas denunciem estes problemas e os enviem á prefeitura da cidade.

## 4. Funcionalidades do MVP (3 a 5)

| # | Funcionalidade | Para quem | Por que é essencial |
|---|---|---|---|
| 1 |Cadastrar uma denúncia com descrição, categoria e localização|Cidadão|É a função principal do sistema e permite registrar o problema urbano|
| 2 |Anexar foto do problema|Cidadão|Ajuda a prefeitura a identificar e compreender melhor a situação denunciada|
| 3 |Visualizar e gerenciar denúncias recebidas|Prefeitura|Permite que os responsáveis tenham acesso aos problemas registrados pelos cidadãos|
| 4 |Encaminhar denúncia para o setor responsável e atualizar o status|Prefeitura|Organiza o atendimento e permite informar se o problema está pendente, em andamento ou resolvido|
| 5 |Acompanhar o status da denúncia|Cidadão|Permite que o cidadão saiba o que aconteceu com o problema que registrou|

## 5. Fora do escopo

O que **não** faremos nesta versão, e por quê:

| Não faremos | Por quê |
|---|---|
|As funcionalidades que competem à prefeitura do município|Devido à alta burocracia existente em todas as esferas de poder do Brasil, acreditamos que não entregaremos no prazo.|

## 6. Usuários e papéis

| Papel | O que pode fazer |
|---|---|
|Cidadão|Cadastra uma denúncia|
|Prefeitura|Analisa a denúncia e a encaminha para o setor responsável|

## 7. Restrições

| Tipo | Restrição |
|---|---|
| Prazo | Semana 18 |
| Equipe | `3` pessoas, `5` h/semana no total |
| Técnica | TypeScript (NestJS + React), PostgreSQL, PaaS gratuita |
| Contexto de uso | `Smartphones, com conexão à internet` |
| Orçamento | `Por enquanto, R$ 0,00` |

## 8. Riscos principais

| Risco                                                  | O que faremos                                                                                              |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Denúncias falsas ou incompletas**                    | Exigir informações mínimas, como descrição, categoria e localização, e permitir o envio de foto.           |
| **Grande quantidade de denúncias**                     | Organizar as denúncias por categoria, localização e status para facilitar o gerenciamento pela prefeitura. |
| **Prefeitura não atualizar o status**                  | Criar um fluxo simples de atualização: *recebida → encaminhada → em andamento → resolvida*.                |

## 9. Critérios de sucesso

| Objetivo                                      | Como mediremos                                            | Meta                                                                      |
| --------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Permitir o registro de problemas urbanos**  | Número de denúncias cadastradas com sucesso               | **≥ 90%** dos cadastros concluídos sem erro                               |
| **Facilitar o gerenciamento pela prefeitura** | Denúncias visualizadas e classificadas pelos responsáveis | **≥ 90%** das denúncias corretamente encaminhadas                         |
| **Permitir o acompanhamento das denúncias**   | Denúncias com status atualizado                           | **≥ 80%** das denúncias com status atualizado                             |
| **Garantir facilidade de uso**                | Teste com usuários                                        | **≥ 80%** dos usuários conseguem realizar as tarefas principais sem ajuda |

## 10. O que fica depois

- **Quem opera o sistema: Prefeitura, por meio dos setores responsáveis pelo atendimento das denúncias.**
- **Quem mantém tecnicamente: Equipe de TI da prefeitura ou empresa/equipe de desenvolvimento contratada.**
- **Custo mensal estimado: A definir, dependendo da infraestrutura de hospedagem e armazenamento utilizada.**
- **Licença do código: MIT, permitindo que o código seja utilizado, modificado e redistribuído, mantendo os termos da licença.**
