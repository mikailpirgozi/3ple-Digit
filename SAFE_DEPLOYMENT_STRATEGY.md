# 🛡️ BEZPEČNÁ DEPLOYMENT STRATÉGIA

## ⚠️ PROBLÉM

Railway automaticky spúšťa `pnpm db:deploy` pri každom deploye, čo môže zmazať produkčné dáta.

## ✅ RIEŠENIE

### 1. ZMENIŤ RAILWAY START COMMAND

**AKTUÁLNE (NEBEZPEČNÉ):**

```bash
cd apps/api && pnpm db:deploy && pnpm start
```

**NOVÉ (BEZPEČNÉ):**

```bash
cd apps/api && pnpm start
```

### 2. MANUÁLNE MIGRÁCIE

Migrácie spúšťaj **MANUÁLNE** len keď je potrebné:

```bash
# 1. Najprv vytvor zálohu
railway run pnpm db:backup emergency-$(date +%Y%m%d-%H%M%S).json

# 2. Potom spusti migrácie
railway run pnpm db:deploy

# 3. Overte že všetko funguje
railway run pnpm db:status
```

### 3. AUTOMATICKÉ ZÁLOHY

Pridaj do package.json:

```json
{
  "scripts": {
    "deploy:safe": "pnpm db:backup && pnpm db:deploy",
    "db:backup": "tsx src/core/backup-restore.ts backup",
    "db:restore": "tsx src/core/backup-restore.ts restore"
  }
}
```

### 4. PRE-DEPLOYMENT CHECKLIST

Pred každým deployom:

1. ✅ Vytvor zálohu databázy
2. ✅ Otestuj migrácie lokálne
3. ✅ Overte že Railway start command NEOBSAHUJE `db:deploy`
4. ✅ Sleduj Railway logy počas deployu

### 5. STAGING ENVIRONMENT

Vytvor staging databázu na testovanie:

```bash
# Vytvor staging service
railway add postgresql --name postgres-staging

# Test migrácie na staging
STAGING_DATABASE_URL=xxx pnpm db:deploy
```

### 6. ROLLBACK STRATÉGIA

Ak sa niečo pokazí:

```bash
# 1. Zastaviť aplikáciu
railway service stop

# 2. Obnoviť z zálohy
railway run pnpm db:restore backup-file.json

# 3. Spustiť aplikáciu
railway service start
```

## 🚨 KRITICKÉ PRAVIDLÁ

1. **NIKDY** nespúšťaj `db:deploy` automaticky v produkčnom start command
2. **VŽDY** vytvor zálohu pred migráciami
3. **TESTUJ** migrácie na staging prostredí
4. **SLEDUJ** Railway logy počas deployu
5. **MÁJ** pripravený rollback plán

## 📋 AKČNÝ PLÁN

### OKAMŽITE:

1. Zmeň Railway start command na `cd apps/api && pnpm start`
2. Vytvor automatickú zálohu pred každým deployom

### DLHODOBO:

1. Nastav staging environment
2. Implementuj automated backup systém
3. Vytvor monitoring pre databázové zmeny
