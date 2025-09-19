# Test Asset Event Validation

## Implementované funkcie:

### Backend validácia:
1. ✅ Udalosti nemôžu byť pridané pred dátumom nákupu aktíva
2. ✅ Nové udalosti musia byť po poslednej existujúcej udalosti  
3. ✅ Po predaji aktíva (SALE event) už nie je možné pridávať ďalšie udalosti
4. ✅ Endpoint `/api/assets/:id/events/validation` pre získanie validačných informácií

### Frontend validácia:
1. ✅ AssetEventForm zobrazuje informácie o obmedzeniach
2. ✅ DatePicker je obmedzený na povolené dátumy
3. ✅ AssetEventsModal skrýva tlačidlo "Pridať udalosť" pre predané aktíva
4. ✅ Zobrazenie informácií o poslednej udalosti a minimálnom dátume

## Testovanie:

### Scenár 1: Nové aktívum bez udalostí
- Minimálny dátum = dátum nákupu aktíva (ak existuje)
- Možno pridať udalosť

### Scenár 2: Aktívum s existujúcimi udalosťami  
- Minimálny dátum = deň po poslednej udalosti
- Zobrazenie informácií o poslednej udalosti

### Scenár 3: Predané aktívum
- Tlačidlo "Pridať udalosť" je skryté
- Zobrazenie upozornenia o predanom aktíve

### Scenár 4: Pokus o pridanie udalosti s neplatným dátumom
- Backend vráti chybu s popisom problému
- Frontend zabráni výberu neplatného dátumu
