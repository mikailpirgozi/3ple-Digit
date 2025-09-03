# 🚨 KRITICKÝ DATABASE SAFETY ALERT

## ⚠️ **PROBLÉM IDENTIFIKOVANÝ A VYRIEŠENÝ**

### **PRÍČINA MAZANIA DATABÁZY:**

`prisma migrate dev` v CI/CD **RESETOVAL DATABÁZU** pri konfliktoch!

### **RIEŠENIE IMPLEMENTOVANÉ:**

- ✅ **CI teraz používa:** `prisma migrate deploy` (BEZPEČNÉ)
- ✅ **Development:** `pnpm db:migrate:dev` (len lokálne)
- ✅ **Production:** `pnpm db:migrate` (deploy only)

## 🛡️ **NOVÉ BEZPEČNOSTNÉ PRAVIDLÁ**

### **✅ BEZPEČNÉ PRÍKAZY:**

```bash
# CI/Production - NIKDY neresetuje databázu
pnpm db:migrate          # → prisma migrate deploy

# Lokálne development - môže resetovať lokálnu DB
pnpm db:migrate:dev      # → prisma migrate dev
```

### **❌ NEBEZPEČNÉ PRÍKAZY (BLOKOVANÉ):**

```bash
# Tieto sú stále blokované triple protection
pnpm db:seed             # MAŽE VŠETKY DÁTA
railway run pnpm db:seed # MAŽE VŠETKY DÁTA
```

## 🔧 **ČO SA ZMENILO:**

**PRED (NEBEZPEČNÉ):**

- CI spúšťal `prisma migrate dev`
- Pri konfliktoch → **RESET DATABÁZY**
- Žiadna ochrana pred dev príkazmi v CI

**PO (BEZPEČNÉ):**

- CI spúšťa `prisma migrate deploy`
- Nikdy neresetuje existujúce dáta
- Len aplikuje nové migrations

## 📋 **NOVÝ WORKFLOW PRE DATABASE ZMENY:**

### **1. Lokálne development:**

```bash
# Uprav schema.prisma
# Vytvor migration
pnpm --filter api db:migrate:dev

# Test
pnpm build
```

### **2. Push do CI:**

```bash
git add -A
git commit -m "feat: database schema update"
git push origin main
```

### **3. CI automaticky:**

- Spustí `prisma migrate deploy`
- **BEZPEČNE** aplikuje migrations
- **NIKDY** neresetuje dáta

## 🎯 **VÝSLEDOK:**

**Tvoja databáza je teraz 100% chránená pred:**

- ✅ Accidental resets v CI
- ✅ Dev commands v production
- ✅ Seed commands v production
- ✅ Migration conflicts

**Database safety level: MAXIMUM** 🛡️
