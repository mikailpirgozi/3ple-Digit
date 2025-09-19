# Cloudflare R2 CORS Setup pre 3ple Digit

## Problém
Pri nahrávaní dokumentov v produkcii sa zobrazuje chyba:
```
Error uploading document: TypeError: Failed to fetch
```

## Príčina
Frontend robí direct upload do Cloudflare R2 pomocou presigned URLs. R2 bucket musí mať správne CORS nastavenia, aby povolil cross-origin requesty z vašej domény.

## Riešenie

### 1. Nastavenie CORS v Cloudflare R2

Prihláste sa do Cloudflare Dashboard a prejdite na váš R2 bucket:

1. **Cloudflare Dashboard** → **R2 Object Storage** → **Váš bucket**
2. **Settings** → **CORS Policy**
3. Pridajte nasledujúcu CORS konfiguráciu:

```json
[
  {
    "AllowedOrigins": [
      "https://your-production-domain.vercel.app",
      "https://3ple-digit.vercel.app",
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### 2. Overenie R2 Credentials

Skontrolujte, že v produkcii máte nastavené správne R2 credentials:

**Railway Environment Variables:**
```bash
R2_ACCOUNT_ID=your-real-account-id
R2_ACCESS_KEY_ID=your-real-access-key-id  
R2_SECRET_ACCESS_KEY=your-real-secret-access-key
R2_BUCKET_NAME=your-production-bucket-name
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

### 3. Frontend Environment Variables

**Vercel Environment Variables:**
```bash
VITE_API_URL=https://your-railway-app.railway.app
VITE_NODE_ENV=production
```

### 4. Testovanie

Po nastavení CORS:
1. Redeploy aplikáciu
2. Skúste nahrať dokument
3. Skontrolujte Developer Tools → Network tab pre detaily o failed requestoch

### 5. Debug kroky

Ak problém pretrváva:

1. **Skontrolujte Network tab** - aká je skutočná URL kam sa pokúša upload?
2. **Skontrolujte Console** - nové error handling poskytne viac detailov
3. **Overte R2 bucket permissions** - má API key správne permissions?

### 6. Alternatívne riešenie

Ak CORS nefunguje, môžete implementovať proxy upload cez váš API:

```typescript
// Namiesto direct upload do R2, pošlite súbor na váš API
// API potom uploadne súbor do R2 server-side
const response = await api.post('/documents/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

## Poznámky

- CORS nastavenia sa môžu propagovať až 15 minút
- Testujte vždy v incognito mode aby ste vylúčili cache
- R2 CORS je case-sensitive pre domény
