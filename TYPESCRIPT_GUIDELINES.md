# TypeScript Guidelines - 3ple Digit

## 🎯 Cieľ
Zabránenie TypeScript chýb a udržanie kvality kódu.

## 🚨 Prisma Best Practices

### 1. Nullable Fields
```typescript
// ✅ Správne - použiť null pre nullable Prisma polia
data: {
  phone: this.toNullable(data.phone),
  address: this.toNullable(data.address),
}

// ❌ Nesprávne - undefined spôsobuje chyby
data: {
  phone: data.phone,  // môže byť undefined
}
```

### 2. Update Operations
```typescript
// ✅ Správne - filtrovať undefined hodnoty
const updateData = this.filterUpdateData({
  name: data.name,
  phone: data.phone !== undefined ? this.toNullable(data.phone) : undefined,
});

await prisma.user.update({ where: { id }, data: updateData });
```

## 🛡️ Router Validation

### 1. Parameter Validation
```typescript
// ✅ Správne - vždy validuj params
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    throw errors.badRequest('ID is required');
  }
  
  const result = await service.getById(id);
  res.json(result);
}));
```

### 2. Unused Parameters
```typescript
// ✅ Správne - ak nepotrebuješ parameter, označ ho
router.get('/health', asyncHandler(async (_req, res) => {
  res.json({ status: 'ok' });
}));

// Alebo použiť eslint-disable pre konkrétny prípad
```

## 📋 Development Workflow

### 1. Pred commit
```bash
# Spusti TypeScript check
npm run type-check

# Spusti linter
npm run lint

# Spusti testy
npm run test
```

### 2. CI/CD Pipeline
- TypeScript compilation musí prejsť
- Všetky testy musia prejsť
- Linter nesmie mať errors (warnings OK)

## 🔧 Helper Functions

Každý service by mal dediť od BaseService:

```typescript
export abstract class BaseService {
  protected toNullable<T>(value: T | undefined): T | null {
    return value === undefined ? null : value;
  }

  protected filterUpdateData<T extends Record<string, any>>(data: T): Partial<T> {
    const filtered: Partial<T> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        (filtered as any)[key] = value;
      }
    }
    return filtered;
  }
}
```

## 🚫 Čo sa má vyhnúť

1. **Nikdy nepoužívať `any`** - radšej `unknown` + type guards
2. **Nepreskakovať validáciu** router parametrov
3. **Nepoužívať `undefined`** pre Prisma nullable polia
4. **Neignorovať TypeScript errors** - vždy ich oprav

## ✅ Kontrolný zoznam pre nové features

- [ ] Router parametre sú validované
- [ ] Prisma operácie používajú správne typy
- [ ] Žiadne TypeScript errors
- [ ] Testy prechádzajú
- [ ] Linter je čistý
