## Plano: Documentação de Engenharia Reversa — ENAMED Check 2026

O diretório `docs/` está vazio (nenhum arquivo foi persistido em sessões anteriores de plan mode). Vou gerar tudo do zero em modo build, baseado no audit técnico já realizado (código-fonte, schema Supabase, testes ao vivo).

### Arquivos a criar

1. **`docs/00-INDICE-QUICK-NAVIGATION.md`** — índice navegável com links para todas as seções.

2. **`docs/00-REVERSE-ENGINEERING-COMPLETO.md`** — guia técnico exaustivo (~50+ páginas) com:
   - **Sumário Executivo** — stack, escopo, principais achados.
   - **Arquitetura** — React 18 + Vite + Tailwind + Supabase (Lovable Cloud); estrutura de pastas; fluxo de dados.
   - **Banco de Dados** — 13 tabelas documentadas (colunas, RLS, relações): `profiles`, `user_stats`, `user_roles`, `user_answers`, `clinical_questions`, `simulado_questions`, `simulado_sessions`, `simulado_answers`, `checklist_progress`, `checklist_notes`, `enamed_dates`, `app_config`.
   - **RPCs & Triggers** — 11 funções documentadas: `submit_answer`, `submit_simulado_answer`, `get_clinical_questions`, `get_daily_challenge`, `get_simulado_questions`, `get_simulado_ranking`, `get_spaced_repetition_questions`, `reset_user_stats`, `has_role`, `handle_new_user`, `update_stats_on_answer`, `validate_answer_correctness`.
   - **Inventário de Rotas** (17): públicas (`/`, `/login`, `/cadastro`, `/recuperar-senha`), protegidas (`/dashboard`, `/checklist`, `/aprovacao`, `/treinamento/:especialidade`, `/simulado`, `/simulado/:level`, `/desafio-diario`, `/revisao`, `/perfil`, `/configuracoes`, `/tutor-ai`), admin (`/admin/datas`, `/admin/questoes`).
   - **Design System** — paleta (primary `#c8413b`), tipografia, tokens semânticos, dark mode, animações festivas.
   - **Lógica de Negócio** — fórmula ENAMED Score (`accuracy*500 + streak_bonus + progress_ratio`), XP (+15 correto / +3 errado), streak diário, níveis clínicos, desafio determinístico do dia, revisão espaçada (até 10 erros).
   - **Módulos** — Simulado (5 níveis × 100 questões, cronômetro, ranking), Aprovação Geral (8 especialidades), Checklist (6 seções), AITutor (atualmente mock).
   - **Segurança** — RLS em todas as tabelas, validação server-side de respostas via RPC, SECURITY DEFINER com `search_path=public`, user_roles em tabela separada.
   - **Bugs & Inconsistências encontrados**:
     - `CommunityComments.tsx` referencia tabela `question_comments` inexistente.
     - `AITutor.tsx` usa lógica mock (hardcoded), não chama `LOVABLE_API_KEY` / Gemini.
     - `clinical_questions` vazia no ambiente atual (migração incompleta).
     - Warnings de `forwardRef` em `LoginPage` e `PublicRoute`.
   - **Top 3 melhorias sugeridas**:
     1. Integrar AITutor real via edge function + `LOVABLE_API_KEY` (Gemini 2.5 Flash).
     2. Criar tabela `question_comments` ou remover componente órfão.
     3. Popular `clinical_questions` e validar trigger `on_auth_user_created` → `handle_new_user`.
   - **Guia de Reconstrução** — passo-a-passo para recriar o app do zero com as melhorias.

### Entrega

Após geração, exibirei:
- Total de páginas/linhas do documento
- Top 3 descobertas
- Top 3 problemas
- Top 3 melhorias

Nenhuma alteração será feita no código da aplicação — apenas criação dos arquivos em `docs/`.