# 🚀 Development Workflow - Best Practices

## ✅ **PRED KAŽDÝM COMMITOM (Lokálne checky)**

### 1. **Rýchly build check**

```bash
pnpm build
```

- Ak prejde lokálne → prejde aj v CI
- Ak zlyhá → oprav pred commitom

### 2. **Core testy (voliteľné, ale odporúčané)**

```bash
pnpm --filter api test:core
```

- Testuje len business-critical logiku
- Rýchlejšie ako všetky testy

### 3. **Lint check (informatívny)**

```bash
pnpm lint
```

- Warnings sú OK (neblokujú CI)
- Len errors sú problém

## 🎯 **OPTIMÁLNY DEVELOPMENT FLOW**

### **Pre nové features:**

1. **Vytvor feature branch**

   ```bash
   git checkout -b feature/nova-funkcionalita
   ```

2. **Vyvíjaj s live reload**

   ```bash
   # Backend
   cd apps/api && pnpm dev

   # Frontend
   cd apps/web && pnpm dev
   ```

3. **Pred commitom - rýchly check**

   ```bash
   pnpm build  # Musí prejsť!
   ```

4. **Commit & push**
   ```bash
   git add -A
   git commit -m "feat: popis novej funkcionality"
   git push origin feature/nova-funkcionalita
   ```

## 🔧 **TYPY ZMIEN A ICH HANDLING**

### **Frontend zmeny (apps/web/)**

- ✅ **Bezpečné:** UI komponenty, štýly, routing
- ⚠️ **Pozor:** API typy, hooks s async operáciami
- **Check:** `pnpm --filter web build`

### **Backend zmeny (apps/api/)**

- ✅ **Bezpečné:** Nové endpoints, business logika
- ⚠️ **Pozor:** Prisma schema zmeny, database migrations
- **Check:** `pnpm --filter api build && pnpm --filter api test:core`

### **Database zmeny (prisma/schema.prisma)**

```bash
# 1. Uprav schema
# 2. Vytvor migration (LOKÁLNE DEVELOPMENT)
pnpm --filter api db:migrate:dev

# 3. Test že funguje
pnpm --filter api build
pnpm --filter api test:core

# POZNÁMKA: CI používa db:migrate (deploy) - BEZPEČNÉ!
```

## 🚨 **AK SA NIEČO POKAZÍ**

### **Build fails lokálne:**

```bash
# 1. Skontroluj TypeScript errors
pnpm --filter api build
pnpm --filter web build

# 2. Oprav syntax/type errors
# 3. Test znova
pnpm build
```

### **CI fails na GitHub:**

1. **Pozri GitHub Actions log**
2. **Reprodukuj lokálne:**
   ```bash
   # Simuluj CI environment
   rm -rf node_modules
   pnpm install --frozen-lockfile
   pnpm db:generate
   pnpm build
   ```
3. **Oprav a push znova**

### **Databáza problémy:**

- ❌ **NIKDY** nespúšťaj `pnpm db:seed` v produkcii
- ✅ **Len migrations:** `pnpm --filter api db:migrate`
- 🛡️ **Triple protection** ťa chráni pred vymazaním

## 💡 **PRO TIPS**

### **Rýchly development:**

```bash
# Alias pre rýchly check
alias quickcheck="pnpm build && echo '✅ Build OK'"

# Pred každým commitom
quickcheck && git add -A && git commit
```

### **Debugging:**

```bash
# Ak build zlyhá, pozri detaily
pnpm --filter api build 2>&1 | head -20

# Ak testy zlyhajú
pnpm --filter api test:core --reporter=verbose
```

### **Performance:**

- **Lokálne:** Používaj `pnpm dev` pre live reload
- **CI:** Optimalizované na 3 kroky (Generate → Build → Test)
- **Warnings:** Ignorované v CI, len informatívne

## 🎯 **SUMMARY - Tvoj nový workflow:**

1. **Vyvíjaj** s `pnpm dev`
2. **Pred commitom** spusti `pnpm build`
3. **Ak prejde** → commit & push
4. **CI automaticky** otestuje všetko
5. **Warnings** sú OK, len **errors** blokujú

**Výsledok:** Rýchly development, žiadne false positives, fokus na skutočné problémy! 🚀
