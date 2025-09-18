# 🔍 AKO NÁJSŤ SPRÁVNY DATABASE_URL

## V Railway Postgres Service Variables

Budete vidieť NIEKOĽKO premenných:

### ❌ NESPRÁVNE (Interné - nefungujú z PC):

```
DATABASE_URL=postgresql://postgres:XXX@postgres.railway.internal:5432/railway
```

### ✅ SPRÁVNE (Externé - fungujú všade):

```
DATABASE_PUBLIC_URL=postgresql://postgres:XXX@roundhouse.proxy.rlwy.net:30703/railway
```

alebo

```
DATABASE_URL=postgresql://postgres:XXX@monorail.proxy.rlwy.net:12345/railway
```

## KDE HĽADAŤ:

1. **Otvorte Postgres service**
2. **Variables tab**
3. **Hľadajte:**
   - `DATABASE_PUBLIC_URL`
   - Alebo DATABASE_URL ktorý obsahuje `.proxy.rlwy.net`
4. **Ak nevidíte externý URL:**
   - V Postgres service choďte do **Settings**
   - Skrolujte na **Networking**
   - Kliknite **Enable Public Networking**
   - Počkajte minútu
   - Vráťte sa do Variables

## OVERENIE:

Správny URL musí obsahovať:

- ✅ `proxy.rlwy.net`
- ❌ NIE `railway.internal`

## PRÍKLAD SPRÁVNEHO:

```
postgresql://postgres:YTFSPNkYujIHcXaZygFejQFNFVrFyqqs@roundhouse.proxy.rlwy.net:30703/railway
```
