# GlobalFisio — Plataforma SaaS de Gestão de Clínicas

Plataforma multi-tenant para gestão de clínicas de fisioterapia, pilates e massagem.

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Prisma 7** (com `@prisma/adapter-pg`)
- **PostgreSQL** (Supabase, Neon ou local)
- **Tailwind CSS v4**
- **Server Actions** para operações de escrita
- **Zod** para validação

## Estrutura do Projeto

```
src/
├── app/
│   └── (admin)/               # Layout administrativo (sidebar)
│       ├── dashboard/          # Página inicial
│       ├── clientes/           # CRUD de clientes
│       ├── colaboradores/      # CRUD de colaboradores
│       └── servicos/           # CRUD de serviços
├── features/
│   ├── clientes/
│   │   ├── schema.ts           # Validação Zod
│   │   ├── actions.ts          # Server Actions
│   │   ├── repository.ts       # Acesso ao banco (Prisma)
│   │   └── components/
│   ├── colaboradores/
│   └── servicos/
├── components/
│   ├── ui/                     # Button, Card, Input, Table, Badge, etc.
│   └── layout/                 # Sidebar, Header
├── constants/                  # TENANT_ID e constantes compartilhadas
└── lib/
    ├── prisma.ts               # Singleton PrismaClient (adapter-pg)
    └── utils.ts                # cn(), formatCurrency(), formatDate()
```

## Instalação

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/clinica_db"
```

> **Supabase:** Vá em `Project Settings > Database > Connection string (URI)`.

### 3. Execute as migrations

```bash
npx prisma migrate dev --name init
```

### 4. Inicie o servidor

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Multi-tenant

Todas as entidades possuem `tenantId`. Em desenvolvimento, o `TENANT_ID = "tenant-demo"` está em `src/constants/index.ts`. Em produção, substitua pela identidade do tenant autenticado (Supabase Auth, NextAuth, etc.).

## Módulos

| Módulo | Rota | Status |
|--------|------|--------|
| Dashboard | `/dashboard` | ✅ |
| Clientes | `/clientes` | ✅ CRUD completo |
| Colaboradores | `/colaboradores` | ✅ CRUD completo |
| Serviços | `/servicos` | ✅ CRUD completo |
| Agendamentos | `/agendamentos` | 🔜 Em breve |

## Comandos

```bash
npm run dev                          # Servidor de desenvolvimento
npm run build                        # Build de produção
npx prisma generate                  # Gera o Prisma Client
npx prisma migrate dev --name init   # Cria / aplica migrations
npx prisma studio                    # Interface visual do banco
```
