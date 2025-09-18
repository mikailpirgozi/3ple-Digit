# 🔧 PRISMA TROUBLESHOOTING GUIDE

## 🚨 Časté problémy a riešenia

### 1. **"Provider mismatch" chyba**

**Symptómy:**

```
Error validating datasource `db`: the URL must start with the protocol `file:`.
provider = "sqlite"
```

**Príčina:** Prisma klient používa starú schému

**Riešenie:**

```bash
cd apps/api
rm -rf node_modules/.prisma
npx prisma generate
pnpm build
# Reštartuj server
```

### 2. **Automatická oprava**

Projekt má automatický fix skript:

```bash
node prisma-auto-fix.js
```

Spustí sa automaticky pri `pnpm start`.

### 3. **Manuálna kontrola**

```bash
# Skontroluj provider v schéme
grep "provider" apps/api/prisma/schema.prisma

# Skontroluj DATABASE_URL
echo $DATABASE_URL

# Regeneruj klienta
cd apps/api && npx prisma generate
```

### 4. **Development vs Production**

- **Development:** `postgresql` provider + Railway DATABASE_URL
- **Tests:** `sqlite` provider + `file:./test.db`
- **CI:** Automaticky používa `schema.test.prisma`

### 5. **Ak sa problém opakuje**

1. Skontroluj `.env` súbor
2. Overte DATABASE_URL
3. Vyčistite cache: `rm -rf node_modules/.prisma`
4. Regenerujte: `npx prisma generate`
5. Rebuildnite: `pnpm build`

## 🛡️ Prevencia

- Auto-fix skript zabezpečuje konzistenciu
- Vždy po zmene schémy spustite `npx prisma generate`
- Používajte `pnpm start` namiesto priameho `node dist/index.js`
