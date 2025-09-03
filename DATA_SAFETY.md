# 🛡️ DATA SAFETY GUIDE - 3ple Digit

## 🚨 KRITICKÉ UPOZORNENIE

**NIKDY nespúšťajte `railway run pnpm db:seed` v produkcii!**
**Tento príkaz ZMAŽE VŠETKY VAŠE DÁTA!**

## 🔍 Prečo sa dáta strácajú?

### Hlavné príčiny:

1. **Seed script maže dáta** - `seed.ts` obsahuje `deleteMany()` operácie
2. **Manuálne spúšťanie seed** - `railway run pnpm db:seed`
3. **Deployment hooks** - automatické spúšťanie seed pri deploy

## 🛡️ Bezpečnostné opatrenia (IMPLEMENTOVANÉ)

### 1. Seed Script Protection

```typescript
// Nový bezpečnostný kód v seed.ts:
const isProduction = process.env.NODE_ENV === 'production';
const isRailwayEnv = process.env.RAILWAY_ENVIRONMENT === 'production';
const hasProductionUrl = process.env.DATABASE_URL?.includes('railway.app');

if (isProduction || isRailwayEnv || hasProductionUrl) {
  throw new Error('PRODUCTION SEED BLOCKED: Use manual data import');
}
```

### 2. Backup System

```bash
# Vytvorenie zálohy
railway run pnpm db:backup

# Obnovenie zo zálohy
railway run pnpm db:restore backup-file.json

# Zoznam záloh
railway run pnpm db:list-backups
```

## 📋 BEZPEČNÉ POSTUPY

### ✅ POVOLENÉ príkazy v produkcii:

```bash
railway run pnpm db:backup                    # Vytvorenie zálohy
railway run pnpm db:list-backups             # Zoznam záloh
railway run pnpm db:restore backup.json      # Obnovenie (s potvrdením)
railway logs                                 # Zobrazenie logov
railway variables                            # Environment variables
```

### ❌ ZAKÁZANÉ príkazy v produkcii:

```bash
railway run pnpm db:seed                     # MAŽE VŠETKY DÁTA!
railway run npm run db:seed                  # MAŽE VŠETKY DÁTA!
railway run tsx src/core/seed.ts             # MAŽE VŠETKY DÁTA!
```

## 🔄 Postup pri strate dát

### 1. Okamžite vytvorte zálohu aktuálneho stavu

```bash
railway run pnpm db:backup emergency-$(date +%Y%m%d-%H%M%S).json
```

### 2. Skontrolujte Railway logy

```bash
railway logs
```

### 3. Ak máte zálohu, obnovte dáta

```bash
# Zoznam dostupných záloh
railway run pnpm db:list-backups

# Obnovenie (vyžaduje FORCE_PRODUCTION_RESTORE=true)
FORCE_PRODUCTION_RESTORE=true railway run pnpm db:restore backup-file.json
```

## 📊 Monitoring a prevencie

### 1. Pravidelné zálohy

```bash
# Denné zálohy (nastavte cron job)
railway run pnpm db:backup daily-$(date +%Y%m%d).json
```

### 2. Monitoring Railway logov

- Sledujte logy na podozrivé `deleteMany()` operácie
- Upozornenia na nové `userId` (znamená nových používateľov = možná strata dát)

### 3. Environment variables monitoring

```bash
# Pravidelne kontrolujte nastavenia
railway variables
```

## 🚨 Varovania v logoch

Tieto správy znamenajú STRATU DÁT:

```
🧹 Cleaning existing data...
info: 👥 Creating users...
User logged in successfully {"userId":"NEW_DIFFERENT_ID"}
```

## 📞 Nápomoc

Ak sa dáta stratili:

1. **OKAMŽITE** prestante používať aplikáciu
2. Vytvorte zálohu aktuálneho stavu
3. Skontrolujte Railway logy
4. Kontaktujte vývojára s logmi

## 🔐 Dodatočné bezpečnostné opatrenia

### 1. Database Constraints

- Pridané foreign key constraints
- Cascade delete protection

### 2. Audit Trail

- Všetky zmeny sa logujú do `audit_logs`
- Tracking používateľských akcií

### 3. Environment Validation

- Kontrola produkčného prostredia
- Blokovanie nebezpečných operácií

---

**PAMÄTAJTE: Vaše dáta sú nenahraditeľné. Vždy vytvorte zálohu pred akoukoľvek operáciou!**
