# 🚀 3PLE DIGIT - PLÁN VYLEPŠENÍ

## 📊 **ANALÝZA SÚČASNÉHO STAVU**

### ✅ **ČO FUNGUJE DOBRE**

- Modulárna architektúra by-feature
- TypeScript strict mode
- Zod validácia na boundaries
- TanStack Query pre state management
- Prisma ORM s migráciami
- JWT autentifikácia
- Cloudflare R2 storage
- Testovanie (53/53 PASSED)

### 🚨 **KRITICKÉ PROBLÉMY**

1. **Bezpečnostné zraniteľnosti** - Axios 1.11.0, esbuild 0.21.5
2. **Zastaralé závislosti** - Node 18, TypeScript 5.3.3, Vite 5.0.8
3. **Chýbajúce bezpečnostné funkcie** - CSP, CSRF, rate limiting
4. **Výkonnostné problémy** - žiadne lazy loading, caching

---

## 🎯 **PRIORITNÝ PLÁN VYLEPŠENÍ**

### **FÁZA 1: KRITICKÉ BEZPEČNOSTNÉ OPRAVY (1-2 dni)**

#### 1.1 Aktualizácia zraniteľných závislostí

```bash
# Frontend
pnpm update axios@latest
pnpm update esbuild@latest

# Backend
pnpm update express@latest
pnpm update helmet@latest
```

#### 1.2 Bezpečnostné vylepšenia

- [ ] Pridať CSP hlavičky
- [ ] Implementovať CSRF ochranu
- [ ] Pridať rate limiting pre auth endpoints
- [ ] Request size limity pre file uploads

### **FÁZA 2: MODERNIZÁCIA ZÁVISLOSTÍ (2-3 dni)**

#### 2.1 Node.js upgrade

```bash
# Upgrade na Node 22 LTS
nvm install 22
nvm use 22
```

#### 2.2 TypeScript upgrade

```bash
pnpm update typescript@latest
pnpm update @typescript-eslint/eslint-plugin@latest
pnpm update @typescript-eslint/parser@latest
```

#### 2.3 Frontend upgrade

```bash
pnpm update vite@latest
pnpm update react@latest
pnpm update @tanstack/react-query@latest
```

### **FÁZA 3: VÝKONNOSTNÉ VYLEPŠENIA (3-4 dni)**

#### 3.1 Frontend optimalizácie

- [ ] Lazy loading komponentov
- [ ] React.memo pre zoznamy
- [ ] TanStack Virtual pre veľké tabuľky
- [ ] Service worker pre caching

#### 3.2 Backend optimalizácie

- [ ] Response compression
- [ ] Request caching
- [ ] Database query optimalizácia

### **FÁZA 4: TYPESCRIPT STRICT MODE (1-2 dni)**

#### 4.1 Konfigurácia

```json
// apps/web/tsconfig.json
{
  "compilerOptions": {
    "exactOptionalPropertyTypes": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "strict": true
  }
}
```

#### 4.2 Refaktoring

- [ ] Opraviť všetky TypeScript chyby
- [ ] Pridať type guards
- [ ] Eliminovať `any` typy

### **FÁZA 5: BUILD OPTIMALIZÁCIE (1-2 dni)**

#### 5.1 Vite konfigurácia

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
```

#### 5.2 Bundle analysis

- [ ] Pridať bundle analyzer
- [ ] Optimalizovať chunk sizes
- [ ] Tree shaking optimalizácia

---

## 🚫 **ČO NEIMPLEMENTOVAŤ (PRE VÁŠ PROJEKT)**

### ❌ **Prílišná komplexita pre MVP**

- **Fastify/Hono** - Express je dostatočný
- **Next.js** - zbytočné pre SPA
- **WebAuthn/TOTP** - overkill pre MVP
- **Edge functions** - zbytočné pre váš use case

### ❌ **Premature optimization**

- **Redis** - JWT je OK pre MVP
- **PgBouncer** - zatiaľ nie je potrebný
- **OpenTelemetry** - môžete odložiť
- **Biome** - Prettier je stabilný

---

## 📈 **OČAKÁVANÉ VÝHODY**

### **Bezpečnosť**

- Eliminácia zraniteľností
- Lepšia ochrana dát
- CSP + CSRF ochrana

### **Výkon**

- 30-50% rýchlejšie načítanie
- Lepšia UX s lazy loading
- Optimalizované bundle sizes

### **Údržba**

- Moderné nástroje
- Lepšia developer experience
- TypeScript strict mode

### **Škálovateľnosť**

- Lepšia architektúra
- Pripravenosť na rast
- Moderné best practices

---

## ⏱️ **ČASOVÝ HARMONOGRAM**

| Fáza   | Trvanie | Priorita  | Komplexita |
| ------ | ------- | --------- | ---------- |
| Fáza 1 | 1-2 dni | 🔴 HIGH   | Nízka      |
| Fáza 2 | 2-3 dni | 🟡 MEDIUM | Stredná    |
| Fáza 3 | 3-4 dni | 🟡 MEDIUM | Stredná    |
| Fáza 4 | 1-2 dni | 🟢 LOW    | Nízka      |
| Fáza 5 | 1-2 dni | 🟢 LOW    | Nízka      |

**Celkový čas: 8-13 dní**

---

## 🎯 **ODPORÚČANIE**

**ZAČNI S FÁZOU 1** - kritické bezpečnostné opravy sú najdôležitejšie. Zvyšok môžeš implementovať postupne podľa potreby.

Váš projekt je **dobro navrhnutý** a nepotrebuje drastické zmeny. Tieto vylepšenia ho urobia **bezpečnejším, rýchlejším a modernším** bez zbytočnej komplexity.
