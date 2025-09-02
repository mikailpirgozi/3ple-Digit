# 🚀 Deployment Guide - 3ple Digit

Kompletný návod na nasadenie aplikácie do produkcie.

## 📋 Predpoklady

- [Railway](https://railway.app) účet
- [Vercel](https://vercel.com) účet  
- [Cloudflare](https://cloudflare.com) účet s R2 storage
- [GitHub](https://github.com) repository

---

## 🗄️ 1. PostgreSQL Database (Railway)

### 1.1 Vytvorenie PostgreSQL služby

```bash
# Prihláste sa do Railway
railway login

# Vytvorte nový projekt
railway init

# Pridajte PostgreSQL službu
railway add postgresql
```

### 1.2 Získanie DATABASE_URL

```bash
# Zobrazte environment variables
railway variables

# Skopírujte DATABASE_URL hodnotu
# Formát: postgresql://username:password@host:port/database
```

---

## 🖥️ 2. Backend Deployment (Railway)

### 2.1 Konfigurácia Railway

1. **Pripojte GitHub repository**
   - Choďte do Railway dashboard
   - Kliknite "Deploy from GitHub repo"
   - Vyberte váš 3ple-digit repository

2. **Nastavte build settings**
   - Root Directory: `/`
   - Build Command: `cd apps/api && pnpm install && pnpm build`
   - Start Command: `cd apps/api && pnpm db:deploy && pnpm start`

### 2.2 Environment Variables

Nastavte tieto premenné v Railway dashboard:

```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=<your-postgresql-url-from-step-1>
JWT_SECRET=<generate-32-char-secret>
CORS_ORIGINS=https://your-app.vercel.app
R2_ACCOUNT_ID=<from-cloudflare>
R2_ACCESS_KEY_ID=<from-cloudflare>
R2_SECRET_ACCESS_KEY=<from-cloudflare>
R2_BUCKET_NAME=3ple-digit-documents-prod
R2_PUBLIC_URL=https://your-bucket.r2.dev
LOG_LEVEL=info
```

### 2.3 Generovanie JWT Secret

```bash
# Vygenerujte bezpečný JWT secret
openssl rand -base64 32
```

### 2.4 Deploy

```bash
# Push do main branch spustí automatický deploy
git push origin main
```

---

## ☁️ 3. Cloudflare R2 Storage

### 3.1 Vytvorenie R2 Bucket

1. **Prihláste sa do Cloudflare dashboard**
2. **Choďte do R2 Object Storage**
3. **Vytvorte nový bucket**
   - Name: `3ple-digit-documents-prod`
   - Location: Auto (Cloudflare optimized)

### 3.2 API Tokens

1. **Choďte do "Manage R2 API tokens"**
2. **Vytvorte nový token**
   - Permissions: Object Read & Write
   - Bucket: `3ple-digit-documents-prod`
3. **Skopírujte credentials:**
   - Account ID
   - Access Key ID  
   - Secret Access Key

### 3.3 CORS Policy

Nastavte CORS policy pre bucket:

```json
[
  {
    "AllowedOrigins": [
      "https://your-app.vercel.app",
      "https://3ple-digit.vercel.app"
    ],
    "AllowedMethods": [
      "GET",
      "PUT", 
      "POST",
      "DELETE"
    ],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### 3.4 Custom Domain (voliteľné)

1. **Pripojte custom domain**
2. **Aktualizujte R2_PUBLIC_URL**

---

## 🌐 4. Frontend Deployment (Vercel)

### 4.1 Pripojenie Repository

1. **Prihláste sa do Vercel dashboard**
2. **Kliknite "New Project"**
3. **Import z GitHub**
4. **Vyberte 3ple-digit repository**

### 4.2 Build Settings

```bash
Framework Preset: Vite
Build Command: cd apps/web && pnpm build
Output Directory: apps/web/dist
Install Command: pnpm install
Node.js Version: 18.x
```

### 4.3 Environment Variables

```bash
VITE_API_URL=https://your-railway-app.railway.app
VITE_APP_NAME=3ple Digit
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_DEBUG=false
```

### 4.4 Deploy

```bash
# Vercel automaticky deployuje pri push do main
git push origin main
```

---

## 🔧 5. Post-Deployment Setup

### 5.1 Database Migration

```bash
# Spustite migrácie (automaticky pri Railway deploy)
railway run pnpm db:deploy

# Seed production data (voliteľné)
railway run pnpm db:seed
```

### 5.2 Health Checks

Overte že všetko funguje:

```bash
# Backend health check
curl https://your-railway-app.railway.app/health

# Frontend
curl https://your-app.vercel.app
```

### 5.3 Admin Account

Vytvorte admin účet cez API alebo seed script:

```bash
# Cez Railway CLI
railway run pnpm db:seed
```

Default admin:
- Email: `admin@3pledigit.com`
- Password: `password123` (zmeňte!)

---

## 🔒 6. Security Checklist

### 6.1 Environment Variables

- ✅ JWT_SECRET je 32+ znakov
- ✅ DATABASE_URL obsahuje silné heslo
- ✅ R2 credentials sú bezpečne uložené
- ✅ CORS_ORIGINS obsahuje len production domény

### 6.2 Database Security

- ✅ PostgreSQL má SSL enabled
- ✅ Database user má minimálne potrebné permissions
- ✅ Backup stratégia je nastavená

### 6.3 Application Security

- ✅ Rate limiting je aktívny
- ✅ Helmet middleware je nakonfigurovaný
- ✅ HTTPS je vynútené
- ✅ Error messages neodhaľujú citlivé informácie

---

## 📊 7. Monitoring & Maintenance

### 7.1 Logging

```bash
# Railway logs
railway logs

# Vercel logs
vercel logs
```

### 7.2 Performance Monitoring

- Railway dashboard - CPU, Memory, Response times
- Vercel Analytics - Page loads, Core Web Vitals
- Cloudflare Analytics - R2 usage, bandwidth

### 7.3 Backups

```bash
# PostgreSQL backup (Railway)
railway pg:dump > backup.sql

# Restore
railway pg:restore backup.sql
```

---

## 🚨 8. Troubleshooting

### 8.1 Časté problémy

**Backend neštartuje:**
```bash
# Skontrolujte logs
railway logs

# Overte environment variables
railway variables
```

**Database connection error:**
```bash
# Overte DATABASE_URL
railway variables | grep DATABASE_URL

# Test connection
railway run pnpm db:generate
```

**CORS errors:**
```bash
# Overte CORS_ORIGINS
# Musí obsahovať presné Vercel URL
```

**R2 upload fails:**
```bash
# Overte R2 credentials
# Skontrolujte CORS policy
# Overte bucket permissions
```

### 8.2 Rollback

```bash
# Railway rollback
railway rollback <deployment-id>

# Vercel rollback
vercel rollback <deployment-url>
```

---

## 📈 9. Scaling & Optimization

### 9.1 Railway Scaling

- Upgrade na Pro plan pre viac resources
- Horizontal scaling pre high traffic
- Database connection pooling

### 9.2 Vercel Optimization

- Edge Functions pre API calls
- Image optimization
- Static asset caching

### 9.3 R2 Optimization

- CDN pre faster downloads
- Lifecycle policies pre storage costs
- Compression pre large files

---

## ✅ 10. Deployment Checklist

### Pre-deployment:
- [ ] Všetky testy prechádzajú
- [ ] Environment variables sú nastavené
- [ ] Database migrácie sú pripravené
- [ ] R2 bucket je nakonfigurovaný
- [ ] CORS policies sú správne

### Post-deployment:
- [ ] Health checks prechádzajú
- [ ] Admin účet funguje
- [ ] File uploads fungujú
- [ ] API endpoints odpovedajú
- [ ] Frontend sa načítava správne
- [ ] Monitoring je aktívne

---

**🎉 Gratulujeme! Vaša 3ple Digit aplikácia je nasadená v produkcii!**

Pre podporu: support@3pledigit.com
