# 3PLE DIGIT APLIKÁCIA - FUNKCIONALITA A LOGIKA

## 📅 **DÁTUM POSLEDNEJ AKTUALIZÁCIE: 19.9.2025**

---

## 🎯 **ZÁKLADNÉ KONCEPTY**

### **1. NAV (Net Asset Value) - Hodnota firmy**

```
NAV = Aktíva + Banka - Záväzky
```

**Príklad výpočtu:**

- Aktíva: 2,170,004 EUR
- Banka: 41,230 EUR
- Záväzky: 454,487 EUR
- **NAV: 1,756,747 EUR**

### **2. Investor Kapitály**

```
Investor kapitál = DEPOSIT - WITHDRAWAL
```

**Celkový investor kapitál:** 1,756,748 EUR

### **3. Percentuálne podiely investorov**

```
Podiel = (Investor kapitál / Celkový investor kapitál) × 100%
```

---

## ⚠️ **DÔLEŽITÉ: NAV vs INVESTOR KAPITÁLY**

### **SÚ NEZÁVISLÉ!**

- **NAV** = skutočná hodnota firmy (aktíva + banka - záväzky)
- **Investor kapitály** = skutočné vklady investorov (DEPOSIT - WITHDRAWAL)
- **Ak sa zmení NAV, investor kapitály sa NEZMENIA automaticky!**

### **Príklad:**

Ak pribudne 10M EUR do banky:

- **NAV:** 1,756,747 EUR → 11,756,747 EUR (+10M EUR)
- **Investor kapitály:** zostanú rovnaké (1,756,748 EUR)
- **Percentuálne podiely:** zmenia sa (lebo NAV sa zmenil)

---

## 📊 **AKTUÁLNE DÁTA (k 30.6.2025)**

### **Investori a ich kapitály:**

| Meno                | Kapitál (EUR) | Podiel (%) |
| ------------------- | ------------- | ---------- |
| Andrej Pavlík       | 427,944       | 24.36%     |
| Mikail Pirgozi      | 427,944       | 24.36%     |
| Vladimír Dužek      | 126,310       | 7.19%      |
| Marián Cingel       | 145,810       | 8.30%      |
| Richard Zimányi     | 70,270        | 4.00%      |
| Roman Priecel       | 44,094        | 2.51%      |
| Patrik Pavlík       | 86,608        | 4.93%      |
| Kamil Zavodsky      | 108,567       | 6.18%      |
| Steffen Tatge       | 95,391        | 5.43%      |
| Ján Lajda           | 64,473        | 3.67%      |
| Stanislava Záčiková | 57,797        | 3.29%      |
| Matúš Hološ         | 86,783        | 4.94%      |
| Rezervný fond       | 13,176        | 0.75%      |
| Index               | 1,581         | 0.09%      |

**Celkom:** 1,756,748 EUR (100.00%)

### **Aktíva (2,170,004 EUR):**

- Pôžičky: 1,086,704 EUR
- Nehnuteľnosti: 1,083,300 EUR

### **Banka (41,230 EUR):**

- 3ple Digit Bankový účet: 37,000 EUR
- p2 invest bankový účet: 3,600 EUR
- poriaci účet p2: 630 EUR
- 3ple Digit Hotovosť: 0 EUR

### **Záväzky (454,487 EUR):**

- Rôzne pôžičky a splátky

---

## 📸 **SNAPSHOTS - AKO FUNGUJÚ**

### **Čo je snapshot?**

- **Snapshot** = momentálny "snimok" stavu firmy
- **InvestorSnapshot** = momentálny podiel každého investora
- **Pri vytvorení snapshotu** sa investor kapitály "zamrznú" na aktuálnom stave

### **Ako funguje vytvorenie snapshotu?**

1. **Vypočíta sa aktuálny NAV** (Aktíva + Banka - Záväzky)
2. **Vypočítajú sa investor podiely** na základe ich kapitálu
3. **Ak je zadaný performance fee**, rozdelí sa medzi manažérov a investorov
4. **Všetky údaje sa uložia** pre dané obdobie

### **Kedy vytvárať snapshots?**

1. **Keď sa zmení NAV** (nové aktíva, banka, záväzky)
2. **Keď chceš aktualizovať investor podiely** na základe nového NAV
3. **Mesačne/štvrťročne** pre reporting
4. **Na konci roka** pre výpočet ročnej performance fee

### **Ako vytvoriť snapshot?**

