# 📑 Índice de Navegação Rápida — ENAMED Check 2026

> Documento companheiro do [`00-REVERSE-ENGINEERING-COMPLETO.md`](./00-REVERSE-ENGINEERING-COMPLETO.md).
> Use este índice para pular direto para a seção desejada.

---

## 🗂️ Seções Principais

| # | Seção | O que contém |
|---|---|---|
| 1 | [Sumário Executivo](./00-REVERSE-ENGINEERING-COMPLETO.md#1-sumário-executivo) | Visão geral, stack, data-chave da prova |
| 2 | [Arquitetura Técnica](./00-REVERSE-ENGINEERING-COMPLETO.md#2-arquitetura-técnica) | Frontend, backend, estrutura de pastas |
| 3 | [Banco de Dados](./00-REVERSE-ENGINEERING-COMPLETO.md#3-banco-de-dados) | 12 tabelas, colunas, RLS |
| 4 | [RPCs & Triggers](./00-REVERSE-ENGINEERING-COMPLETO.md#4-rpcs--triggers) | 12 funções SQL documentadas |
| 5 | [Rotas & Páginas](./00-REVERSE-ENGINEERING-COMPLETO.md#5-rotas--páginas) | 17 rotas mapeadas |
| 6 | [Design System](./00-REVERSE-ENGINEERING-COMPLETO.md#6-design-system) | Cores, tipografia, tokens, dark mode |
| 7 | [Lógica de Negócio](./00-REVERSE-ENGINEERING-COMPLETO.md#7-lógica-de-negócio) | ENAMED Score, XP, Streak, Níveis |
| 8 | [Módulos Funcionais](./00-REVERSE-ENGINEERING-COMPLETO.md#8-módulos-funcionais) | Simulado, Aprovação, Checklist, AI Tutor |
| 9 | [Segurança](./00-REVERSE-ENGINEERING-COMPLETO.md#9-segurança) | RLS, RPCs server-side, user_roles |
| 10 | [Bugs & Inconsistências](./00-REVERSE-ENGINEERING-COMPLETO.md#10-bugs--inconsistências) | Problemas detectados em audit |
| 11 | [Melhorias Sugeridas](./00-REVERSE-ENGINEERING-COMPLETO.md#11-melhorias-sugeridas) | Roadmap técnico |
| 12 | [Guia de Reconstrução](./00-REVERSE-ENGINEERING-COMPLETO.md#12-guia-de-reconstrução) | Passo-a-passo from scratch |

---

## 🔍 Referência Rápida por Tema

### Autenticação
- Fluxo de login/signup → §2.3, §5.1
- RLS e user_roles → §9.1, §3.12
- Recuperação de senha → §5.1

### Gamificação
- ENAMED Score (fórmula) → §7.1
- XP e Streak → §7.2
- Níveis clínicos (interno → atendente) → §7.3
- Desafio Diário → §8.4
- Revisão Espaçada → §8.5

### Conteúdo Clínico
- Clinical Questions → §3.4
- Simulado (5 níveis) → §8.1
- Aprovação Geral (8 especialidades) → §8.2
- AI Tutor → §8.6

### Admin
- Gestão de datas → §5.3
- Gestão de questões → §5.3
- Tabela `app_config` → §3.1

---

## ⚠️ Top 3 Achados Críticos

1. **`AITutor.tsx` é mock** — não chama Gemini. Ver §10.2.
2. **`CommunityComments` referencia tabela inexistente** → `question_comments`. Ver §10.1.
3. **Trigger `on_auth_user_created` precisa ser validado** no ambiente ativo. Ver §10.3.

---

*Última atualização: 28/04/2026 · Versão: 1.0*
