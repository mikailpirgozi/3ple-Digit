# 🛡️ DATABASE PROTECTION SYSTEM

Tento systém poskytuje **maximálnu ochranu** Railway PostgreSQL databázy proti náhodnému zmazaniu alebo poškodeniu.

## 🚨 DÔLEŽITÉ PRAVIDLÁ

### ❌ NIKDY NEPOUŽÍVAJ TIETO PRÍKAZY NA PRODUKCII:
```bash
npx prisma db push          # NEBEZPEČNÉ - môže zmazať dáta
npx prisma migrate reset    # NEBEZPEČNÉ - zmaže celú databázu  
npx prisma db seed --force  # NEBEZPEČNÉ - môže prepísať dáta
```

### ✅ NAMIESTO TOHO POUŽÍVAJ BEZPEČNÉ PRÍKAZY:
```bash
npm run db:migrate "describe_change"    # Bezpečná migrácia s backup
npm run db:backup                       # Manuálna záloha
npm run db:status                       # Kontrola stavu ochrany
npm run db:list-backups                 # Zoznam záloh
```

## 🛡️ OCHRANNÉ SYSTÉMY

### 1. **Automatické zálohy**
- Pred každou migráciou sa automaticky vytvorí záloha
- Zálohy sa uchovávaju v `apps/api/backups/`
- Automaticky sa mazú staršie zálohy (max 10)

### 2. **Blokovanie nebezpečných príkazov**
- `prisma db push` je blokovaný na produkcii
- `migrate reset` je úplne blokovaný
- Všetky nebezpečné SQL príkazy sú blokované

### 3. **Environment detection**
- Automaticky detekuje produkčné prostredie
- Railway databázy sú automaticky chránené
- Lokálne databázy majú menej reštrikcií

### 4. **Pre-commit hooks**
- Kontroluje zmeny v Prisma schéme
- Blokuje commit s nebezpečnými príkazmi
- Automaticky vytvára zálohy pred zmenami

## 📋 NÁVOD NA POUŽITIE

### Vytvorenie zálohy
```bash
npm run db:backup
npm run db:backup "before_major_change"
```

### Bezpečná migrácia
```bash
npm run db:migrate "add_user_fields"
```

### Obnovenie zo zálohy
```bash
npm run db:restore path/to/backup.sql
```

### Kontrola stavu
```bash
npm run db:status
npm run db:list-backups
```

## 🔧 MANUÁLNE PRÍKAZY

### Vytvorenie zálohy
```bash
cd apps/api
node database-protection.js backup "reason"
```

### Bezpečná migrácia
```bash
cd apps/api  
node database-protection.js migrate "migration_name"
```

### Obnovenie
```bash
cd apps/api
node database-protection.js restore backups/backup_file.sql
```

### Kontrola príkazu
```bash
cd apps/api
node database-protection.js check "prisma db push"
```

## 🚨 V PRÍPADE NÚDZE

### Ak sa databáza poškodí:
1. **Neklikaj!** - zastav všetky operácie
2. Skontroluj zálohy: `npm run db:list-backups`
3. Obnov najnovšiu zálohu: `npm run db:restore backup_file.sql`
4. Kontaktuj administrátora

### Ak potrebuješ urobiť nebezpečnú operáciu:
1. Vytvor zálohu: `npm run db:backup "before_dangerous_operation"`
2. Testuj na lokálnej databáze
3. Použij migrácie namiesto `db push`
4. Kontaktuj administrátora pre potvrdenie

## 📁 ŠTRUKTÚRA SÚBOROV

```
apps/api/
├── database-protection.js      # Hlavný ochranný systém
├── safe-prisma.js             # Wrapper pre Prisma príkazy  
├── database-protection.config.js # Konfigurácia
├── backups/                   # Automatické zálohy
│   ├── backup_2025-09-19.sql
│   └── pre_migration_*.sql
└── package.json               # Bezpečné npm scripty
```

## ⚙️ KONFIGURÁCIA

Upraviť v `database-protection.config.js`:
- `MAX_BACKUPS`: počet záloh na uchovanie
- `BLOCKED_COMMANDS`: zoznam blokovaných príkazov
- `PRODUCTION_INDICATORS`: indikátory produkčného prostredia

## 🧪 TESTOVANIE OCHRANY

```bash
# Test detekcie produkčného prostredia
npm run db:status

# Test blokovania nebezpečných príkazov
node apps/api/database-protection.js check "prisma db push"

# Test vytvorenia zálohy
npm run db:backup "test"
```

## 📞 PODPORA

V prípade problémov:
1. Skontroluj `npm run db:status`
2. Pozri zálohy `npm run db:list-backups`  
3. Skontroluj logy v termináli
4. Kontaktuj administrátora

---

## 🎯 ZHRNUTIE - BEZPEČNÉ WORKFLOW

```bash
# 1. Pred zmenou schémy
npm run db:backup "before_schema_change"

# 2. Urob zmenu v schema.prisma

# 3. Vytvor migráciu
npm run db:migrate "describe_your_change"

# 4. Skontroluj výsledok
npm run db:status

# 5. V prípade problému obnov
npm run db:restore backups/latest_backup.sql
```

**Pamätaj: Lepšie je byť opatrný ako stratiť dáta!** 🛡️
