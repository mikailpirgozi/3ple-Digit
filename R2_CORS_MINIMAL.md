# R2 CORS - Minimálna konfigurácia

## Krok 1: Základný CORS policy

Skúste najprv tento minimálny CORS policy:

```json
[
  {
    "AllowedOrigins": [
      "https://3ple-digit-qtqq.vercel.app",
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

## Krok 2: Ak nefunguje, skúste ešte jednoduchší

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"]
  }
]
```

## Krok 3: Postupné pridávanie

Ak funguje `*`, postupne nahraďte:
1. `AllowedOrigins` konkrétnymi doménami
2. Pridajte `MaxAgeSeconds`
3. Pridajte `ExposeHeaders`

## Možné problémy:

1. **JSON syntax** - skontrolujte čiarky a zátvorky
2. **Whitespace** - odstráňte medzery na začiatku/konci
3. **Browser cache** - skúste incognito mode
4. **Propagácia** - počkajte 5-10 minút

## Testovanie:

```bash
# Test CORS preflight
curl -X OPTIONS \
  -H "Origin: https://3ple-digit-qtqq.vercel.app" \
  -H "Access-Control-Request-Method: PUT" \
  "https://YOUR_R2_PRESIGNED_URL"
```
