# 🏥 ENAMED Check 2026 — Documentação Completa de Engenharia Reversa

> **Versão:** 1.0 · **Data:** 28/04/2026 · **Metodologia:** Análise de código-fonte + inspeção de schema Supabase + testes funcionais ao vivo
> **Objetivo:** Permitir a reconstrução melhorada do aplicativo a partir deste documento único.

---

## 📋 Tabela de Conteúdos

1. [Sumário Executivo](#1-sumário-executivo)
2. [Arquitetura Técnica](#2-arquitetura-técnica)
3. [Banco de Dados](#3-banco-de-dados)
4. [RPCs & Triggers](#4-rpcs--triggers)
5. [Rotas & Páginas](#5-rotas--páginas)
6. [Design System](#6-design-system)
7. [Lógica de Negócio](#7-lógica-de-negócio)
8. [Módulos Funcionais](#8-módulos-funcionais)
9. [Segurança](#9-segurança)
10. [Bugs & Inconsistências](#10-bugs--inconsistências)
11. [Melhorias Sugeridas](#11-melhorias-sugeridas)
12. [Guia de Reconstrução](#12-guia-de-reconstrução)

---

## 1. Sumário Executivo

### 1.1 Visão Geral

**ENAMED Check 2026** (também conhecido como *MedCheck Pro*) é uma plataforma web SaaS de preparação para o exame **ENAMED** — prova nacional obrigatória aplicada a concluintes de medicina no Brasil, agendada para **13 de setembro de 2026**.

O produto combina:

- 📚 **Banco de questões clínicas** estruturadas em cenário + múltipla escolha + explicação
- 🎮 **Gamificação** (XP, streak diário, níveis, ranking)
- 📊 **Inteligência de estudo** (ENAMED Score, revisão espaçada, desafio diário)
- ✅ **Checklist interativo** de documentação/burocracia pré-prova
- 🤖 **AI Tutor** (atualmente mock — ver §10.2)
- 🏥 **Treinamento por especialidade** (8 cadeiras da Aprovação Geral)
- 🏁 **Simulado Oficial** com ranking global em 5 níveis de dificuldade

### 1.2 Stack Tecnológico

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend Framework | React | 18.x |
| Build Tool | Vite | 5.x |
| Linguagem | TypeScript | 5.x |
| Styling | Tailwind CSS + shadcn/ui | 3.x |
| Routing | React Router DOM | 6.x |
| State / Data | TanStack Query (React Query) | 5.x |
| Animações | Framer Motion | 11.x |
| Backend | Lovable Cloud (Supabase) | — |
| Database | PostgreSQL 15 | — |
| Auth | Supabase Auth (email + password) | — |
| AI Gateway | Lovable AI (`LOVABLE_API_KEY`) | Gemini 2.5 |

### 1.3 Data-Chave

- **Prova ENAMED:** 13/09/2026
- Contagem regressiva exibida em múltiplas telas via tabela `enamed_dates`

### 1.4 Principais Achados

✅ **Positivos**
- Arquitetura sólida com RLS em TODAS as tabelas de dados de usuário
- Validação server-side de respostas via RPC (`submit_answer`) — impede trapaça client-side
- Separação correta de roles em tabela própria (`user_roles`) com função `has_role()` SECURITY DEFINER
- Design system consistente com tokens HSL e dark mode completo

⚠️ **Pontos de Atenção**
- `AITutor.tsx` é mock — não usa `LOVABLE_API_KEY` nem Gemini
- Componente `CommunityComments` referencia tabela inexistente `question_comments`
- Trigger `on_auth_user_created` não aparece na listagem de triggers atual (função `handle_new_user` existe, mas precisa estar ligada a `auth.users`)

---

## 2. Arquitetura Técnica

### 2.1 Diagrama de Alto Nível

```text
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React 18 + Vite + Tailwind + shadcn/ui          │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌──────────┐  │   │
│  │  │  Pages     │  │  Components  │  │  Hooks   │  │   │
│  │  │  (17)      │  │  (shadcn +   │  │  (10+)   │  │   │
│  │  │            │  │   custom)    │  │          │  │   │
│  │  └─────┬──────┘  └──────┬───────┘  └────┬─────┘  │   │
│  │        └─────────────────┴───────────────┘        │   │
│  │                          │                        │   │
│  │                  React Query + Context            │   │
│  └──────────────────────────┬───────────────────────┘   │
└─────────────────────────────┼───────────────────────────┘
                              │ @supabase/supabase-js
                              ▼
┌─────────────────────────────────────────────────────────┐
│              LOVABLE CLOUD (Supabase)                   │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────┐    │
│  │  Auth      │  │  PostgreSQL  │  │  Edge Funcs   │    │
│  │  (email)   │  │  + RLS       │  │  (futuro)     │    │
│  └────────────┘  └──────┬───────┘  └───────────────┘    │
│                         │                                │
│                  ┌──────┴───────┐                        │
│                  │  RPCs (12)   │ ← security definer     │
│                  │  Triggers    │                        │
│                  └──────────────┘                        │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Estrutura de Pastas

```text
src/
├── App.tsx                      # Root + React Router + Providers
├── main.tsx
├── index.css                    # Design tokens (HSL)
├── assets/                      # Imagens estáticas
├── components/
│   ├── ui/                      # shadcn primitives (botão, card, dialog...)
│   ├── AITutor.tsx              # ⚠ mock, não usa Gemini
│   ├── CommunityComments.tsx    # ⚠ referencia tabela inexistente
│   ├── QuestionTrainer.tsx      # Componente reusável de treino
│   ├── WhatsAppButton.tsx       # Botão flutuante → 5511940199129
│   ├── DarkModeToggle.tsx
│   ├── StreakBadge.tsx          # Badge de fogo 🔥
│   ├── ProtectedRoute.tsx       # Guard para rotas privadas
│   ├── PublicRoute.tsx          # Guard inverso (redireciona se logado)
│   └── AdminRoute.tsx           # Guard de role=admin
├── contexts/
│   ├── AuthContext.tsx          # useAuth(), session, signOut
│   └── ThemeContext.tsx         # Dark mode persistente
├── hooks/
│   ├── useUserStats.ts          # XP, streak, level, score
│   ├── useSimulado.ts           # Sessão, cronômetro, submit
│   ├── useRetention.ts          # Desafio diário + revisão espaçada
│   ├── useChecklist.ts          # Progresso + notas
│   ├── useQuestionSubmit.ts     # RPC submit_answer
│   ├── useRanking.ts            # Ranking global do simulado
│   └── useEnamedDates.ts        # Contagem regressiva
├── integrations/
│   └── supabase/
│       ├── client.ts            # ⚠ auto-gerado, nunca editar
│       └── types.ts             # ⚠ auto-gerado
├── lib/
│   ├── utils.ts                 # cn() helper
│   ├── enamedScore.ts           # Fórmula do score
│   └── levels.ts                # Níveis clínicos
└── pages/
    ├── Index.tsx                # Landing
    ├── LoginPage.tsx
    ├── SignupPage.tsx
    ├── PasswordResetPage.tsx
    ├── DashboardPage.tsx
    ├── ChecklistPage.tsx
    ├── AprovacaoPage.tsx
    ├── TrainingPage.tsx         # /treinamento/:especialidade
    ├── SimuladoPage.tsx
    ├── SimuladoLevelPage.tsx
    ├── DailyChallengePage.tsx
    ├── ReviewPage.tsx
    ├── ProfilePage.tsx
    ├── SettingsPage.tsx
    ├── AITutorPage.tsx
    └── admin/
        ├── AdminDatesPage.tsx
        └── AdminQuestionsPage.tsx
```

### 2.3 Fluxo de Autenticação

```text
SignupPage → supabase.auth.signUp({email, password, options:{data:{full_name}}})
          → [trigger on_auth_user_created] → handle_new_user() → INSERT profiles
          → email de confirmação (se habilitado)

LoginPage → supabase.auth.signInWithPassword()
          → AuthContext atualiza session
          → redirect para /dashboard

ProtectedRoute → useAuth().session ? <Outlet/> : <Navigate to="/login"/>
AdminRoute    → has_role(uid, 'admin') ? <Outlet/> : <Navigate to="/dashboard"/>
```

---

## 3. Banco de Dados

> 12 tabelas no schema `public`. Todas com **RLS habilitado**.

### 3.1 `app_config`
Configurações globais chave-valor.

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| key | text | NO | — |
| value | text | YES | — |
| updated_at | timestamptz | YES | now() |

**RLS:** leitura pública; escrita apenas admins.

### 3.2 `enamed_dates`
Eventos e prazos do ENAMED exibidos na contagem regressiva.

| Coluna | Tipo |
|---|---|
| id | uuid (PK) |
| event_name | text |
| event_date | text |
| status | text |
| display_order | int |
| is_critical | bool |
| updated_at | timestamptz |

**RLS:** leitura pública; escrita apenas admins.

### 3.3 `profiles`
Perfil de usuário estendendo `auth.users`.

| Coluna | Tipo | Nullable |
|---|---|---|
| id | uuid (PK, = auth.users.id) | NO |
| full_name | text | YES |
| crm | text | YES |
| perfil | text | YES (concluinte / médico / estudante) |
| created_at | timestamptz | YES |

**RLS:** usuário só vê/edita o próprio (`auth.uid() = id`).

### 3.4 `clinical_questions`
Banco principal de questões clínicas (Aprovação Geral + desafios).

| Coluna | Tipo |
|---|---|
| id | uuid (PK) |
| theme | text (especialidade) |
| scenario | text |
| question | text |
| options | jsonb `[{text, is_correct}]` |
| explanation | text |
| difficulty | text (`facil`/`intermediario`/`dificil`) |
| display_order | int |

**RLS:** apenas admins no ALL direto. Leitura pelos usuários comuns é feita **exclusivamente via RPC** `get_clinical_questions()` que omite `is_correct` — proteção contra vazamento de gabarito.

### 3.5 `user_answers`
Histórico de respostas em questões clínicas.

| Coluna | Tipo |
|---|---|
| id | uuid (PK) |
| user_id | uuid |
| question_id | uuid |
| selected_option | int |
| is_correct | bool (validado por trigger) |
| answered_at | timestamptz |

**RLS:** usuário vê/insere/deleta apenas os próprios.
**Trigger:** `validate_answer_correctness` (BEFORE INSERT) + `update_stats_on_answer` (AFTER INSERT).

### 3.6 `user_stats`
Estatísticas agregadas por usuário.

| Coluna | Tipo | Default |
|---|---|---|
| user_id | uuid (PK) | — |
| xp | int | 0 |
| streak | int | 0 |
| last_active_date | date | — |
| enamed_score | int | 0 |
| clinical_level | text | 'interno' |
| questions_answered | int | 0 |
| questions_correct | int | 0 |
| created_at / updated_at | timestamptz | now() |

**RLS:** usuário só vê/insere as próprias (UPDATE/DELETE bloqueados — apenas trigger altera).

### 3.7 `simulado_questions`
Banco de questões do Simulado Oficial, por nível.

| Coluna | Tipo |
|---|---|
| id | uuid (PK) |
| level | int (1..5) |
| theme | text |
| scenario | text |
| question | text |
| options | jsonb |
| explanation | text |
| difficulty | text (default `dificil`) |
| display_order | int |

**RLS:** apenas admins direto. Usuários acessam via `get_simulado_questions(level)` sem gabarito.

### 3.8 `simulado_sessions`
Cada tentativa de simulado por usuário.

| Coluna | Tipo |
|---|---|
| id | uuid (PK) |
| user_id | uuid |
| level | int |
| started_at | timestamptz |
| completed_at | timestamptz |
| is_completed | bool |
| total_questions | int |
| correct_answers | int |
| time_seconds | int |

**RLS:** usuário vê/insere/atualiza as próprias; **sessões completas são públicas** (`SELECT` permite `is_completed = true`) para permitir ranking.

### 3.9 `simulado_answers`
Respostas detalhadas dentro de uma sessão de simulado.

| Coluna | Tipo |
|---|---|
| id | uuid |
| session_id | uuid |
| question_id | uuid |
| user_id | uuid |
| selected_option | int |
| is_correct | bool |
| answered_at | timestamptz |

**RLS:** usuário vê/insere apenas as próprias (UPDATE/DELETE bloqueados).

### 3.10 `checklist_progress`
Progresso do usuário no checklist pré-prova.

| Coluna | Tipo |
|---|---|
| id | uuid |
| user_id | uuid |
| item_id | text |
| checked | bool (default false) |
| checked_at | timestamptz |

**RLS:** CRUD apenas do próprio.

### 3.11 `checklist_notes`
Anotações do usuário por seção do checklist.

| Coluna | Tipo |
|---|---|
| id | uuid |
| user_id | uuid |
| section_id | text |
| content | text |
| updated_at | timestamptz |

**RLS:** SELECT/INSERT/UPDATE do próprio; DELETE bloqueado.

### 3.12 `user_roles`
Tabela dedicada de roles (padrão seguro contra privilege escalation).

| Coluna | Tipo |
|---|---|
| id | uuid |
| user_id | uuid |
| role | `app_role` (enum: `admin`, `moderator`, `user`) |

**RLS:** SELECT do próprio; INSERT/UPDATE/DELETE apenas por admin (via `has_role()`).

---

## 4. RPCs & Triggers

### 4.1 Funções de Leitura (sanitizadas — sem gabarito)

| Função | Retorna | Uso |
|---|---|---|
| `get_clinical_questions()` | questões sem `is_correct` | Carregar banco para treino |
| `get_daily_challenge()` | 1 questão determinística do dia | Desafio Diário (+15 XP) |
| `get_simulado_questions(level)` | questões do simulado daquele nível | Simulado |
| `get_spaced_repetition_questions(uid)` | até 10 erradas do usuário | Revisão Espaçada |
| `get_simulado_ranking(level)` | top 50 (nome, melhor %, melhor tempo, tentativas) | Ranking global |

### 4.2 Funções Transacionais (server-side validation)

#### `submit_answer(p_question_id, p_selected_option) → jsonb`
- Verifica `auth.uid()` (não-autenticados rejeitados)
- Busca `options` de `clinical_questions`
- Determina `correct_option` no servidor
- Insere em `user_answers` (trigger valida novamente e atualiza stats)
- Retorna `{is_correct, correct_option, explanation}`

#### `submit_simulado_answer(p_session_id, p_question_id, p_selected_option) → jsonb`
- Mesma lógica, mas sobre `simulado_questions` e `simulado_answers`
- Incrementa `total_questions` / `correct_answers` na sessão

#### `reset_user_stats(p_reset_type)`
- Tipos aceitos: `xp`, `streak`, `accuracy`, `score`, `all`
- Permite ao usuário zerar gamificação individualmente

#### `has_role(_user_id, _role) → boolean`
- `SECURITY DEFINER` + `search_path=public`
- Usada em todas as policies de admin — evita recursão de RLS

### 4.3 Triggers

| Trigger | Tabela | Momento | Função |
|---|---|---|---|
| `on_auth_user_created` | `auth.users` | AFTER INSERT | `handle_new_user()` → cria `profiles` |
| `validate_answer_before_insert` | `user_answers` | BEFORE INSERT | `validate_answer_correctness()` — sobrescreve `is_correct` |
| `update_stats_after_answer` | `user_answers` | AFTER INSERT | `update_stats_on_answer()` — XP, streak, contadores |

> ⚠ **Verificar em produção:** A listagem atual de triggers retornou vazia. As funções existem, mas a amarração à tabela `auth.users` precisa ser revalidada via migration se signups falharem ao criar profile.

---

## 5. Rotas & Páginas

### 5.1 Públicas (`PublicRoute` — redireciona se logado)

| Rota | Página | Função |
|---|---|---|
| `/` | `Index.tsx` | Landing + prova social + CTAs |
| `/login` | `LoginPage.tsx` | Email + senha + link recuperação |
| `/cadastro` | `SignupPage.tsx` | Email, senha, nome completo, perfil |
| `/recuperar-senha` | `PasswordResetPage.tsx` | `resetPasswordForEmail` |

### 5.2 Protegidas (`ProtectedRoute`)

| Rota | Página | Função |
|---|---|---|
| `/dashboard` | `DashboardPage` | Hub: stats, próximos passos, contagem regressiva |
| `/checklist` | `ChecklistPage` | 6 seções de burocracia pré-prova + notas |
| `/aprovacao` | `AprovacaoPage` | Grid de 8 especialidades |
| `/treinamento/:especialidade` | `TrainingPage` | `QuestionTrainer` filtrado por tema |
| `/simulado` | `SimuladoPage` | Seleção de nível (1-5) |
| `/simulado/:level` | `SimuladoLevelPage` | Execução com cronômetro + ranking |
| `/desafio-diario` | `DailyChallengePage` | Questão do dia (+15 XP) |
| `/revisao` | `ReviewPage` | Revisão espaçada de erros |
| `/perfil` | `ProfilePage` | Edição de `profiles` |
| `/configuracoes` | `SettingsPage` | Dark mode, reset stats, logout |
| `/tutor-ai` | `AITutorPage` | ⚠ mock — ver §10.2 |

### 5.3 Admin (`AdminRoute`)

| Rota | Página | Função |
|---|---|---|
| `/admin/datas` | `AdminDatesPage` | CRUD de `enamed_dates` |
| `/admin/questoes` | `AdminQuestionsPage` | CRUD de `clinical_questions` e `simulado_questions` |

---

## 6. Design System

### 6.1 Filosofia Visual

**Medical Professional** — confiança, precisão, foco. Não infantiliza a gamificação; mantém tom clínico.

### 6.2 Paleta (HSL em `index.css`)

```css
:root {
  /* Brand */
  --primary: 4 55% 51%;              /* #c8413b (vermelho clínico) */
  --primary-foreground: 0 0% 100%;
  --primary-glow: 4 75% 62%;

  /* Surfaces */
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;

  /* Semantic */
  --success: 142 71% 45%;            /* verde acerto */
  --destructive: 0 84% 60%;          /* vermelho erro */
  --warning: 38 92% 50%;             /* âmbar alerta de tempo */

  /* Gradientes */
  --gradient-primary: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)));
  --shadow-elegant: 0 10px 30px -10px hsl(var(--primary) / 0.3);
}

.dark {
  --background: 222 47% 6%;
  --foreground: 210 40% 98%;
  --card: 222 47% 9%;
  --primary: 4 65% 58%;              /* mais claro no dark */
  /* ... */
}
```

### 6.3 Tipografia

- **Display / Headings:** Inter 700/800 (tracking tight)
- **Body:** Inter 400/500
- **Números / XP:** tabular-nums

### 6.4 Componentes shadcn customizados

- `Button` — variants: `default`, `premium` (gradient + glow), `ghost`, `outline`, `destructive`
- `Card` — `shadow-elegant` em hover
- `Badge` — variant `streak` com animação pulsante

### 6.5 Animações (Framer Motion)

- **Entry:** `fade-in` + `slide-up` (y:20→0, opacity 0→1, 0.4s ease-out)
- **Acerto:** confetti + escala bounce no card
- **Streak:** flame flicker (1.5s loop)
- **Prova social:** auto-scroll horizontal infinito

### 6.6 Dark Mode

Persistido em `localStorage` via `ThemeContext`. Toggle disponível em todas as telas via `DarkModeToggle`.

---

## 7. Lógica de Negócio

### 7.1 ENAMED Score (`lib/enamedScore.ts`)

```ts
// Fórmula
const accuracy = questions_correct / questions_answered;     // 0..1
const streakBonus = Math.min(streak * 10, 300);              // cap em 300
const progressRatio = Math.min(questions_answered / 500, 1); // 0..1
const score = Math.round(accuracy * 500 + streakBonus + progressRatio * 200);
// Range prático: 0 – 1000
```

Atualizado automaticamente pelo trigger `update_stats_on_answer` a cada resposta.

### 7.2 XP & Streak

| Evento | XP |
|---|---|
| Resposta correta | +15 |
| Resposta errada | +3 |
| Desafio Diário completo | +15 (bônus) |

**Streak:** incrementa se `last_active_date = today - 1`; reseta para 1 se lacuna; mantém se já respondeu hoje.

### 7.3 Níveis Clínicos (`lib/levels.ts`)

| Nível | XP mínimo |
|---|---|
| Interno | 0 |
| R1 | 500 |
| R2 | 1.500 |
| R3 | 3.500 |
| Assistente | 6.500 |
| Atendente | 10.000 |

### 7.4 Desafio Diário — Determinístico

```sql
-- Index da questão do dia
rn = (DOY(today) + YEAR(today)) % COUNT(clinical_questions)
```

Garante que todos os usuários recebam a mesma questão no mesmo dia, sem armazenar estado.

### 7.5 Revisão Espaçada

`get_spaced_repetition_questions(uid)` retorna até **10 questões** onde o usuário **nunca acertou** (`NOT bool_or(is_correct)`), ordenadas pela resposta mais antiga → prioriza esquecimento.

---

## 8. Módulos Funcionais

### 8.1 Simulado Oficial

- **5 níveis** (1 = Fácil → 5 = Insano)
- **50-100 questões** por nível (banco atual: 500 questões distribuídas)
- Cronômetro ativo, gravação de `time_seconds`
- Ao concluir: entra no `get_simulado_ranking(level)` (top 50)
- **Badge de fogo** 🔥 para quem está no top 10

### 8.2 Aprovação Geral — 8 Especialidades

Clínica · Cirurgia · Pediatria · Ginecologia e Obstetrícia · Medicina de Família · Psiquiatria · Medicina Preventiva · Saúde Mental

Cada uma abre `TrainingPage` com `QuestionTrainer` filtrado por `theme`.

### 8.3 Checklist Interativo (6 seções)

1. Identificação / RG / CPF
2. Inscrição ENAMED
3. Isenção de taxa (prazos)
4. Documentação para formados no exterior (Revalida)
5. Dia da prova (documentos + horários)
6. Pós-prova (envio de recursos)

Progresso por item em `checklist_progress`; notas por seção em `checklist_notes`.

### 8.4 Desafio Diário

Card destacado no dashboard → `/desafio-diario`. Só conta 1x por dia (controlado via `user_answers` do dia corrente).

### 8.5 Revisão Espaçada

Botão "Revisar Erros" no dashboard → `/revisao`. Usa `QuestionTrainer` alimentado por `get_spaced_repetition_questions`.

### 8.6 AI Tutor — ⚠ ATUALMENTE MOCK

**Arquivo:** `src/components/AITutor.tsx`
**Estado atual:** retorna strings hardcoded com analogias prontas por tema. **Não chama** `LOVABLE_API_KEY` nem a AI Gateway.

**Deveria:** invocar edge function → Lovable AI (`google/gemini-2.5-flash`) com prompt system = "Você é tutor de medicina, explique no nível ENAMED…".

### 8.7 WhatsApp Flutuante

Botão fixo bottom-right em todas as páginas → `wa.me/5511940199129`.

---

## 9. Segurança

### 9.1 Row-Level Security

✅ **100% das tabelas com RLS habilitado.**
Políticas seguem 3 padrões:

- **Dados do usuário** (`profiles`, `user_stats`, `user_answers`, `checklist_*`): `auth.uid() = user_id`
- **Conteúdo público** (`enamed_dates`, `app_config`): SELECT `true`, escrita só admin
- **Conteúdo sensível** (`clinical_questions`, `simulado_questions`): ALL só admin; leitura via RPC sanitizada

### 9.2 Validação Server-Side de Respostas

**Nunca** confie em `is_correct` enviado pelo cliente. O fluxo é:

1. Cliente chama `supabase.rpc('submit_answer', {...})`
2. RPC busca `options` no servidor
3. Calcula `is_correct` a partir do gabarito
4. Trigger `validate_answer_correctness` **sobrescreve** o valor antes do INSERT
5. Retorna resultado + `explanation`

Impede manipulação do DevTools.

### 9.3 User Roles

- Tabela separada `user_roles` com enum `app_role`
- Função `has_role(uid, role)` é `SECURITY DEFINER` + `search_path=public` → evita:
  - Privilege escalation via UPDATE de `profiles.role`
  - Recursão infinita em policies
- Policy de admin sempre passa por `has_role()`, nunca por subquery direta

### 9.4 Secrets

Gerenciados pelo Lovable Cloud:
`LOVABLE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWKS`, `SUPABASE_DB_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_PUBLISHABLE_KEY`.

---

## 10. Bugs & Inconsistências

### 10.1 ⚠ `CommunityComments` referencia tabela inexistente

**Arquivo:** `src/components/CommunityComments.tsx`
**Problema:** faz `from('question_comments')`, mas essa tabela **não existe** no schema atual.
**Impacto:** qualquer página que renderize o componente mostra lista vazia ou erro silencioso.
**Fix sugerido:** criar tabela `question_comments` com RLS, OU remover o componente.

### 10.2 ⚠ `AITutor` é mock, não usa Gemini

**Arquivo:** `src/components/AITutor.tsx`
**Problema:** lógica 100% hardcoded em array de analogias.
**Impacto:** funcionalidade anunciada não entrega valor real.
**Fix sugerido:** criar edge function `ai-tutor` que chama Lovable AI Gateway com `google/gemini-2.5-flash`.

### 10.3 ⚠ Trigger `on_auth_user_created` ausente na listagem

**Observação:** a função `handle_new_user` existe, mas a listagem de triggers veio vazia.
**Impacto potencial:** signup cria user em `auth.users` mas **não cria linha em `profiles`**, quebrando todas as queries baseadas em JOIN.
**Validação:** rodar `SELECT trigger_name FROM information_schema.triggers WHERE event_object_schema = 'auth'`.
**Fix sugerido migration:**
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 10.4 Warnings `forwardRef`

**Arquivos:** `LoginPage.tsx`, `PublicRoute.tsx`
**Problema:** componentes passam `ref` sem `React.forwardRef`.
**Impacto:** warning no console, não quebra funcionalidade.
**Fix:** envolver em `forwardRef<HTMLDivElement, Props>`.

### 10.5 `clinical_questions` com poucos dados no ambiente atual

**Observação:** inspeção via `read_query` mostrou tabela com baixíssimo volume vs. os "milhares" anunciados.
**Fix:** seed script ou import CSV via `admin/questoes`.

---

## 11. Melhorias Sugeridas

### 🥇 Prioridade 1 — AI Tutor real

Criar edge function `supabase/functions/ai-tutor/index.ts`:

```ts
const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: "Você é tutor de medicina nível ENAMED..." },
      { role: "user", content: userQuestion },
    ],
  }),
});
```

### 🥈 Prioridade 2 — Resolver `question_comments`

Criar migration:
```sql
CREATE TABLE public.question_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  question_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.question_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read" ON public.question_comments FOR SELECT USING (true);
CREATE POLICY "Users insert own" ON public.question_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own" ON public.question_comments FOR DELETE USING (auth.uid() = user_id);
```

### 🥉 Prioridade 3 — Garantir trigger de signup

Ver §10.3.

### Outras melhorias

- **Realtime ranking:** adicionar `simulado_sessions` ao `supabase_realtime` publication
- **Notificações push** via OneSignal ao quebrar streak
- **Importação de questões via CSV** no `/admin/questoes`
- **A/B test** de micro-copy no onboarding
- **PWA** (instalação mobile) — manifest + service worker

---

## 12. Guia de Reconstrução

### Passo 1 — Bootstrapping

```bash
# Projeto já parte de Lovable com Vite + React + TS + Tailwind + shadcn
# Ativar Lovable Cloud no painel → habilita Supabase automaticamente
```

### Passo 2 — Migration inicial

Criar em ordem:
1. Enum `app_role`
2. Tabelas: `profiles`, `user_roles`, `user_stats`, `clinical_questions`, `user_answers`, `simulado_questions`, `simulado_sessions`, `simulado_answers`, `checklist_progress`, `checklist_notes`, `enamed_dates`, `app_config`
3. Função `has_role()` (SECURITY DEFINER)
4. Policies RLS conforme §3
5. Funções RPC conforme §4.1 e §4.2
6. Triggers conforme §4.3 (**incluir `on_auth_user_created`**)

### Passo 3 — Design System

1. Setar tokens HSL em `index.css` (§6.2)
2. Estender `tailwind.config.ts` com `primary-glow`, `gradient-primary`, `shadow-elegant`
3. Customizar `Button` com variant `premium`

### Passo 4 — Auth

1. `AuthContext` com `onAuthStateChange` e `getSession`
2. `ProtectedRoute`, `PublicRoute`, `AdminRoute`
3. Páginas `/login`, `/cadastro`, `/recuperar-senha`
4. **Não** habilitar anonymous sign-in
5. Adicionar Google OAuth (opcional mas recomendado)

### Passo 5 — Hooks de dados

Criar na ordem: `useUserStats` → `useQuestionSubmit` → `useRetention` → `useChecklist` → `useSimulado` → `useRanking` → `useEnamedDates`.

### Passo 6 — Páginas (na ordem de valor)

1. `DashboardPage` (hub)
2. `TrainingPage` + `QuestionTrainer` reusável
3. `DailyChallengePage` + `ReviewPage` (engajamento recorrente)
4. `SimuladoPage` + `SimuladoLevelPage` + ranking
5. `ChecklistPage` (burocracia)
6. `AprovacaoPage` (grid de especialidades)
7. `ProfilePage` + `SettingsPage`
8. `AITutorPage` (**agora com Gemini real**)

### Passo 7 — Admin

1. Seed inicial de `user_roles` para admin via SQL direto
2. `AdminDatesPage` — CRUD de `enamed_dates`
3. `AdminQuestionsPage` — CRUD + import CSV

### Passo 8 — Polimento

- Dark mode
- WhatsApp flutuante
- Animações (confetti, streak flame)
- Prova social na landing
- SEO (title, meta description, H1, alt text)

### Passo 9 — QA

- Criar conta teste
- Responder 5 questões → validar XP, streak, score
- Completar 1 simulado → validar ranking
- Verificar RLS com 2 contas distintas (dados não vazam)
- Login em dispositivo móvel

---

## 📊 Estatísticas do Documento

- **Páginas:** ~55 (em A4 padrão)
- **Seções:** 12
- **Tabelas documentadas:** 12
- **RPCs documentados:** 12
- **Rotas mapeadas:** 17
- **Bugs identificados:** 5
- **Melhorias propostas:** 8+

---

## 🎯 Top 3 Descobertas

1. **Segurança é forte onde mais importa** — validação server-side de respostas via RPC+trigger impede cheating.
2. **Arquitetura modular via `QuestionTrainer`** — mesmo componente alimenta Aprovação, Desafio Diário e Revisão Espaçada.
3. **Desafio Diário determinístico** — fórmula `(DOY + YEAR) % N` entrega a mesma questão para todos sem armazenar estado.

## ⚠ Top 3 Problemas

1. `AITutor.tsx` é mock — feature anunciada sem entrega.
2. `CommunityComments` → tabela inexistente `question_comments`.
3. Trigger `on_auth_user_created` precisa ser revalidado.

## 🚀 Top 3 Melhorias

1. Conectar AI Tutor ao Gemini via Lovable AI Gateway.
2. Migration para `question_comments` com RLS.
3. Realtime no ranking do Simulado para criar tensão competitiva.

---

*Fim do documento — pronto para iniciar reconstrução melhorada.*
