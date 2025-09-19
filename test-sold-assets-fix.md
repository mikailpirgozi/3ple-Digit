# Test opravy predaných aktív

## Problém:
Keď sa aktívum predá, jeho hodnota sa stále počítala do celkovej hodnoty aktív, ale malo by sa počítať len do bankových zostatok.

## Implementované opravy:

### 1. ✅ Reports Service (Performance Report)
- **Súbor**: `apps/api/src/modules/reports/service.ts`
- **Oprava**: Filtruje len aktívne aktíva (`asset.status !== 'SOLD'`) pri výpočte `totalAssets`
- **Riadok**: 296-297

### 2. ✅ Assets Service (Calculate New Asset Value)
- **Súbor**: `apps/api/src/modules/assets/service.ts` 
- **Oprava**: Pri SALE udalosti nastaví hodnotu aktíva na 0
- **Riadok**: 614-615
- **Logika**: `case 'SALE': return 0; // Asset sold, no longer has value in portfolio`

### 3. ✅ Snapshots Service (NAV Calculation)
- **Súbor**: `apps/api/src/modules/snapshots/service.ts`
- **Stav**: Už správne implementované - filtruje len aktívne aktíva
- **Riadok**: 42-47

## Testovanie:

### Scenár:
1. Aktívum kúpené za 1000 EUR → celková hodnota aktív +1000 EUR
2. Prehodnotenie na 2000 EUR → celková hodnota aktív = 2000 EUR  
3. **Predaj za 3000 EUR** → celková hodnota aktív = 0 EUR (aktívum už nie je v portfóliu)
4. Bankový zostatok sa zvýši o 3000 EUR (manuálne pridané používateľom)

### Výsledok:
- ✅ Predané aktívum sa už nepočíta do celkovej hodnoty aktív
- ✅ NAV calculation správne filtruje len aktívne aktíva
- ✅ Performance report správne filtruje len aktívne aktíva
- ✅ Hodnota predaného aktíva je nastavená na 0

## API Endpoints na testovanie:
- `GET /api/snapshots/nav` - NAV calculation
- `GET /api/reports/performance` - Performance report  
- `POST /api/assets/:id/mark-sold` - Predaj aktíva

## Servery:
- ✅ API Server: http://localhost:4000/health
- ✅ Web Server: http://localhost:3000
