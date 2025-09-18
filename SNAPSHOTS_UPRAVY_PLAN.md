# SNAPSHOTS ÚPRAVY - PLÁN IMPLEMENTÁCIE

## 📅 **DÁTUM:** 19.9.2025

---

## 🎯 **POŽIADAVKY**

### **1. Dva typy snapshots:**

- **MESAČNÝ SNAPSHOT:** Bez performance fee (ako teraz)
- **ROČNÝ SNAPSHOT:** S performance fee na konci roka (31.12)

### **2. Performance fee logika:**

- **Výpočet:** Z celkového čistého zisku za celý rok (1.1 - 31.12)
- **Rozdelenie:** 15% Mikail Pirgozi + 15% Andrej Pavlík = 30% celkovo (fixné)
- **Voliteľnosť:** Percento ALEBO fixná suma v EUR
- **Čas:** Len v decembri na konci roka (31.12)

### **3. Ročný sumár:**

- Kompletný prehľad za celý rok
- Porovnanie s predchádzajúcim rokom
- Celkový zisk a performance fee

---

## 🔧 **TECHNICKÉ ÚPRAVY**

### **1. Databázové zmeny:**

```sql
-- Pridať do period_snapshots tabuľky
ALTER TABLE period_snapshots ADD COLUMN snapshot_type VARCHAR(20) DEFAULT 'monthly';
ALTER TABLE period_snapshots ADD COLUMN is_annual BOOLEAN DEFAULT FALSE;
ALTER TABLE period_snapshots ADD COLUMN annual_summary JSONB;

-- Možné hodnoty pre snapshot_type:
-- 'monthly' - mesačný snapshot (bez fee)
-- 'annual' - ročný snapshot (s fee)
```

### **2. Backend úpravy:**

#### **A) Schema úpravy:**

```typescript
// apps/api/src/modules/snapshots/schema.ts
export const createSnapshotSchema = z.object({
  date: z.coerce.date(),
  snapshotType: z.enum(['monthly', 'annual']).default('monthly'),
  // Pre ročné snapshots - buď percento alebo fixná suma
  performanceFeeRate: z.number().min(0).max(100).optional(),
  performanceFeeAmount: z.number().min(0).optional(),
  // Ročný sumár
  annualSummary: z
    .object({
      year: z.number(),
      totalProfit: z.number(),
      previousYearNav: z.number(),
      performanceFeeAmount: z.number(),
      mikailFee: z.number(),
      andrejFee: z.number(),
    })
    .optional(),
});
```

#### **B) Service úpravy:**

```typescript
// apps/api/src/modules/snapshots/service.ts
async createSnapshot(data: CreateSnapshotRequest, userId?: string) {
  // 1. Vypočítať aktuálny NAV
  // 2. Ak je annual snapshot:
  //    - Vypočítať celkový zisk za rok
  //    - Vypočítať performance fee
  //    - Rozdeliť 15% + 15% manažerom
  // 3. Vytvoriť snapshot s príslušným typom
}
```

#### **C) Performance fee výpočet:**

```typescript
private calculateAnnualPerformanceFee(
  currentNav: number,
  previousYearNav: number,
  feeRate?: number,
  feeAmount?: number
): {
  totalProfit: number;
  performanceFee: number;
  mikailFee: number;
  andrejFee: number;
} {
  const totalProfit = currentNav - previousYearNav;

  // Buď percento alebo fixná suma
  let performanceFee: number;
  if (feeAmount) {
    performanceFee = feeAmount; // Fixná suma
  } else if (feeRate) {
    performanceFee = totalProfit * (feeRate / 100); // Percento
  } else {
    performanceFee = 0;
  }

  // Vždy 50/50 medzi manažérmi
  const mikailFee = performanceFee * 0.5; // 50%
  const andrejFee = performanceFee * 0.5; // 50%

  return {
    totalProfit,
    performanceFee,
    mikailFee,
    andrejFee,
  };
}
```

### **3. Frontend úpravy:**

#### **A) SnapshotForm úpravy:**

```typescript
// apps/web/src/features/snapshots/ui/SnapshotForm.tsx
const snapshotFormSchema = z.object({
  period: z.string().min(1, 'Obdobie je povinné'),
  snapshotType: z.enum(['monthly', 'annual']).default('monthly'),
  performanceFeeRate: z.number().min(0).max(100).optional(),
  performanceFeeAmount: z.number().min(0).optional(), // Fixná suma v EUR
});

// Pridať radio button pre výber typu:
// ○ Mesačný snapshot (bez fee)
// ● Ročný snapshot (s fee)
```

#### **B) UI vylepšenia:**

- **Radio button** pre výber typu snapshot
- **Podmienené polia** pre performance fee (len pri ročnom)
- **Možnosť zadať** percento alebo fixnú sumu
- **Preview** výpočtu pred vytvorením

### **4. API endpointy:**

```typescript
// Nové endpointy
GET /api/snapshots/annual-summary/:year
POST /api/snapshots/annual (pre ročné snapshots)
GET /api/snapshots/types (monthly/annual)
```

