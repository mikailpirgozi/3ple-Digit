# 🚨 VERCEL ENVIRONMENT VARIABLES SETUP

## PROBLÉM:

Frontend sa pokúša pripojiť na `http://localhost:4000` namiesto Railway backend!

## RIEŠENIE:

Nastavte tieto environment variables vo Vercel Dashboard:

### 1. Choďte na Vercel Dashboard:

https://vercel.com/dashboard

### 2. Kliknite na projekt "3ple-digit-qtqq"

### 3. Choďte do Settings → Environment Variables

### 4. Pridajte tieto premenné:

```
VITE_API_URL = https://backend-production-2bd2.up.railway.app
VITE_APP_NAME = 3ple Digit
VITE_NODE_ENV = production
```

### 5. Pre každú premennú:

- Name: `VITE_API_URL`
- Value: `https://backend-production-2bd2.up.railway.app`
- Environment: Production, Preview, Development (všetky)

### 6. Po pridaní všetkých premenných:

- Kliknite "Save"
- Choďte do Deployments tab
- Kliknite "Redeploy" na poslednom deployment

### 7. Počkajte 2-3 minúty na redeploy

### 8. Testujte login na:

https://3ple-digit-qtqq.vercel.app

**Credentials:**

- Email: admin@3pledigit.sk
- Password: Admin123!@#