1. V aplikácii klikni na "Uložiť snapshot"
2. Vyplň obdobie (YYYY-MM)
3. **VOLITEĽNE:** Zadaj performance fee (%) - ak nie je zadané, nebude sa počítať
4. Klikni "Vytvoriť snapshot"

---

## 💰 **PERFORMANCE FEE - AKO FUNGUJE**

### **Čo je performance fee?**

- **Performance fee** = provízia za výkonnosť portfólia
- **Vypočíta sa len ak je zadané** v snapshot forme
- **Rozdelí sa 50/50** medzi manažérov a investorov

### **Ako sa počíta?**

```
Performance Fee = NAV × Performance Fee Rate (%)
```

### **Príklad:**

- NAV: 1,756,747 EUR
- Performance Fee Rate: 20%
- **Celková provízia:** 1,756,747 × 0.20 = 351,349 EUR
- **Manažeri (Mikail + Andrej):** 175,675 EUR (50%)
- **Investori:** 175,675 EUR (50%)

### **⚠️ DÔLEŽITÉ PRE TEBU:**

**Performance fee sa berie až 31.12 na konci roka!**

- **Nie pri každom snapshot**
- **Len raz ročne** na konci roka
- **Preto treba upraviť systém** - momentálne sa počíta pri každom snapshot

---

## 🔄 **WORKFLOW - AKO PRACOVAŤ S APLIKÁCIOU**

### **1. Pridanie nových aktív:**

- Pridaj aktívum → NAV sa zvýši
- Investor kapitály zostanú rovnaké
- **Ak chceš aktualizovať podiely:** Vytvor snapshot

### **2. Zmena bankových zostatkov:**

- Aktualizuj banku → NAV sa zmení
- Investor kapitály zostanú rovnaké
- **Ak chceš aktualizovať podiely:** Vytvor snapshot

### **3. Nové vklady investorov:**

- Pridaj DEPOSIT → Investor kapitál sa zvýši
- Percentuálne podiely sa prepočítajú automaticky
- NAV zostane rovnaký

### **4. Výbery investorov:**

- Pridaj WITHDRAWAL → Investor kapitál sa zníži
- Percentuálne podiely sa prepočítajú automaticky
- NAV zostane rovnaký

---

## 🛠️ **TECHNICKÉ DETAILY**

### **Databázové tabuľky:**

- `investors` - investori
- `investor_cashflows` - vklady/výbery
- `assets` - aktíva
- `bank_balances` - bankové zostatky
- `liabilities` - záväzky
- `period_snapshots` - snapshots
- `investor_snapshots` - investor podiely v snapshotoch

### **API endpointy:**

- `GET /api/investors` - zoznam investorov s kapitálmi a podielmi
- `GET /api/snapshots/current-nav` - aktuálny NAV
- `POST /api/snapshots` - vytvorenie snapshotu

---

## ❓ **ČASTÉ OTÁZKY**

### **Q: Prečo sa investor kapitály nezmenia automaticky pri zmene NAV?**

A: Pretože sú to dva rôzne koncepty:

- NAV = hodnota firmy
- Investor kapitály = skutočné vklady investorov

### **Q: Ako aktualizovať investor podiely po zmene NAV?**

A: Vytvor snapshot - to "zamrazí" investor kapitály na aktuálnom stave a prepočíta podiely.

### **Q: Kedy vytvárať snapshots?**

A: Keď sa zmení NAV a chceš aktualizovať investor podiely, alebo mesačne pre reporting.

---

## 📝 **POZNÁMKY A ZMENY**

### **19.9.2025:**

- Aktualizované všetky dáta na dátum 30.6.2025
- Implementované zobrazenie percentuálnych podielov investorov
- Opravené prepočítavanie investor kapitálov
- Vymazané testovacie aktívum "Skuška" (10M EUR)

### **POTREBNÉ ÚPRAVY:**

- [ ] **PERFORMANCE FEE:** Upraviť systém, aby sa performance fee počítało len na konci roka (31.12), nie pri každom snapshot
- [ ] **ROČNÝ SNAPSHOT:** Pridať možnosť označiť snapshot ako "ročný" pre výpočet performance fee
- [ ] **MANAŽERSKÁ PROVÍZIA:** Implementovať 50/50 rozdelenie medzi Mikail + Andrej a investori

### **Ďalšie zmeny:**

- [ ] Pridať sem ďalšie zmeny...

---

**Posledná úprava:** 19.9.2025
**Autor:** AI Assistant + Mikail Pirgozi