---

## 📊 **WORKFLOW**

### **Mesačný snapshot:**

1. Užívateľ klikne "Vytvoriť snapshot"
2. Vybere "Mesačný snapshot"
3. Vyplní obdobie (YYYY-MM)
4. **Nevyplní performance fee**
5. Klikne "Vytvoriť snapshot"
6. Systém vytvorí snapshot bez fee

### **Ročný snapshot:**

1. Užívateľ klikne "Vytvoriť snapshot"
2. Vybere "Ročný snapshot"
3. Vyplní obdobie (YYYY-MM) - musí byť december (2025-12)
4. **Vyplní performance fee** (percento ALEBO fixná suma)
5. Klikne "Vytvoriť snapshot"
6. Systém:
   - Vypočíta celkový zisk za rok (1.1 - 31.12)
   - Vypočíta performance fee (percento z zisku ALEBO fixná suma)
   - Rozdelí 50/50 medzi Mikail + Andrej
   - Vytvorí snapshot s fee a ročným sumárom

---

## 🎨 **UI/UX VYLEPŠENIA**

### **SnapshotForm:**

```
┌─────────────────────────────────────┐
│ Vytvoriť nový snapshot              │
├─────────────────────────────────────┤
│ Typ snapshots:                      │
│ ○ Mesačný snapshot (bez fee)        │
│ ● Ročný snapshot (s fee)            │
│                                     │
│ Obdobie: [2025-12    ] 📅           │
│                                     │
│ Performance Fee:                    │
│ ○ Percento: [30] %                  │
│ ○ Fixná suma: [50000] EUR           │
│                                     │
│ Preview:                            │
│ Celkový zisk: 150,000 EUR           │
│ Performance fee: 45,000 EUR         │
│ Mikail: 22,500 EUR (15%)            │
│ Andrej: 22,500 EUR (15%)            │
│                                     │
│ [Zrušiť] [Vytvoriť snapshot]        │
└─────────────────────────────────────┘
```

### **SnapshotsList:**

```
┌─────────────────────────────────────┐
│ Snapshots                           │
├─────────────────────────────────────┤
│ 2025-12 📊 Ročný   NAV: 1,756,747  │
│           Fee: 30% (45,000 EUR)     │
├─────────────────────────────────────┤
│ 2025-11 📈 Mesačný NAV: 1,756,747  │
├─────────────────────────────────────┤
│ 2025-10 📈 Mesačný NAV: 1,756,747  │
└─────────────────────────────────────┘
```

---

## ✅ **IMPLEMENTAČNÝ PLÁN**

### **Fáza 1: Databázové zmeny**

- [ ] Pridať stĺpce do `period_snapshots`
- [ ] Vytvoriť migráciu
- [ ] Aktualizovať Prisma schema

### **Fáza 2: Backend úpravy**

- [ ] Aktualizovať schema validáciu
- [ ] Upraviť `createSnapshot` metódu
- [ ] Implementovať performance fee výpočet
- [ ] Pridať nové API endpointy

### **Fáza 3: Frontend úpravy**

- [ ] Upraviť `SnapshotForm` komponent
- [ ] Pridať radio button pre typ
- [ ] Implementovať podmienené polia
- [ ] Pridať preview výpočtu

### **Fáza 4: UI vylepšenia**

- [ ] Aktualizovať `SnapshotsList`
- [ ] Pridať ikony pre typy
- [ ] Vylepšiť zobrazenie fee informácií
- [ ] Pridať ročný sumár

### **Fáza 5: Audit trail a úpravy**

- [ ] Implementovať možnosť úpravy existujúcich snapshots
- [ ] Pridať audit trail pre všetky zmeny
- [ ] Logovanie zmien s timestampom a používateľom
- [ ] UI pre zobrazenie histórie zmien

### **Fáza 6: Testovanie**

- [ ] Unit testy pre performance fee
- [ ] Integration testy pre snapshots
- [ ] E2E testy pre UI
- [ ] Testovanie s reálnymi dátami

---

## ✅ **OTÁZKY VYRIEŠENÉ**

1. **Performance fee:** ✅ Percento ALEBO fixná suma (voliteľné)
2. **Ročný snapshot:** ✅ Len v decembri na konci roka (31.12)
3. **Manažeri:** ✅ Vždy Mikail + Andrej 50/50 (fixné)
4. **Zisk:** ✅ Od začiatku roka (1.1 do 31.12)
5. **UI:** ✅ Možnosť upraviť existujúce snapshots + audit trail zmien

---

## 📝 **POZNÁMKY**

- Performance fee sa počíta len pri ročných snapshots
- Mesačné snapshots fungujú ako teraz (bez fee)
- Ročné snapshots sa vytvárajú na konci roka (31.12)
- Fee sa rozdelí 15% + 15% medzi manažérov
- Možnosť zadať percento alebo fixnú sumu

---

**Posledná úprava:** 19.9.2025
**Autor:** AI Assistant + Mikail Pirgozi
