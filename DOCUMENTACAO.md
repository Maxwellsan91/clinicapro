# 📋 Documentação do Sistema — ClinicaPro

> **Data de geração:** 2 de Junho de 2026  
> **Versão:** 0.1.0  
> **Ambiente:** Next.js 16 · React 19 · TypeScript · Prisma 7 · Supabase · PostgreSQL

---

## 📑 Índice

1. [Visão Geral do Projecto](#1-visão-geral-do-projecto)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitectura do Sistema](#3-arquitectura-do-sistema)
4. [Base de Dados — Modelo de Dados](#4-base-de-dados--modelo-de-dados)
5. [Autenticação e Autorização](#5-autenticação-e-autorização)
6. [Módulos Desenvolvidos](#6-módulos-desenvolvidos)
   - [6.1 Dashboard](#61-dashboard)
   - [6.2 Agendamentos](#62-agendamentos)
   - [6.3 Clientes](#63-clientes)
   - [6.4 Colaboradores](#64-colaboradores)
   - [6.5 Serviços](#65-serviços)
   - [6.6 Pagamentos](#66-pagamentos)
   - [6.7 Comissões](#67-comissões)
   - [6.8 Notificações](#68-notificações)
   - [6.9 Auditoria](#69-auditoria)
   - [6.10 Utilizadores](#610-utilizadores)
7. [Landing Page](#7-landing-page)
8. [Infra-estrutura e Serviços](#8-infra-estrutura-e-serviços)
9. [Estrutura de Ficheiros](#9-estrutura-de-ficheiros)
10. [Rotas da Aplicação](#10-rotas-da-aplicação)
11. [Server Actions — Resumo](#11-server-actions--resumo)
12. [Componentes de UI](#12-componentes-de-ui)
13. [Padrões e Convenções](#13-padrões-e-convenções)

---

## 1. Visão Geral do Projecto

O **ClinicaPro** é um sistema de gestão para clínicas de saúde e bem-estar (fisioterapia, pilates, massagem, osteopatia, etc.). Permite gerir o dia-a-dia de uma clínica a partir de uma única plataforma web:

- Agenda com calendário interactivo
- Gestão de clientes, colaboradores e serviços
- Controlo de pagamentos e facturas
- Cálculo e monitorização de comissões
- Sistema de notificações por e-mail (lembretes, cancelamentos, pagamentos)
- Log de auditoria de todas as operações
- Gestão de utilizadores do sistema com controlo de acessos (admin / user)
- Dashboard analítico com KPIs e gráficos

A aplicação suporta **multi-tenant** — cada clínica tem o seu `tenantId` isolado. Actualmente em modo demo com `TENANT_ID = "tenant-demo"`.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.2.6 |
| UI Library | React | 19.2.4 |
| Linguagem | TypeScript | ^5.9.3 |
| Estilos | Tailwind CSS | ^4 |
| Animações | Framer Motion | ^12 |
| ORM | Prisma | ^7.8 |
| Adaptador BD | `@prisma/adapter-pg` | ^7.8 |
| Base de Dados | PostgreSQL (via Supabase) | — |
| Autenticação | Supabase Auth (`@supabase/ssr`) | ^0.10 |
| Email | Resend | ^6.12 |
| Calendário | FullCalendar (React) | ^6.1 |
| Gráficos | Recharts | ^3.8 |
| Validação | Zod | ^4.4 |
| Ícones | Lucide React | ^1.16 |
| Toasts | Sonner | ^2.0 |
| Utilitários CSS | clsx + tailwind-merge | — |
| Seed / Scripts | tsx | ^4.22 |
| Deploy | Vercel | — |

---

## 3. Arquitectura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        NEXT.JS APP                          │
│                                                             │
│  ┌──────────────────┐   ┌─────────────────────────────┐    │
│  │   Landing Page   │   │    Área de Administração     │    │
│  │   (público)      │   │    /(admin)/*                │    │
│  └──────────────────┘   └─────────────────────────────┘    │
│                                   │                         │
│              ┌────────────────────┘                         │
│              ▼                                              │
│  ┌───────────────────────────┐                             │
│  │     Server Actions        │  (use server)               │
│  │  features/*/actions.ts    │                             │
│  └─────────────┬─────────────┘                             │
│                │                                            │
│  ┌─────────────▼─────────────┐                             │
│  │      Repositories         │                             │
│  │  features/*/repository.ts │                             │
│  └─────────────┬─────────────┘                             │
│                │                                            │
│  ┌─────────────▼─────────────┐                             │
│  │      Prisma Client        │  → PostgreSQL (Supabase)    │
│  └───────────────────────────┘                             │
│                                                             │
│  ┌───────────────────────────┐                             │
│  │   Supabase Auth           │  → JWT · Sessions · SSR     │
│  └───────────────────────────┘                             │
│                                                             │
│  ┌───────────────────────────┐                             │
│  │   Notification Service    │  → Resend (emails)          │
│  │   + Cron Job (1h)         │                             │
│  └───────────────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

### Middleware

O ficheiro `src/middleware.ts` intercepta todas as rotas (excepto assets estáticos) e chama `updateSession` do Supabase para renovar/validar a sessão em SSR. Protege as rotas de administração redirecionando utilizadores não autenticados para `/login`.

---

## 4. Base de Dados — Modelo de Dados

### Diagrama de Entidades

```
Tenant (1) ──── (N) Client
Tenant (1) ──── (N) Collaborator
Tenant (1) ──── (N) Service
Tenant (1) ──── (N) Appointment
Tenant (1) ──── (N) Payment

Appointment (N) ──── (1) Client
Appointment (N) ──── (1) Collaborator
Appointment (N) ──── (1) Service
Appointment (1) ──── (N) Payment

Notification   (independente, indexada por tenantId e appointmentId)
AuditLog       (independente, indexada por tenantId, userId, entity)
```

### Tabelas

#### `Tenant`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String (cuid) | Identificador único |
| name | String | Nome da clínica |
| slug | String (unique) | Identificador URL |
| createdAt / updatedAt | DateTime | Timestamps |

#### `Client`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String (cuid) | PK |
| tenantId | String | FK → Tenant |
| name | String | Nome completo |
| email | String? | E-mail |
| phone | String? | Telefone |
| birthDate | DateTime? | Data de nascimento |
| cpf | String? | NIF / CPF |
| address | String? | Morada |
| notes | String? | Observações clínicas |
| isDeleted / deletedAt | Boolean / DateTime? | Soft delete |

#### `Collaborator`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String (cuid) | PK |
| tenantId | String | FK → Tenant |
| name | String | Nome completo |
| email | String? | E-mail |
| phone | String? | Telefone |
| role | String | Cargo (ex: Fisioterapeuta) |
| specialty | String? | Especialidade |
| commissionRate | Decimal(5,2)? | Taxa de comissão (%) |
| isDeleted / deletedAt | Boolean / DateTime? | Soft delete |

#### `Service`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String (cuid) | PK |
| tenantId | String | FK → Tenant |
| name | String | Nome do serviço |
| description | String? | Descrição |
| duration | Int | Duração em minutos |
| price | Decimal(10,2) | Preço |
| category | String? | Categoria |
| isActive | Boolean | Activo / inactivo |
| isDeleted / deletedAt | Boolean / DateTime? | Soft delete |

#### `Appointment`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String (cuid) | PK |
| tenantId | String | FK → Tenant |
| clientId | String | FK → Client |
| collaboratorId | String | FK → Collaborator |
| serviceId | String | FK → Service |
| startDateTime | DateTime | Data/hora início |
| endDateTime | DateTime | Data/hora fim |
| status | String | `scheduled` \| `completed` \| `cancelled` \| `no_show` |
| notes | String? | Notas |
| isDeleted / deletedAt | Boolean / DateTime? | Soft delete |

#### `Payment`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String (cuid) | PK |
| tenantId | String | FK → Tenant |
| clientId | String | FK → Client |
| appointmentId | String? | FK → Appointment (opcional) |
| amount | Decimal(10,2) | Valor |
| paymentMethod | String? | Método (dinheiro, MB, MB Way, cartão, transferência) |
| status | String | `pending` \| `paid` \| `cancelled` \| `refunded` |
| paidAt | DateTime? | Data de pagamento |
| dueDate | DateTime? | Data de vencimento |
| notes | String? | Notas |
| invoiceStatus | String | `not_issued` \| `issued` \| `cancelled` |
| invoiceExternalUrl | String? | URL da factura externa |
| invoiceNumber | String? | Número da factura |
| isDeleted / deletedAt | Boolean / DateTime? | Soft delete |

#### `Notification`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String (cuid) | PK |
| tenantId | String | Tenant |
| type | String | `appointment_reminder` \| `payment_pending` \| `appointment_cancelled` |
| recipient | String | E-mail do destinatário |
| title | String | Assunto |
| message | String | Mensagem resumida |
| status | String | `pending` \| `sent` \| `failed` \| `cancelled` |
| appointmentId | String? | Referência ao agendamento |
| sentAt | DateTime? | Data de envio |
| errorMessage | String? | Mensagem de erro (se falhou) |

#### `AuditLog`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String (cuid) | PK |
| tenantId | String | Tenant |
| userId | String | ID do utilizador (Supabase) |
| userEmail | String? | E-mail do utilizador |
| action | String | CREATE \| UPDATE \| DELETE \| CANCEL \| MARK_PAID \| MARK_PENDING \| ROLE_CHANGE |
| entity | String | Cliente \| Colaborador \| Servico \| Agendamento \| Pagamento \| Utilizador |
| entityId | String? | ID do registo afectado |
| metadata | Json? | Dados adicionais contextuais |
| createdAt | DateTime | Timestamp |

---

## 5. Autenticação e Autorização

### Autenticação
- Baseada em **Supabase Auth** com SSR via `@supabase/ssr`
- Login com e-mail + palavra-passe
- Sessões geridas via cookies HttpOnly (middleware renova automaticamente)
- Página de login: `/login`
- Callback OAuth: `/auth/callback`

### Roles
| Role | Descrição | Acesso |
|------|-----------|--------|
| `admin` | Administrador | Acesso total — pode gerir utilizadores, colaboradores, pagamentos, comissões |
| `user` | Utilizador normal | Pode criar/editar agendamentos e clientes; sem acesso a pagamentos, colaboradores ou utilizadores |

> O role é armazenado em `user_metadata.role` no Supabase Auth.

### Funções de Auth (`src/features/auth/actions.ts`)
```typescript
getUser()         // Retorna o utilizador autenticado
getUserRole()     // Retorna "admin" | "user"
isAdmin()         // Retorna boolean
loginAction()     // Server Action de login
logoutAction()    // Server Action de logout
```

### Gestão de Utilizadores (`src/features/auth/userActions.ts`)
```typescript
listUsers()              // Lista todos os utilizadores (admin only)
inviteUser()             // Cria novo utilizador com e-mail + role
updateUserRole()         // Altera o role de um utilizador
deleteUser()             // Elimina utilizador (não pode auto-eliminar)
```

---

## 6. Módulos Desenvolvidos

### 6.1 Dashboard

**Rota:** `/dashboard`

#### O que mostra
- **KPIs principais** (cards no topo):
  - Total de clientes activos
  - Total de colaboradores activos
  - Total de serviços activos
  - Agendamentos hoje (total)
  - Receita do mês actual (com variação % vs mês anterior)
  - Pagamentos pendentes (contagem + valor total)

- **Comparação mensal** — variação de agendamentos e receita vs mês anterior

- **Status do dia** — breakdown dos agendamentos de hoje por status (agendado, concluído, cancelado, não compareceu)

- **Taxa de cancelamento** do mês actual

- **Próximas marcações** — lista das próximas 6 consultas agendadas

- **Gráficos** (Recharts):
  - 📊 Faturamento mensal — últimos 6 meses (BarChart)
  - 📈 Atendimentos por dia — últimos 30 dias (AreaChart)
  - 🥧 Top 5 serviços mais usados no mês (PieChart / BarChart)
  - 👥 Top 5 colaboradores com mais atendimentos no mês (BarChart)

#### Ficheiros
- `src/features/dashboard/queries.ts` — query única `getDashboardData()` com 15 queries paralelas
- `src/features/dashboard/components/Charts.tsx` — todos os gráficos
- `src/features/dashboard/components/DashboardSkeleton.tsx` — skeleton de loading
- `src/app/(admin)/dashboard/page.tsx` — Server Component principal

---

### 6.2 Agendamentos

**Rota:** `/agendamentos`

#### Funcionalidades
| Operação | Descrição |
|----------|-----------|
| Listar | Calendário interactivo (FullCalendar) com vistas mês/semana/dia/lista |
| Criar | Formulário em `/agendamentos/novo` ou modal de criação rápida no calendário |
| Editar | Formulário em `/agendamentos/[id]/editar` |
| Ver detalhe | Página `/agendamentos/[id]` com todos os dados |
| Cancelar | Soft cancel com envio automático de e-mail ao cliente |
| Eliminar | Soft delete (flag `isDeleted`) |
| Restaurar | Restauro a partir da vista "Eliminados" |
| Filtrar | Por status, colaborador, serviço, período |

#### Status possíveis
- `scheduled` — Agendado
- `completed` — Concluído
- `cancelled` — Cancelado
- `no_show` — Não compareceu

#### Componentes
| Ficheiro | Descrição |
|----------|-----------|
| `AgendamentoCalendar.tsx` | Calendário FullCalendar com drag & drop de eventos e modal de detalhe |
| `AgendamentoForm.tsx` | Formulário de criação/edição com validação Zod |
| `AgendamentoList.tsx` | Tabela de listagem (usada na vista de eliminados) |
| `AgendamentoFilters.tsx` | Filtros por estado, colaborador, serviço |
| `EventModal.tsx` | Modal de detalhe do evento no calendário |
| `QuickCreateModal.tsx` | Modal de criação rápida ao clicar no calendário |
| `StatusBadge.tsx` | Badge colorido por status |

#### Integrações automáticas
- Ao **criar** → agenda notificação de lembrete 24h antes
- Ao **cancelar** → envia e-mail de cancelamento imediatamente

#### Server Actions (`src/features/agendamentos/actions.ts`)
```typescript
createAgendamentoAction(formData)     // Criar + audit log + notificação
updateAgendamentoAction(id, formData) // Actualizar + audit log
cancelAgendamentoAction(id)           // Cancelar + e-mail ao cliente + audit log
deleteAgendamentoAction(id)           // Soft delete + audit log
restoreAgendamentoAction(id)          // Restaurar + audit log
```

---

### 6.3 Clientes

**Rota:** `/clientes`

#### Funcionalidades
| Operação | Descrição |
|----------|-----------|
| Listar | Tabela com pesquisa e filtros |
| Criar | Formulário em `/clientes/novo` |
| Editar | Formulário em `/clientes/[id]/editar` |
| Ver detalhe | Página `/clientes/[id]` com histórico de agendamentos e notas |
| Eliminar | Soft delete |
| Restaurar | A partir da vista "Eliminados" |
| Notas | Editor de observações clínicas na página de detalhe |

#### Campos do cliente
- Nome, e-mail, telefone, data de nascimento, NIF/CPF, morada, observações

#### Componentes
| Ficheiro | Descrição |
|----------|-----------|
| `ClienteForm.tsx` | Formulário de criação/edição |
| `ClienteList.tsx` | Tabela de listagem com soft delete |
| `ClienteNotes.tsx` | Editor de notas/observações clínicas |

#### Server Actions (`src/features/clientes/actions.ts`)
```typescript
createClienteAction(formData)
updateClienteAction(id, formData)
deleteClienteAction(id)
restoreClienteAction(id)
updateClienteNotesAction(id, notes)   // Actualização rápida de observações
```

---

### 6.4 Colaboradores

**Rota:** `/colaboradores`

#### Funcionalidades
| Operação | Descrição |
|----------|-----------|
| Listar | Tabela com nome, cargo, especialidade, taxa de comissão |
| Criar | Formulário em `/colaboradores/novo` (apenas admin) |
| Editar | Formulário em `/colaboradores/[id]/editar` (apenas admin) |
| Ver detalhe | Página `/colaboradores/[id]` |
| Eliminar | Soft delete (apenas admin) |
| Restaurar | A partir da vista "Eliminados" (apenas admin) |
| Comissão | Edição inline da taxa de comissão |

#### Cargos disponíveis
Fisioterapeuta · Instrutor de Pilates · Massoterapeuta · Recepcionista · Administrador · Osteopata

#### Componentes
| Ficheiro | Descrição |
|----------|-----------|
| `ColaboradorForm.tsx` | Formulário de criação/edição |
| `ColaboradorList.tsx` | Tabela de listagem |
| `CommissionRateEditor.tsx` | Editor inline da taxa de comissão (%) |

#### Server Actions (`src/features/colaboradores/actions.ts`)
```typescript
createColaboradorAction(formData)         // Admin only
updateColaboradorAction(id, formData)     // Admin only
deleteColaboradorAction(id)               // Admin only
restoreColaboradorAction(id)              // Admin only
updateCommissionRateAction(id, rate)      // Admin only — actualiza % de comissão
```

---

### 6.5 Serviços

**Rota:** `/servicos`

#### Funcionalidades
| Operação | Descrição |
|----------|-----------|
| Listar | Tabela com nome, categoria, duração, preço e estado |
| Criar | Formulário em `/servicos/novo` |
| Editar | Formulário em `/servicos/[id]/editar` |
| Activar/Desactivar | Toggle de estado sem eliminar |
| Eliminar | Soft delete |
| Restaurar | A partir da vista "Eliminados" |

#### Categorias disponíveis
Fisioterapia · Pilates · Massagem · RPG · Acupunctura · Osteopatia · Outros

#### Componentes
| Ficheiro | Descrição |
|----------|-----------|
| `ServicoForm.tsx` | Formulário com campos nome, descrição, duração (min), preço, categoria, activo |
| `ServicoList.tsx` | Tabela com badges de estado e categoria |

#### Server Actions (`src/features/servicos/actions.ts`)
```typescript
createServicoAction(formData)
updateServicoAction(id, formData)
deleteServicoAction(id)
restoreServicoAction(id)
```

---

### 6.6 Pagamentos

**Rota:** `/pagamentos`

#### Funcionalidades
| Operação | Descrição |
|----------|-----------|
| Listar | Tabela com filtros por status, método, período |
| Criar | Formulário em `/pagamentos/novo` (admin only) |
| Editar | Formulário em `/pagamentos/[id]/editar` (admin only) |
| Ver detalhe | Sheet lateral com todos os dados do pagamento |
| Marcar como Pago | Acção rápida (admin only) |
| Marcar como Pendente | Reverter pagamento (admin only) |
| Eliminar | Soft delete (admin only) |
| Restaurar | A partir da vista "Eliminados" (admin only) |

#### Status possíveis
- `pending` — Pendente
- `paid` — Pago
- `cancelled` — Cancelado
- `refunded` — Reembolsado

#### Estado de factura
- `not_issued` — Não emitida
- `issued` — Emitida
- `cancelled` — Cancelada

#### Métodos de pagamento
Dinheiro · Multibanco · MB Way · Cartão de Crédito · Transferência Bancária

#### Componentes
| Ficheiro | Descrição |
|----------|-----------|
| `PagamentoForm.tsx` | Formulário completo com todos os campos |
| `PagamentoList.tsx` | Tabela com acções rápidas |
| `PagamentoFilters.tsx` | Filtros por status, método, período |
| `PagamentoDetailSheet.tsx` | Painel lateral com detalhe do pagamento |
| `PaymentStatusBadge.tsx` | Badge colorido por status de pagamento |

#### Server Actions (`src/features/pagamentos/actions.ts`)
```typescript
createPagamentoAction(formData)           // Admin only
updatePagamentoAction(id, formData)       // Admin only
markAsPaidAction(id)                      // Admin only
markAsPendingAction(id)                   // Admin only
deletePagamentoAction(id)                 // Admin only
restorePagamentoAction(id)                // Admin only
```

---

### 6.7 Comissões

**Rota:** `/comissoes`

#### Funcionalidades
- Visão global das comissões de todos os colaboradores
- Filtro por período (mês/ano)
- Cálculo automático baseado nos pagamentos `paid` e na `commissionRate` de cada colaborador
- Edição inline da taxa de comissão (% por colaborador)
- Exportação / resumo por colaborador

---

### 6.8 Notificações

**Rota:** `/notificacoes`

#### Tipos de notificações
| Tipo | Trigger | Método |
|------|---------|--------|
| `appointment_reminder` | 24h antes do agendamento | Cron Job (1h) |
| `appointment_cancelled` | Ao cancelar um agendamento | Imediato (Server Action) |
| `payment_pending` | Ao criar pagamento com vencimento | Imediato |

#### Fluxo de envio
```
1. Server Action cria registo na tabela Notification (status: "pending")
2. Cron Job (/api/cron/notifications) executa a cada hora
3. processNotificationQueue() processa lembretes na janela 24h–25h
4. Resend API envia o e-mail HTML
5. Registo actualizado para "sent" ou "failed"
```

#### Templates de e-mail (`src/server/email-templates/index.ts`)
- `appointmentReminderTemplate()` — lembrete 24h antes
- `appointmentCancelledTemplate()` — confirmação de cancelamento
- `paymentPendingTemplate()` — aviso de pagamento pendente

#### Configuração
```env
RESEND_API_KEY=...
RESEND_FROM_EMAIL=notificacoes@clinicapro.pt
CLINIC_NAME=ClinicaPro
```

#### Cron Job — `vercel.json`
```json
{ "path": "/api/cron/notifications", "schedule": "0 * * * *" }
```
Executa a cada hora (minuto 0).

#### UI de Administração (`/notificacoes`)
- Lista de todas as notificações com filtros por tipo e estado
- Indicadores de estado: pendente, enviado, falhado, cancelado
- Paginação (50 por página)

---

### 6.9 Auditoria

**Rota:** `/auditoria`

#### O que é auditado
Todas as operações de escrita em todas as entidades:
- **Criação** (CREATE) de Clientes, Colaboradores, Serviços, Agendamentos, Pagamentos, Utilizadores
- **Actualização** (UPDATE) incluindo restauros e alterações de campos específicos
- **Eliminação** (DELETE) — soft delete
- **Cancelamento** (CANCEL) de agendamentos
- **Marcar como pago** (MARK_PAID) / pendente (MARK_PENDING)
- **Alteração de role** (ROLE_CHANGE) de utilizadores

#### Campos registados por entrada
- Utilizador (ID + e-mail) que realizou a acção
- Entidade e ID do registo afectado
- Acção realizada
- Metadata contextual (ex: novo status, campos alterados)
- Timestamp

#### Componentes
| Ficheiro | Descrição |
|----------|-----------|
| `AuditLogTable.tsx` | Tabela com todos os logs de auditoria |
| `AuditFilters.tsx` | Filtros por entidade, acção, utilizador, período |

---

### 6.10 Utilizadores

**Rota:** `/utilizadores` (apenas admin)

#### Funcionalidades
| Operação | Descrição |
|----------|-----------|
| Listar | Tabela com todos os utilizadores do sistema |
| Convidar | Criar novo utilizador com e-mail, role e cargo |
| Alterar Role | Promover/despromover admin ↔ user |
| Eliminar | Remover utilizador (não pode auto-eliminar) |

> Utiliza a **Admin API do Supabase** (`createAdminClient`) para gerir utilizadores.  
> Requer `SUPABASE_SERVICE_ROLE_KEY` nas variáveis de ambiente.

---

## 7. Landing Page

**Rota:** `/` (pública)

A landing page é uma página de marketing para apresentar o produto. Composta pelas seguintes secções:

| Componente | Secção |
|-----------|--------|
| `Navbar.tsx` | Barra de navegação com scroll suave e CTA de login |
| `Hero.tsx` | Secção principal com headline, sub-título e CTA |
| `Services.tsx` | Serviços suportados pela plataforma |
| `HowItWorks.tsx` | Passos de onboarding (Como funciona) |
| `Benefits.tsx` | Benefícios e features da plataforma |
| `Team.tsx` | Equipa / perfis |
| `Testimonials.tsx` | Depoimentos de clientes |
| `FAQ.tsx` | Perguntas frequentes |
| `CTA.tsx` | Call-to-action final |
| `Contact.tsx` | Formulário/informações de contacto |
| `About.tsx` | Sobre a plataforma |
| `Footer.tsx` | Rodapé com links e copyright |
| `JsonLd.tsx` | Schema.org para SEO |

### SEO
- `src/app/manifest.ts` — Web App Manifest (PWA)
- `src/app/robots.ts` — Robots.txt
- `src/app/sitemap.ts` — Sitemap XML
- `src/app/opengraph-image.tsx` — OG Image dinâmica
- `src/app/twitter-image.tsx` — Twitter Card Image
- `src/lib/seo.ts` — Helpers de metadados SEO

---

## 8. Infra-estrutura e Serviços

### Supabase
- **Auth** — Autenticação com SSR (cookies)
- **PostgreSQL** — Base de dados principal
- **Admin API** — Gestão de utilizadores

### Ficheiros de configuração Supabase
```
src/lib/supabase/
├── client.ts      # Cliente para componentes cliente (browser)
├── server.ts      # Cliente para Server Components / Actions
├── middleware.ts  # updateSession() para o middleware Next.js
└── admin.ts       # Cliente com service role key (admin operations)
```

### Prisma
- Adaptador `@prisma/adapter-pg` para ligação directa via `pg`
- Schema em `prisma/schema.prisma`
- Seed em `prisma/seed.ts`
- Migrações em `prisma/migrations/`

### Resend
- Envio de e-mails transaccionais
- Templates HTML definidos em `src/server/email-templates/index.ts`

### Vercel
- Deploy automático
- Cron Jobs configurados em `vercel.json` (execução horária das notificações)

---

## 9. Estrutura de Ficheiros

```
src/
├── middleware.ts                          # Middleware Next.js (auth session)
│
├── app/
│   ├── layout.tsx                         # Root layout (fonts, providers, Sonner)
│   ├── page.tsx                           # Landing page
│   ├── globals.css                        # Estilos globais Tailwind
│   ├── manifest.ts                        # PWA manifest
│   ├── robots.ts                          # SEO robots
│   ├── sitemap.ts                         # SEO sitemap
│   ├── opengraph-image.tsx                # OG image
│   ├── twitter-image.tsx                  # Twitter card
│   │
│   ├── (admin)/                           # Grupo de rotas protegidas
│   │   ├── layout.tsx                     # Layout admin (Sidebar + Header)
│   │   ├── dashboard/page.tsx
│   │   ├── agendamentos/
│   │   │   ├── page.tsx                   # Lista + Calendário
│   │   │   ├── novo/page.tsx              # Criar agendamento
│   │   │   └── [id]/
│   │   │       ├── page.tsx               # Detalhe
│   │   │       └── editar/page.tsx        # Editar
│   │   ├── clientes/
│   │   │   ├── page.tsx
│   │   │   ├── novo/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── editar/page.tsx
│   │   ├── colaboradores/
│   │   │   ├── page.tsx
│   │   │   ├── novo/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── editar/page.tsx
│   │   ├── servicos/
│   │   │   ├── page.tsx
│   │   │   ├── novo/page.tsx
│   │   │   └── [id]/editar/page.tsx
│   │   ├── pagamentos/
│   │   │   ├── page.tsx
│   │   │   ├── novo/page.tsx
│   │   │   └── [id]/editar/page.tsx
│   │   ├── comissoes/page.tsx
│   │   ├── notificacoes/page.tsx
│   │   ├── auditoria/page.tsx
│   │   └── utilizadores/
│   │       ├── page.tsx
│   │       └── novo/page.tsx
│   │
│   ├── api/
│   │   └── cron/
│   │       └── notifications/route.ts     # GET — processa fila de notificações
│   │
│   ├── auth/
│   │   └── callback/                      # OAuth callback (Supabase)
│   └── login/page.tsx                     # Página de login
│
├── components/
│   ├── landing/                           # Componentes da landing page
│   ├── layout/
│   │   ├── Header.tsx                     # Cabeçalho do painel admin
│   │   └── Sidebar.tsx                    # Sidebar de navegação
│   └── ui/                                # Componentes de UI reutilizáveis
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── RestoreButton.tsx              # Botão de restauro com confirmação
│       ├── select.tsx
│       ├── sheet.tsx
│       ├── table.tsx
│       └── textarea.tsx
│
├── constants/
│   └── index.ts                           # TENANT_ID, categorias, roles, status
│
├── features/                              # Feature-first organisation
│   ├── agendamentos/
│   │   ├── actions.ts                     # Server Actions
│   │   ├── calendarActions.ts             # Actions específicas do calendário
│   │   ├── repository.ts                  # Queries Prisma
│   │   ├── schema.ts                      # Validação Zod
│   │   └── components/
│   ├── auditoria/
│   │   ├── queries.ts
│   │   └── components/
│   ├── auth/
│   │   ├── actions.ts
│   │   ├── userActions.ts
│   │   └── components/
│   ├── clientes/
│   │   ├── actions.ts
│   │   ├── repository.ts
│   │   ├── schema.ts
│   │   └── components/
│   ├── colaboradores/
│   │   ├── actions.ts
│   │   ├── repository.ts
│   │   ├── schema.ts
│   │   └── components/
│   ├── dashboard/
│   │   ├── queries.ts
│   │   └── components/
│   ├── pagamentos/
│   │   ├── actions.ts
│   │   ├── repository.ts
│   │   ├── schema.ts
│   │   └── components/
│   └── servicos/
│       ├── actions.ts
│       ├── repository.ts
│       ├── schema.ts
│       └── components/
│
├── lib/
│   ├── audit.ts                           # Helper de auditoria
│   ├── prisma.ts                          # Prisma client singleton
│   ├── seo.ts                             # Helpers de metadados SEO
│   ├── supabase.ts                        # Re-exports supabase
│   ├── utils.ts                           # cn(), serializeDecimal(), etc.
│   └── supabase/
│       ├── admin.ts
│       ├── client.ts
│       ├── middleware.ts
│       └── server.ts
│
└── server/
    ├── email-templates/index.ts           # Templates HTML de e-mail
    └── services/
        └── notification-service.ts        # Serviço de notificações completo
```

---

## 10. Rotas da Aplicação

### Públicas
| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/login` | Página de login |
| `/auth/callback` | Callback de autenticação OAuth |

### Área de Administração (autenticação obrigatória)
| Rota | Descrição | Role |
|------|-----------|------|
| `/dashboard` | Dashboard analítico | Todos |
| `/agendamentos` | Calendário de agendamentos | Todos |
| `/agendamentos/novo` | Criar agendamento | Todos |
| `/agendamentos/[id]` | Detalhe do agendamento | Todos |
| `/agendamentos/[id]/editar` | Editar agendamento | Todos |
| `/clientes` | Lista de clientes | Todos |
| `/clientes/novo` | Criar cliente | Todos |
| `/clientes/[id]` | Detalhe do cliente | Todos |
| `/clientes/[id]/editar` | Editar cliente | Todos |
| `/colaboradores` | Lista de colaboradores | Admin |
| `/colaboradores/novo` | Criar colaborador | Admin |
| `/colaboradores/[id]` | Detalhe do colaborador | Admin |
| `/colaboradores/[id]/editar` | Editar colaborador | Admin |
| `/servicos` | Lista de serviços | Todos |
| `/servicos/novo` | Criar serviço | Todos |
| `/servicos/[id]/editar` | Editar serviço | Todos |
| `/pagamentos` | Lista de pagamentos | Admin |
| `/pagamentos/novo` | Criar pagamento | Admin |
| `/pagamentos/[id]/editar` | Editar pagamento | Admin |
| `/comissoes` | Relatório de comissões | Admin |
| `/notificacoes` | Lista de notificações | Admin |
| `/auditoria` | Log de auditoria | Admin |
| `/utilizadores` | Gestão de utilizadores | Admin |
| `/utilizadores/novo` | Criar utilizador | Admin |

### API
| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/cron/notifications` | GET | Processa fila de notificações pendentes (chamado pelo Vercel Cron) |

---

## 11. Server Actions — Resumo

Todas as Server Actions seguem o padrão:
1. **Validação** com Zod (`.safeParse()`)
2. **Operação** no repositório Prisma
3. **Registo de auditoria** automático
4. **Revalidação** de cache Next.js (`revalidatePath`)
5. **Redirect** para a lista após sucesso

| Módulo | Actions |
|--------|---------|
| Auth | `loginAction`, `logoutAction` |
| Utilizadores | `inviteUser`, `updateUserRole`, `deleteUser` |
| Clientes | `createClienteAction`, `updateClienteAction`, `deleteClienteAction`, `restoreClienteAction`, `updateClienteNotesAction` |
| Colaboradores | `createColaboradorAction`, `updateColaboradorAction`, `deleteColaboradorAction`, `restoreColaboradorAction`, `updateCommissionRateAction` |
| Serviços | `createServicoAction`, `updateServicoAction`, `deleteServicoAction`, `restoreServicoAction` |
| Agendamentos | `createAgendamentoAction`, `updateAgendamentoAction`, `cancelAgendamentoAction`, `deleteAgendamentoAction`, `restoreAgendamentoAction` |
| Pagamentos | `createPagamentoAction`, `updatePagamentoAction`, `markAsPaidAction`, `markAsPendingAction`, `deletePagamentoAction`, `restorePagamentoAction` |

---

## 12. Componentes de UI

Biblioteca de componentes customizados em `src/components/ui/`:

| Componente | Descrição |
|-----------|-----------|
| `Button` | Botão com variantes (primary, outline, ghost, destructive) |
| `Card / CardContent / CardHeader` | Cards de conteúdo |
| `Input` | Campo de texto estilizado |
| `Label` | Label para campos de formulário |
| `Select / SelectTrigger / SelectContent` | Dropdown select |
| `Textarea` | Área de texto |
| `Badge` | Badge de estado com variantes de cor |
| `Sheet / SheetContent` | Painel lateral deslizante (drawer) |
| `Table / TableRow / TableCell` | Tabela de dados |
| `RestoreButton` | Botão de restauro com confirmação inline |

### Layout Admin
| Componente | Descrição |
|-----------|-----------|
| `Sidebar` | Barra lateral com navegação principal, ícones e links activos |
| `Header` | Cabeçalho de página com título, descrição e slot para acções |

---

## 13. Padrões e Convenções

### Organização do Código
- **Feature-first** — cada módulo tem a sua pasta em `src/features/` com `actions.ts`, `repository.ts`, `schema.ts` e `components/`
- **Server Components por defeito** — páginas são async Server Components
- **Server Actions** para todas as mutações (formulários e acções)
- **Repository pattern** — queries Prisma isoladas em `repository.ts`

### Soft Delete
Todos os registos principais (Client, Collaborator, Service, Appointment, Payment) usam soft delete:
- `isDeleted: Boolean @default(false)`
- `deletedAt: DateTime?`
- A UI mostra uma vista separada "Eliminados" com botão de restauro
- Todas as queries de listagem filtram `isDeleted: false` por defeito

### Multi-tenant
- Todos os modelos têm `tenantId`
- Todas as queries incluem `tenantId` como filtro
- Constante `TENANT_ID` centralizada em `src/constants/index.ts`

### Validação
- Schemas Zod definidos em `features/*/schema.ts`
- Validação no Server Action antes de qualquer operação de BD
- Erros retornados em `{ success: false, error: fieldErrors }`

### Auditoria
- `createAuditLog()` chamado em todas as Server Actions de mutação
- Falha silenciosa — nunca bloqueia a operação principal
- Regista userId, userEmail, acção, entidade, entityId e metadata

### Cache e Revalidação
- `export const dynamic = "force-dynamic"` nas páginas com dados em tempo real
- `revalidatePath()` chamado após cada mutação para invalidar o cache
- Suspense boundaries com skeletons de loading

### Tipos e Segurança
- TypeScript strict mode
- Tipos derivados dos schemas Zod (`z.infer<typeof schema>`)
- `serializeDecimal()` utilitário para converter `Decimal` do Prisma em números para serialização JSON entre Server/Client Components

---

*Documento gerado automaticamente em 2 de Junho de 2026.*

