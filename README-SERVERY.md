# 🚀 3PLE DIGIT - Automatické Spúšťanie Serverov

## Rýchle Spustenie

```bash
# Spustiť oba servery s automatickým reštartovaním
./start-servers.sh

# Zastaviť servery
./stop-servers.sh
```

## Servery

- **Frontend**: http://localhost:3000 (Vite dev server)
- **Backend API**: http://localhost:4000 (Express server)

## Automatické Funkcie

### ✅ Automatické Reštartovanie

- Servery sa automaticky reštartujú pri páde
- Exponenciálne oneskorenie pri opakovaných pádoch
- Maximálne 10 pokusov o reštart
- Minimálny čas behu 10 sekúnd pred reštartom

### ⚠️ Manuálne Spúšťanie

- Servery sa spúšťajú len manuálne cez `./start-servers.sh`
- Po reštarte Mac-u je potrebné spustiť servery manuálne
- Automatické spúšťanie pri štarte systému je vypnuté

### ✅ Databázové Pripojenie

- Automatické znovupripojenie pri výpadku databázy
- Health check každých 30 sekúnd
- Maximálne 5 pokusov o reconnect
- Inteligentné logovanie problémov

### ✅ Monitoring a Logy

- Všetky logy sa ukladajú do `./logs/` priečinka
- Rozdelené logy pre API a Web
- Timestamp pre každý log záznam
- PM2 dashboard pre monitoring

## PM2 Príkazy

```bash
# Status serverov
pm2 status

# Zobraziť logy (všetky)
pm2 logs

# Zobraziť logy len pre API
pm2 logs 3ple-digit-api

# Zobraziť logy len pre Web
pm2 logs 3ple-digit-web

# Reštartovať všetky servery
pm2 restart all

# Reštartovať len API
pm2 restart 3ple-digit-api

# Zastaviť všetky servery
pm2 stop all

# Zmazať všetky procesy
pm2 delete all

# Monitoring dashboard
pm2 monit
```

## Riešenie Problémov

### Server sa nespustí

```bash
# Skontroluj logy
pm2 logs

# Reštartuj manuálne
pm2 restart all

# Kompletný restart
pm2 delete all
./start-servers.sh
```

### Databázové problémy

- Servery majú automatické reconnect
- Skontroluj `DATABASE_URL` v `.env`
- Pozri logy: `pm2 logs 3ple-digit-api`

### Port už používaný

```bash
# Nájdi proces na porte
lsof -i :3000
lsof -i :4000

# Zastaviť proces
kill -9 <PID>
```

## Konfiguračné Súbory

- `ecosystem.config.cjs` - PM2 konfigurácia
- `start-servers.sh` - Spúšťací skript
- `stop-servers.sh` - Zastavovací skript
- `logs/` - Priečinok s logmi

## Manuálne Spúšťanie

Servery sa spúšťajú len manuálne. Po reštarte Mac-u je potrebné spustiť:

```bash
# Spustiť servery
./start-servers.sh

# Alebo individuálne
pm2 start ecosystem.config.cjs
```

---

**Poznámka**: Servery teraz bežia stabilne s automatickým reštartovaním a databázovým reconnectom. Pri akýchkoľvek problémoch sa pozrite do logov pomocou `pm2 logs`.
