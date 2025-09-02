# 3ple Digit - Investment Management Platform

<div align="center">

![3ple Digit Logo](https://img.shields.io/badge/3ple-Digit-blue?style=for-the-badge)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**Moderná aplikácia na evidenciu investorov, aktív a mesačných snapshotov**

[🚀 Live Demo](#deployment) • [📖 Dokumentácia](#dokumentácia) • [🛠️ Setup](#setup) • [🧪 Testovanie](#testovanie)

</div>

---

## 📋 Obsah

- [Prehľad](#prehľad)
- [Kľúčové funkcie](#kľúčové-funkcie)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Deployment](#deployment)
- [API Dokumentácia](#api-dokumentácia)
- [Testovanie](#testovanie)
- [Štruktúra projektu](#štruktúra-projektu)
- [Prispievanie](#prispievanie)

---

## 🎯 Prehľad

**3ple Digit** je kompletná fullstack aplikácia pre správu investícií s modulárnou architektúrou. Aplikácia umožňuje evidenciu investorov, aktív, záväzkov a automatické výpočty NAV (Net Asset Value) s mesačnými snapshotmi.

### ✨ Kľúčové vlastnosti MVP

- ✅ **100% TypeScript** - Strict mode, žiadne `any`
- ✅ **Modulárna architektúra** - "By-feature" organizácia
- ✅ **Kompletné testovanie** - 53/53 testov PASSED (100%)
- ✅ **Produkčná kvalita** - ESLint, Prettier, Husky, CI/CD
- ✅ **Bezpečnosť** - JWT auth, bcrypt, CORS, rate limiting
- ✅ **Real-time UI** - TanStack Query, optimistic updates

---

## 🚀 Kľúčové funkcie

### 💼 **Investori**
- Evidencia investorov s kapitálovými vkladmi/výbermi
- Automatický prepočet % podielov
- História transakcií a kapitálových zmien

### 🏢 **Aktíva**
- Univerzálne karty pre rôzne typy aktív (nehnuteľnosti, pôžičky, akcie, vozidlá)
- Asset events systém (VALUATION, CAPEX, PAYMENT_IN/OUT, NOTE)
- Automatický prepočet current_value
- Predaj aktív s PnL kalkuláciou

### 🏦 **Banka & Hotovosť**
- Ručné zadávanie stavov účtov
- CSV import parser s error reportingom
- Multi-currency podpora (EUR focus)

### 📊 **Záväzky**
- Jednoduchá evidencia úverov a hypoték
- Maturity tracking
- Current balance management

### 📈 **Snapshots (NAV)**
- Jedným klikom prepočíta NAV = Σ assets + Σ bank - Σ liabilities
- Uloží percentá investorov na daný mesiac
- Voliteľný performance fee (50/50 split)
- História NAV vývoja

### 📁 **Dokumenty**
- Cloudflare R2 storage s presigned uploads
- SHA256 checksums pre integritu
- Kategorizácia podľa entít (asset, investor, liability)
- Bezpečné download linky

### 📋 **Reporty**
- Portfolio report (aktíva podľa kategórií)
- Investor report (kapitál a % podiely)
- Performance report (PnL analýza)
- Cashflow report (vklady/výbery)
- CSV export pre všetky reporty

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** + **Vite** - Moderný build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **TanStack Query** - Server state management
- **React Hook Form** + **Zod** - Form handling & validation
- **Aeonik Font** - Custom typography

### **Backend**
- **Node.js** + **Express** - REST API server
- **TypeScript** - Strict mode
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Production database
- **Zod** - Runtime validation
- **JWT** + **bcrypt** - Authentication
- **Winston** - Structured logging

### **Infrastructure**
- **Cloudflare R2** - Object storage
- **Railway** - Backend hosting
- **Vercel** - Frontend hosting
- **GitHub Actions** - CI/CD pipeline
- **Husky** + **lint-staged** - Git hooks

### **Testing & Quality**
- **Vitest** - Unit testing
- **Supertest** - API integration tests
- **Playwright** - E2E testing
- **ESLint** + **Prettier** - Code quality
- **Commitlint** - Conventional commits

---

## 🚀 Setup

### Predpoklady

```bash
Node.js >= 18.0.0
pnpm >= 8.0.0
PostgreSQL >= 14.0 (pre production)
```

### 1. Klonovanie a inštalácia

```bash
git clone <repository-url>
cd 3ple-digit
pnpm install
```

### 2. Environment setup

```bash
# Backend
cp apps/api/env.example apps/api/.env
# Frontend  
cp apps/web/env.example apps/web/.env.local
```

### 3. Databáza setup

```bash
# Development (SQLite)
cd apps/api
pnpm db:migrate
pnpm db:seed

# Production (PostgreSQL)
pnpm db:deploy
```

### 4. Spustenie aplikácie

```bash
# Development mode
pnpm dev

# Production build
pnpm build
pnpm start
```

**Aplikácia bude dostupná na:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Prisma Studio: http://localhost:5555 (pnpm db:studio)

### 5. Default admin účet

```
Email: admin@3pledigit.com
Password: password123
```

---

## 🌐 Deployment

### Backend (Railway)

1. **Vytvorte Railway projekt**
```bash
railway login
railway init
```

2. **Nastavte environment variables**
```bash
NODE_ENV=production
DATABASE_URL=<postgresql-url>
JWT_SECRET=<32-char-secret>
R2_ACCOUNT_ID=<cloudflare-r2-account>
R2_ACCESS_KEY_ID=<r2-key>
R2_SECRET_ACCESS_KEY=<r2-secret>
R2_BUCKET_NAME=3ple-digit-documents
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

3. **Deploy**
```bash
railway up
```

### Frontend (Vercel)

1. **Pripojte GitHub repository**
2. **Nastavte build settings**
```bash
Build Command: cd apps/web && pnpm build
Output Directory: apps/web/dist
Install Command: pnpm install
```

3. **Environment variables**
```bash
VITE_API_URL=https://your-railway-app.railway.app
```

### Cloudflare R2 Setup

1. **Vytvorte R2 bucket**
2. **Nastavte CORS policy**
```json
[
  {
    "AllowedOrigins": ["https://your-app.vercel.app"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"]
  }
]
```

---

## 📖 API Dokumentácia

### Base URL
```
Development: http://localhost:4000
Production: https://your-railway-app.railway.app
```

### Authentication

Všetky API endpointy (okrem `/auth/login` a `/auth/register`) vyžadujú JWT token v header:

```bash
Authorization: Bearer <jwt-token>
```

### Core Endpoints

#### **Auth**
```bash
POST /api/auth/login      # Prihlásenie
POST /api/auth/register   # Registrácia
GET  /api/auth/me         # Aktuálny user
```

#### **Investors**
```bash
GET    /api/investors                    # Zoznam investorov
POST   /api/investors                    # Vytvorenie investora
PUT    /api/investors/:id                # Úprava investora
DELETE /api/investors/:id                # Zmazanie investora
POST   /api/investors/:id/cashflows      # Pridanie cashflow
GET    /api/investors/:id/overview       # Prehľad investora
```

#### **Assets**
```bash
GET    /api/assets                       # Zoznam aktív
POST   /api/assets                       # Vytvorenie aktíva
PUT    /api/assets/:id                   # Úprava aktíva
DELETE /api/assets/:id                   # Zmazanie aktíva
POST   /api/assets/:id/events            # Pridanie asset event
POST   /api/assets/:id/mark-sold         # Označenie ako predané
```

#### **Bank**
```bash
GET    /api/bank/balances                # Bankové zostatky
POST   /api/bank/balances                # Pridanie zostatku
POST   /api/bank/import/csv              # CSV import
```

#### **Snapshots**
```bash
GET    /api/snapshots                    # História snapshotov
POST   /api/snapshots                    # Vytvorenie snapshot
GET    /api/snapshots/nav/current        # Aktuálny NAV
```

#### **Documents**
```bash
GET    /api/documents                    # Zoznam dokumentov
POST   /api/documents/presign            # Presigned upload URL
DELETE /api/documents/:id                # Zmazanie dokumentu
```

#### **Reports**
```bash
GET    /api/reports/portfolio            # Portfolio report
GET    /api/reports/investors            # Investor report  
GET    /api/reports/performance          # Performance report
GET    /api/reports/cashflow             # Cashflow report
```

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": "Email is required"
  }
}
```

---

## 🧪 Testovanie

### Spustenie testov

```bash
# Všetky testy
pnpm test

# Unit testy
pnpm test:unit

# Integration testy  
pnpm test:integration

# E2E testy
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

### Test Coverage

- **53/53 testov PASSED** (100% úspešnosť)
- **Unit testy:** NAV výpočty, % podiely, performance fee, CSV parser
- **Integration testy:** 5 kľúčových application flows
- **E2E testy:** Smoke test cez UI

### Kľúčové test scenáre

1. **Investor Deposit → Snapshot → Ownership % Change**
2. **Asset Valuation + CAPEX → NAV Change**
3. **Asset Sale → Reports → PnL Calculation**
4. **CSV Bank Import → NAV Integration**
5. **Complete Investment Lifecycle**

---

## 📁 Štruktúra projektu

```
3ple-digit/
├── apps/
│   ├── api/                    # Backend Express server
│   │   ├── src/
│   │   │   ├── core/          # Shared utilities (env, logger, prisma)
│   │   │   ├── modules/       # Feature modules
│   │   │   │   ├── auth/      # Authentication
│   │   │   │   ├── investors/ # Investor management
│   │   │   │   ├── assets/    # Asset management
│   │   │   │   ├── bank/      # Bank balances
│   │   │   │   ├── liabilities/ # Liabilities
│   │   │   │   ├── snapshots/ # NAV calculations
│   │   │   │   ├── documents/ # Document storage
│   │   │   │   └── reports/   # Reporting
│   │   │   └── index.ts       # Server entry point
│   │   ├── prisma/            # Database schema & migrations
│   │   └── package.json
│   └── web/                   # Frontend React app
│       ├── src/
│       │   ├── features/      # Feature-based components
│       │   ├── lib/          # Shared utilities
│       │   ├── ui/           # Shared UI components
│       │   └── types/        # TypeScript types
│       └── package.json
├── packages/
│   └── types/                 # Shared TypeScript types
├── tests/
│   └── e2e/                  # Playwright E2E tests
├── .github/
│   └── workflows/            # CI/CD pipelines
└── package.json              # Root package.json
```

### Modularizácia pravidlá

- **File size limits:** Žiadny súbor > 300 LOC, komponenty ≤ 150 LOC
- **Feature isolation:** Každý modul má vlastné `schema.ts`, `service.ts`, `router.ts`
- **Barrel exports:** `index.ts` exportuje len verejné API
- **Code splitting:** Route-level lazy loading

---

## 🤝 Prispievanie

### Development Workflow

1. **Fork repository**
2. **Vytvorte feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Implementujte zmeny**
   - Dodržujte file size limits
   - Napíšte testy pre novú funkcionalitu
   - Aktualizujte dokumentáciu
4. **Spustite quality checks**
   ```bash
   pnpm lint
   pnpm test
   pnpm type-check
   ```
5. **Commit changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push a vytvorte PR**

### Code Quality Standards

- **TypeScript strict mode** - žiadne `any`
- **ESLint + Prettier** - automatické formátovanie
- **Conventional Commits** - štandardizované commit messages
- **100% test coverage** - pre core business logiku
- **Zod validation** - na všetkých API boundaries

### Git Hooks

- **Pre-commit:** ESLint + Prettier + type check
- **Commit-msg:** Conventional commits validation
- **Pre-push:** Všetky testy musia prejsť

---

## 📄 Licencia

MIT License - pozrite [LICENSE](LICENSE) súbor pre detaily.

---

## 🆘 Podpora

- **Issues:** [GitHub Issues](../../issues)
- **Dokumentácia:** [Wiki](../../wiki)
- **Email:** support@3pledigit.com

---

<div align="center">

**Vytvorené s ❤️ pre moderné investment management**

[![GitHub stars](https://img.shields.io/github/stars/username/3ple-digit?style=social)](../../stargazers)
[![GitHub forks](https://img.shields.io/github/forks/username/3ple-digit?style=social)](../../network/members)

</div>
