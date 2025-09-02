# Cloudflare R2 Setup Guide

## 1. Vytvorenie R2 Bucket

### 1.1 Prihláste sa do Cloudflare Dashboard
- Choďte na https://dash.cloudflare.com
- Prihláste sa do vášho účtu

### 1.2 Navigácia do R2
- V ľavom menu kliknite na **R2 Object Storage**
- Ak je to prvýkrát, aktivujte R2 službu

### 1.3 Vytvorenie Bucket
```bash
Bucket Name: 3ple-digit-documents-prod
Location: Automatic (Cloudflare optimized)
```

## 2. API Token Configuration

### 2.1 Vytvorenie API Token
- Choďte do **Manage R2 API tokens**
- Kliknite **Create API token**

### 2.2 Token Permissions
```bash
Token name: 3ple-digit-production
Permissions: Object Read & Write
Account resources: Include - All accounts
Bucket resources: Include - Specific bucket: 3ple-digit-documents-prod
```

### 2.3 Získanie Credentials
Po vytvorení tokenu skopírujte:
- **Account ID**
- **Access Key ID**
- **Secret Access Key**

## 3. CORS Policy Setup

### 3.1 Navigácia do Bucket Settings
- Kliknite na váš bucket `3ple-digit-documents-prod`
- Choďte do **Settings** tab
- Nájdite **CORS policy** sekciu

### 3.2 CORS Configuration
```json
[
  {
    "AllowedOrigins": [
      "https://your-app.vercel.app",
      "https://3ple-digit.vercel.app",
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "GET",
      "PUT", 
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Length"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### 3.3 Aplikovanie CORS Policy
- Vložte JSON konfiguráciu
- Kliknite **Save**

## 4. Custom Domain (Voliteľné)

### 4.1 Pripojenie Custom Domain
- V bucket settings choďte do **Custom Domains**
- Kliknite **Connect Domain**
- Zadajte doménu (napr. `cdn.3pledigit.com`)

### 4.2 DNS Konfigurácia
```bash
Type: CNAME
Name: cdn
Target: <bucket-id>.r2.cloudflarestorage.com
```

### 4.3 Aktualizácia Environment Variables
```bash
R2_PUBLIC_URL=https://cdn.3pledigit.com
```

## 5. Environment Variables

### 5.1 Railway Backend Variables
```bash
R2_ACCOUNT_ID=<your-account-id>
R2_ACCESS_KEY_ID=<your-access-key-id>
R2_SECRET_ACCESS_KEY=<your-secret-access-key>
R2_BUCKET_NAME=3ple-digit-documents-prod
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

### 5.2 Overenie Konfigurácie
Test upload cez API endpoint:
```bash
curl -X POST https://your-railway-app.railway.app/api/documents/presign \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "test-document.pdf",
    "linkedType": "asset",
    "linkedId": "test-id",
    "mime": "application/pdf",
    "size": 1024,
    "sha256": "test-hash"
  }'
```

## 6. Security Best Practices

### 6.1 Bucket Permissions
- ✅ Bucket je private (nie public)
- ✅ Prístup len cez presigned URLs
- ✅ API token má minimálne potrebné permissions

### 6.2 CORS Security
- ✅ AllowedOrigins obsahuje len production domény
- ✅ Žiadne wildcard (*) v production
- ✅ MaxAgeSeconds je rozumne nastavený

### 6.3 Monitoring
- Nastavte billing alerts pre R2 usage
- Monitorujte API token usage v Cloudflare dashboard

## 7. Troubleshooting

### 7.1 CORS Errors
```bash
# Skontrolujte CORS policy
# Overte že frontend doména je v AllowedOrigins
# Skontrolujte že používate HTTPS v production
```

### 7.2 Upload Fails
```bash
# Overte API token permissions
# Skontrolujte bucket name v environment variables
# Overte že presigned URL nie je expirovaná
```

### 7.3 Access Denied
```bash
# Skontrolujte R2_ACCOUNT_ID
# Overte API token scope
# Skontrolujte bucket permissions
```

## 8. Monitoring & Analytics

### 8.1 R2 Analytics
- Bandwidth usage
- Request counts
- Storage usage
- Error rates

### 8.2 Alerts Setup
```bash
# Nastavte alerts pre:
- High bandwidth usage
- Error rate spikes  
- Storage quota limits
- API rate limits
```

---

**✅ Po dokončení týchto krokov bude R2 storage plne funkčný pre produkčnú aplikáciu!**
