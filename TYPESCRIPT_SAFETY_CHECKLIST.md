# 🛡️ TypeScript Safety Checklist - 3ple Digit

## ✅ Pre-Development Checklist

Pred vytvorením nového kódu **VŽDY** skontroluj:

### 1. **Prisma Operations**
```typescript
// ❌ NESPRÁVNE - undefined pre nullable fields
data: {
  name: data.name,
  description: data.description, // môže byť undefined!
}

// ✅ SPRÁVNE - použiť toNullable helper
data: {
  name: data.name,
  description: this.toNullable(data.description),
}
```

### 2. **Router Parameters**
```typescript
// ❌ NESPRÁVNE - destructuring môže vrátiť undefined
const { id } = req.params;

// ✅ SPRÁVNE - použiť validateRequiredParam
const id = validateRequiredParam(req.params.id, 'id');
```

### 3. **Unused Parameters**
```typescript
// ❌ NESPRÁVNE - unused parameter warning
router.get('/stats', asyncHandler(async (req, res) => {

// ✅ SPRÁVNE - prefix _ pre unused
router.get('/stats', asyncHandler(async (_req, res) => {
```

### 4. **Array Access**
```typescript
// ❌ NESPRÁVNE - môže byť undefined
const first = array[0];

// ✅ SPRÁVNE - non-null assertion alebo null check
const first = array[0]!; // ak si istý
const first = array.at(0) ?? defaultValue; // bezpečnejšie
```

### 5. **Update Operations**
```typescript
// ❌ NESPRÁVNE - undefined values v update
await prisma.model.update({
  data: { name: data.name, description: data.description }
});

// ✅ SPRÁVNE - filtrovať undefined
const updateData = this.filterUpdateData({
  name: data.name,
  description: data.description !== undefined ? this.toNullable(data.description) : undefined,
});
await prisma.model.update({ data: updateData });
```

## 🔧 Mandatory Helper Functions

Každý nový service **MUSÍ** obsahovať:

```typescript
/**
 * Helper function to convert undefined to null for Prisma compatibility
 */
private toNullable<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

/**
 * Helper function to filter out undefined values from update data
 */
private filterUpdateData<T extends Record<string, any>>(data: T): any {
  const filtered: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      filtered[key] = value;
    }
  }
  return filtered;
}
```

## 🚨 Common Mistakes to Avoid

### 1. **Prisma Schema vs TypeScript Types**
- Prisma `String?` = `string | null` v databáze
- TypeScript `string | undefined` ≠ SQL `NULL`
- **Riešenie:** Vždy konvertuj `undefined` → `null`

### 2. **Express Router Parameters**
- `req.params.id` môže byť `undefined` s `exactOptionalPropertyTypes: true`
- **Riešenie:** Vždy validuj cez `validateRequiredParam`

### 3. **Type Assertions**
- Minimalizuj použitie `as` assertions
- **Riešenie:** Preferuj type guards a null checks

## 📋 Code Review Checklist

Pred commit **VŽDY** skontroluj:

- [ ] Žiadne `undefined` v Prisma operáciách
- [ ] Všetky router parametre validované
- [ ] Unused parametre majú `_` prefix
- [ ] Array access je bezpečný
- [ ] Update operácie filtrujú `undefined`
- [ ] Žiadne `any` typy (okrem helper funkcií)
- [ ] ESLint errors = 0
- [ ] TypeScript errors = 0

## 🛠️ Development Workflow

1. **Skopíruj template** z `/apps/api/src/core/templates/`
2. **Implementuj logiku** podľa patterns
3. **Spusti kontroly:**
   ```bash
   npm run lint
   npx tsc --noEmit
   npm test
   ```
4. **Oprav všetky chyby** pred commit
5. **Commit** len ak sú všetky kontroly ✅

## 🎯 Zero-Error Policy

**Aplikácia MUSÍ mať 0 TypeScript chýb pred produkciou!**

- Build warnings sú OK (Express type inference)
- Runtime errors sú NEDOVOLENÉ
- Linter warnings = fix immediately

---

**Pamätaj:** Lepšie stráviť 5 minút extra na type safety než 5 hodín na debugging! 🚀
