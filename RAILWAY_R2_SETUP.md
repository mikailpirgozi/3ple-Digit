# Railway R2 Configuration - URGENTNÉ! 🚨

## Problém
Backend používa mock R2 URL pretože nemá nastavené R2 credentials v Railway!

## Riešenie - Pridajte tieto premenné do Railway Backend Service

### 1. Otvorte Railway Dashboard
- Choďte na https://railway.app/dashboard
- Kliknite na váš projekt
- Vyberte **backend** service

### 2. Pridajte R2 Premenné
Choďte do **Variables** tab a pridajte tieto premenné:

```bash
# Cloudflare R2 Storage - POVINNÉ PRE UPLOAD DOKUMENTOV!
R2_ACCOUNT_ID=<your-cloudflare-account-id>
R2_ACCESS_KEY_ID=<your-r2-access-key-id>
R2_SECRET_ACCESS_KEY=<your-r2-secret-access-key>
R2_BUCKET_NAME=3ple-digit-documents-prod
R2_PUBLIC_URL=https://pub-<hash>.r2.dev
```

### 3. Kde nájdete tieto hodnoty?

#### A. Cloudflare Account ID
1. Prihláste sa na https://dash.cloudflare.com
2. V pravom hornom rohu kliknite na váš účet
3. Account ID je zobrazený v Account Home

#### B. R2 API Credentials
1. V Cloudflare Dashboard choďte na **R2 Object Storage**
2. Kliknite na **Manage R2 API tokens**
3. Vytvorte nový token alebo použite existujúci:
   - **Token name**: 3ple-digit-production
   - **Permissions**: Object Read & Write
   - **Bucket**: 3ple-digit-documents-prod

#### C. R2 Public URL
1. V R2 Dashboard kliknite na váš bucket
2. Nájdite **Public R2.dev subdomain**
3. Ak nemáte, povoľte ho v Settings

## CORS Configuration na R2 Bucket

### 1. Otvorte R2 Bucket Settings
- V Cloudflare Dashboard → R2 → váš bucket
- Choďte do **Settings** tab
- Nájdite **CORS policy** sekciu

### 2. Nastavte CORS Policy
```json
[
  {
    "AllowedOrigins": [
      "https://3ple-digit-qtqq.vercel.app",
      "https://3ple-digit-qtqq-blackrents-projects.vercel.app",
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "HEAD",
      "DELETE"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Length",
      "Content-Type"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### 3. Uložte CORS Policy
- Vložte JSON konfiguráciu
- Kliknite **Save**
- Počkajte 5-10 minút na propagáciu

## Overenie Konfigurácie

### 1. Reštartujte Backend
Po pridaní premenných sa backend automaticky redeployuje. Počkajte na dokončenie.

### 2. Skontrolujte Logy
V Railway Dashboard → backend → Logs by ste mali vidieť:
```
✅ Environment loaded successfully
R2 Service initialized with bucket: 3ple-digit-documents-prod
```

### 3. Otestujte Upload
1. Otvorte aplikáciu: https://3ple-digit-qtqq.vercel.app
2. Prihláste sa ako admin
3. Choďte do Dokumenty
4. Skúste nahrať PDF súbor

## Troubleshooting

### Ak stále nefunguje upload:

1. **CORS Error v konzole**
   - Skontrolujte že CORS policy je správne nastavená
   - Overte že vaša Vercel doména je v AllowedOrigins
   - Vyčistite browser cache

2. **"Mock URL" v logoch**
   - Backend nemá R2 credentials
   - Skontrolujte Railway Variables
   - Backend musí byť reštartovaný

3. **403 Forbidden**
   - Nesprávne API credentials
   - Token nemá potrebné permissions
   - Bucket name nesedí

4. **Network Error**
   - CORS nie je správne nastavené
   - Presigned URL expirovala (default 15 min)

## DÔLEŽITÉ! ⚠️

**BEZ TÝCHTO R2 PREMENNÝCH UPLOAD DOKUMENTOV NEBUDE FUNGOVAŤ!**

Backend momentálne používa mock URLs pretože detekuje test credentials.
Musíte nastaviť skutočné R2 credentials v Railway Variables.

---

**Po nastavení všetkých premenných a CORS policy by upload dokumentov mal fungovať!**
