# 🎨 3ple Digit Design System

Jednotný design systém pre 3ple Digit aplikáciu založený na shadcn/ui komponentoch.

## 📦 Komponenty

### 🎯 Core Components

- **Button** - Tlačidlá s rôznymi variantmi
- **Card** - Karty pre obsah
- **Input** - Vstupné polia
- **Form** - Formuláre s validáciou
- **Select** - Rozbaľovacie menu
- **Table** - Tabuľky dát
- **Dialog** - Modálne okná
- **Sheet** - Bočné panely

### 🎨 Unified Components

#### Icons (`icons.tsx`)

```tsx
import { NavigationIcons, ActionIcons, getFileIcon } from '@/ui/icons';

// Navigation icons
const DashboardIcon = NavigationIcons.dashboard;
const InvestorsIcon = NavigationIcons.investors;

// Action icons
const AddIcon = ActionIcons.add;
const EditIcon = ActionIcons.edit;

// File type icons
const FileIcon = getFileIcon('application/pdf');
```

#### Status (`status.tsx`)

```tsx
import { Status, LoadingState, ErrorState, EmptyState } from '@/ui/status';

// Unified status component
<Status
  type="loading"
  message="Načítavam dáta..."
/>

// Specific status components
<LoadingState message="Načítavam..." />
<ErrorState
  title="Chyba"
  message="Nepodarilo sa načítať dáta"
  onRetry={() => {}}
/>
<EmptyState
  icon={Building2}
  title="Žiadne aktíva"
  description="Začnite pridaním svojho prvého aktíva"
  action={{ label: 'Pridať', onClick: () => {} }}
/>
```

#### Data Display (`data-display.tsx`)

```tsx
import {
  formatCurrency,
  formatDate,
  formatFileSize,
  MetricCard,
  FileTypeBadge,
  AssetTypeBadge,
  StatusBadge,
  TrendIndicator,
  DataTableCell
} from '@/ui/data-display';

// Formatters
const price = formatCurrency(1250000); // "1 250 000 €"
const date = formatDate(new Date()); // "15. 12. 2024, 14:30"
const size = formatFileSize(2048576); // "2.00 MB"

// Display components
<MetricCard
  title="NAV"
  value={formatCurrency(1250000)}
  icon={BarChart3}
  trend={{ value: 5.2, label: "vs. minulý mesiac" }}
/>

<FileTypeBadge mimeType="application/pdf" />
<AssetTypeBadge type="NEHNUTEĽNOSTI" />
<StatusBadge status="active" />
<TrendIndicator value={3.2} label="mesiac" />
<DataTableCell value={250000} type="currency" />
```

#### Layout (`layout.tsx`)

```tsx
import {
  PageHeader,
  SectionHeader,
  ContentCard,
  StatsGrid,
  TwoColumnLayout,
  FeatureGrid
} from '@/ui/layout';

<PageHeader
  title="Prehľad investícií"
  description="Kompletný prehľad vašich aktív"
  actions={<Button>Pridať</Button>}
/>

<StatsGrid>
  <MetricCard title="NAV" value="1.25M €" />
  <MetricCard title="Investori" value="24" />
</StatsGrid>

<TwoColumnLayout
  left={<ContentCard title="Aktíva">...</ContentCard>}
  right={<ContentCard title="Dokumenty">...</ContentCard>}
/>
```

#### Search (`search.tsx`)

```tsx
import { SearchInput, FilterBar, FilterChip } from '@/ui/search';

<SearchInput
  placeholder="Vyhľadať..."
  value={searchValue}
  onChange={setSearchValue}
  onClear={() => setSearchValue('')}
/>

<FilterBar
  searchValue={searchValue}
  onSearchChange={setSearchValue}
  filters={activeFilters}
  onRemoveFilter={removeFilter}
  onClearAll={clearAllFilters}
/>
```

#### Mobile Actions (`mobile-actions.tsx`)

```tsx
import { MobileActions, FloatingActionButton } from '@/ui/mobile-actions';

<MobileActions
  onCreate={() => {}}
  onFilter={() => {}}
  onExport={() => {}}
  onImport={() => {}}
/>

<FloatingActionButton onClick={() => {}} />
```

#### Animations (`animations.tsx`)

```tsx
import { FadeIn, SlideIn, Stagger } from '@/ui/animations';

<FadeIn delay={100}>
  <Card>Content</Card>
</FadeIn>

<SlideIn direction="up" delay={200}>
  <Button>Click me</Button>
</SlideIn>

<Stagger staggerDelay={100}>
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</Stagger>
```

## 🎨 Design Tokens

### Colors

- **Primary**: `hsl(var(--primary))`
- **Secondary**: `hsl(var(--secondary))`
- **Muted**: `hsl(var(--muted))`
- **Accent**: `hsl(var(--accent))`
- **Destructive**: `hsl(var(--destructive))`

### Typography

- **Font Family**: Aeonik
- **Sizes**: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl

### Spacing

- **Grid Gap**: gap-2, gap-4, gap-6, gap-8
- **Padding**: p-2, p-4, p-6, p-8
- **Margin**: m-2, m-4, m-6, m-8

## 📱 Responsive Design

### Breakpoints

- **xs**: 360px
- **sm**: 744px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1440px
- **2xl**: 1728px

### Mobile-First Approach

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{/* Responsive grid */}</div>
```

## 🌙 Dark Mode

Automatická podpora dark/light módu cez CSS custom properties:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

## 🚀 Best Practices

### 1. Konzistentné používanie ikon

```tsx
// ✅ Good
import { NavigationIcons, ActionIcons } from '@/ui/icons';
const Icon = NavigationIcons.dashboard;

// ❌ Bad
const icon = '📊';
```

### 2. Formátovanie dát

```tsx
// ✅ Good
import { formatCurrency, formatDate } from '@/ui/data-display';
const price = formatCurrency(1250000);
const date = formatDate(new Date());

// ❌ Bad
const price = `${amount} €`;
const date = new Date().toLocaleDateString();
```

### 3. Status handling

```tsx
// ✅ Good
import { Status } from '@/ui/status';
<Status type="loading" message="Načítavam..." />

// ❌ Bad
<div className="text-center">Loading...</div>
```

### 4. Layout komponenty

```tsx
// ✅ Good
import { PageHeader, ContentCard, StatsGrid } from '@/ui/layout';
<PageHeader title="Dashboard" actions={<Button>Pridať</Button>} />

// ❌ Bad
<div className="flex justify-between items-center mb-6">
  <h1>Dashboard</h1>
  <Button>Pridať</Button>
</div>
```

## 📚 Príklady

Pozrite si `examples.tsx` pre kompletný príklad použitia všetkých komponentov.

## 🔧 Customization

Všetky komponenty sú plne customizovateľné cez props a className:

```tsx
<MetricCard
  title="Custom Title"
  value="Custom Value"
  className="bg-red-50 border-red-200"
  icon={CustomIcon}
/>
```
