# Railway R2 Credentials - SPRÁVNE HODNOTY

## Aktualizujte tieto premenné v Railway Backend Service:

### ✅ SPRÁVNE HODNOTY:

```bash
R2_ACCESS_KEY_ID=b448155afb265f743934a8e85789d712

R2_SECRET_ACCESS_KEY=0a44d12d928751f610baedf57c276e79ca303f2e3529c95530f07595ee4f33af

R2_ACCOUNT_ID=9ccdca0d876e24bd9acefabe56f94f53

R2_BUCKET_NAME=3ple-digit-documents-prod

R2_PUBLIC_URL=https://9ccdca0d876e24bd9acefabe56f94f53.r2.cloudflarestorage.com
```

## ⚠️ DÔLEŽITÉ OPRAVY:

Na screenshote vidím, že máte NESPRÁVNE hodnoty:

1. **R2_ACCESS_KEY_ID** - máte tam iný kľúč, musíte ho zmeniť na:
   ```
   b448155afb265f743934a8e85789d712
   ```

2. **R2_SECRET_ACCESS_KEY** - musíte ho zmeniť na:
   ```
   0a44d12d928751f610baedf57c276e79ca303f2e3529c95530f07595ee4f33af
   ```

3. **R2_ACCOUNT_ID** - musíte ho zmeniť na:
   ```
   9ccdca0d876e24bd9acefabe56f94f53
   ```

4. **R2_PUBLIC_URL** - musíte ho zmeniť na:
   ```
   https://9ccdca0d876e24bd9acefabe56f94f53.r2.cloudflarestorage.com
   ```

## Ako aktualizovať:

1. V Railway Dashboard kliknite na premenné ktoré chcete zmeniť
2. Nahraďte hodnoty vyššie uvedenými
3. Kliknite mimo políčka aby sa uložili zmeny
4. Backend sa automaticky reštartuje

## Po aktualizácii:

1. Počkajte kým sa backend redeployuje (2-3 minúty)
2. V logoch by ste mali vidieť:
   ```
   R2 Service initialized with bucket: 3ple-digit-documents-prod
   ```
3. Otestujte upload dokumentu na https://3ple-digit-qtqq.vercel.app

## CORS Policy pre R2 Bucket

Uistite sa, že máte nastavenú CORS policy v Cloudflare R2:

1. Choďte do Cloudflare Dashboard → R2 → 3ple-digit-documents-prod
2. Settings → CORS Policy
3. Vložte:

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

---

**POZNÁMKA:** Tieto credentials sú z vašich Cloudflare R2 API tokens. Nikdy ich nezdieľajte verejne!
