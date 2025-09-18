# ✅ 3PLE DIGIT - Deployment Checklist

## Railway Backend

- [ ] **DATABASE_URL** - skopírované z Postgres service
- [ ] **JWT_SECRET** - `321e7020952c02839c7803d9441393f8e20d81d9882c3cb5533bf6b9109903e4f455a43481c2c05fc04f098612095dc5e13daf0b079c1613eab85a98fb60e693`
- [ ] **CORS_ORIGINS** - `http://localhost:3000,https://3ple-digit-qtqq.vercel.app,https://3ple-digit-qtqq-blackrents-projects.vercel.app`
- [ ] **NODE_ENV** - `production`
- [ ] **PORT** - `4000`
- [ ] **JWT_EXPIRES_IN** - `7d`
- [ ] **LOG_LEVEL** - `info`

## Vercel Frontend

- [ ] **VITE_API_URL** - `https://[railway-backend-url].up.railway.app`

## Database Setup (z lokálneho počítača)

```bash
# 1. Aktualizuj .env s novým DATABASE_URL
./UPDATE_DATABASE.sh

# 2. Alebo manuálne:
cd apps/api
npx prisma db push
npm run seed  # vytvorí admin účet
```

## Test

1. Backend health check: `https://[backend-url]/api/health`
2. Frontend: `https://3ple-digit-qtqq.vercel.app`
3. Login:
   - Email: `admin@3pledigit.sk`
   - Heslo: `Admin123!@#`

## Troubleshooting

### Backend nefunguje:

- Skontroluj Railway logs
- Overí DATABASE_URL
- Overí JWT_SECRET

### Nemôžem sa prihlásiť:

- Skontroluj CORS_ORIGINS
- Overí VITE_API_URL na Vercel
- Spusti `npm run seed` pre vytvorenie admin účtu

### Database connection failed:

- Získaj nový DATABASE_URL z Railway Postgres
- Aktualizuj všade (Railway Backend + lokálny .env)
