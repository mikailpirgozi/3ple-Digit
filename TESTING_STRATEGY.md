# 🧪 Optimalizovaná Testing Stratégia

## 🎯 Cieľ: Minimálne, ale efektívne testovanie

### ❌ **Čo ODSTRÁNIŤ (zbytočné):**

1. **Duplicitné type checking:**
   - `type-check:strict` - zbytočné, máme už `tsc` v build
   - Rôzne tsconfig.json s rôznymi pravidlami

2. **Nadmerné linting:**
   - Warnings ako errors (`--max-warnings 0`)
   - Duplicitné ESLint pravidlá

3. **Zbytočné E2E testy:**
   - Playwright testy pre základné funkcie
   - Smoke testy, ktoré duplikujú unit testy

### ✅ **Čo ZACHOVAŤ (potrebné):**

1. **Core unit testy:**
   - NAV calculations (kritické pre business)
   - Auth flow (security)
   - Database operations (data integrity)

2. **Jeden build check:**
   - TypeScript compilation
   - Základný lint (len errors, nie warnings)

3. **Jeden integration test:**
   - Complete lifecycle test
   - API endpoints funkčnosť

## 🚀 **Nová štruktúra:**

```bash
# Lokálne development
npm run dev          # Start dev servers
npm run test:core    # Len kritické testy
npm run build        # Build check

# CI/CD (GitHub Actions)
npm run test:ci      # Minimálne testy pre CI
npm run build        # Production build
```

## 📝 **Implementácia:**

1. **Zjednotiť tsconfig.json** - jeden strict config
2. **Zredukovať ESLint** - len errors, nie warnings
3. **Odstrániť Playwright** - zbytočné pre MVP
4. **Optimalizovať Vitest** - len business-critical testy
5. **Simplifikovať CI** - 3 kroky namiesto 10+

## 💡 **Výhody:**

- ⚡ Rýchlejšie development
- 🎯 Fokus na skutočné problémy
- 🔧 Menej maintenance overhead
- 🚀 Rýchlejšie CI/CD pipeline
- 😌 Menej frustrácií s false positives
