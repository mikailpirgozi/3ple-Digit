# ⚠️ DÔLEŽITÉ - Manuálne Spúšťanie Serverov

## Zmena Nastavenia

**Automatické spúšťanie pri štarte systému bolo ZRUŠENÉ** na požiadanie používateľa.

## Ako Spustiť Servery

### 🚀 Rýchle Spustenie

```bash
./start-servers.sh
```

### 🛑 Zastavenie

```bash
./stop-servers.sh
```

### 📊 Status

```bash
./status.sh
# alebo
pm2 status
```

## Čo Sa Zmenilo

✅ **Ponechané:**

- Automatické reštartovanie pri páde aplikácie
- Databázové reconnect
- PM2 process management
- Všetky skripty a konfigurácie

❌ **Zrušené:**

- Automatické spúšťanie pri štarte Mac-u
- PM2 startup service
- Automatické načítanie procesov po reštarte

## Po Reštarte Mac-u

Servery sa **NESPUSTIA automaticky**. Musíte ich spustiť manuálne:

```bash
cd "/Users/mikailpirgozi/Desktop/Cursor zalohy mac16/3ple digit aplikacia"
./start-servers.sh
```

## URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000

---

**Poznámka**: Toto nastavenie zabraňuje konfliktom s inými aplikáciami a projektmi.
