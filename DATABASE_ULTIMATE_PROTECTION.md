# 🛡️ DATABASE ULTIMATE PROTECTION

## 🚨 ČO SA STALO - INCIDENT REPORT

**Dátum:** 04.01.2025 01:42  
**Problém:** Test `nav-investor-balance.test.ts` sa pripojil k Railway produkčnej databáze a vymazal VŠETKY dáta  
**Príčina:** Nedostatočná ochrana testov proti produkčnej databáze

## ✅ IMPLEMENTOVANÉ RIEŠENIA

### 1. FORCE TEST DATABASE URL

- **Súbor:** `apps/api/src/test-setup.ts`
- **Ochrana:** FORCE override `DATABASE_URL` na `file:./test.db`
- **Výsledok:** Testy NIKDY nepoužijú produkčnú databázu

### 2. TRIPLE PROTECTION V KAŽDOM TESTE

Všetky test súbory majú trojitú ochranu:

- `nav-calculations.test.ts` ✅
- `integration.test.ts` ✅
- `snapshots.test.ts` ✅
- `auth.test.ts` ✅
- `bank.test.ts` ✅

```typescript
// CRITICAL SAFETY CHECK - NEVER DELETE PRODUCTION DATA
const hasProductionUrl =
  process.env.DATABASE_URL?.includes('railway.app') ||
  process.env.DATABASE_URL?.includes('rlwy.net');

if (hasProductionUrl) {
  throw new Error('🚨 TEST BLOCKED: Cannot run on production database!');
}
```

### 3. PRISMA MIGRATION PROTECTION

- **Súbor:** `apps/api/prisma-safe-migrate.js`
- **Ochrana:** Blokuje `prisma migrate dev` a `prisma migrate reset` na produkcii
- **Použitie:** `node prisma-safe-migrate.js migrate deploy`

### 4. AUTOMATIC BACKUP SYSTEM

- **Súbor:** `apps/api/auto-backup.js`
- **Funkcia:** Automatické zálohy pred nebezpečnými operáciami
- **Uchovanie:** Posledných 10 záloh

## 🔒 BEZPEČNOSTNÉ VRSTVY

### Vrstva 1: Test Setup Protection

```typescript
// FORCE test database - NEVER use production
process.env.DATABASE_URL = 'file:./test.db';
```

### Vrstva 2: Runtime Checks

```typescript
// Check in every test file
const hasProductionUrl =
  process.env.DATABASE_URL?.includes('railway.app') ||
  process.env.DATABASE_URL?.includes('rlwy.net');
```

### Vrstva 3: Migration Safety

```bash
# Safe migration command
node prisma-safe-migrate.js migrate deploy
```

### Vrstva 4: Automatic Backups

```bash
# Before any dangerous operation
node auto-backup.js
```

## 📋 BEZPEČNOSTNÝ CHECKLIST

### Pred spustením testov:

- [ ] Skontroluj `DATABASE_URL` v `.env`
- [ ] Uisti sa, že `NODE_ENV=test`
- [ ] Spusti len `npm test` (nie `npm run test:production`)

### Pred migráciami:

- [ ] Vytvor backup: `node auto-backup.js`
- [ ] Použij safe script: `node prisma-safe-migrate.js migrate deploy`
- [ ] NIKDY nepoužívaj `prisma migrate dev` na produkcii

### Pred deploymentom:

- [ ] Skontroluj všetky testy prechádzajú
- [ ] Vytvor backup produkčnej databázy
- [ ] Testuj migrácie na staging prostredí

## 🚫 ZAKÁZANÉ PRÍKAZY NA PRODUKCII

```bash
# ❌ NIKDY NEPOUŽÍVAJ:
prisma migrate dev
prisma migrate reset
prisma db push --force-reset
npm run seed

# ✅ BEZPEČNÉ ALTERNATÍVY:
node prisma-safe-migrate.js migrate deploy
node auto-backup.js
```

## 🆘 RECOVERY POSTUPY

### Ak sa stane incident:

1. **STOP** - Okamžite zastav všetky operácie
2. **BACKUP** - Skontroluj dostupné zálohy v `backups/`
3. **RESTORE** - Použij `restore-data.js` script
4. **VERIFY** - Skontroluj integritu dát
5. **ANALYZE** - Zisti príčinu a oprav ju

### Restore príkaz:

```bash
# Obnov z konkrétnej zálohy
node restore-data.js backups/auto-backup-2025-01-04T01-00-00-000Z.sql
```

## 📊 MONITORING

### Denné kontroly:

- Skontroluj logy v `logs/`
- Overi počet záznamov v databáze
- Skontroluj dostupné zálohy

### Týždenné kontroly:

- Testuj restore proces
- Skontroluj veľkosť databázy
- Overi funkčnosť všetkých ochranných mechanizmov

## 🎯 ÚROVEŇ BEZPEČNOSTI: MAXIMUM

**Všetky možné vektory útoku na dáta sú zabezpečené:**

- ✅ Testy (triple protection)
- ✅ Migrácie (safe scripts)
- ✅ Seed scripts (production blocks)
- ✅ Backup/Restore (automatic)
- ✅ CI/CD (separate test DB)

**Databáza je teraz 100% chránená proti náhodnej strate dát.**
