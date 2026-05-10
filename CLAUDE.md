# MetalFlow — Design System & Coding Rules

## Stack

- **Framework**: React 18 (JSX, no TypeScript)
- **Styling**: Tailwind CSS + custom utility classes in `src/index.css`
- **Bundler**: Vite
- **Deploy**: Cloudflare Pages + Pages Functions (D1 SQLite)
- **Fonts**: Plus Jakarta Sans (UI) + JetBrains Mono (data/numbers)

---

## Design Tokens

All tokens are CSS variables defined in `src/index.css` (`:root`). **Never hardcode hex values** — always use tokens or Tailwind classes that map to them.

### Colors

```css
--color-primary: #0052CC          /* Azul principal */
--color-primary-dark: #003D99
--color-primary-navy: #091E42     /* Azul escuro / texto */
--color-accent-teal: #00B8A9
--color-accent-gold: #FF8B00
--color-success: #00875A
--color-error: #DE350B
--color-bg-secondary: #F4F5F7
--color-text-secondary: #42526E
--color-text-muted: #7A869A
--color-border-light: #DFE1E6
```

In components, also use `ASTON_BRAND = '#0052CC'` from `src/services/themeService.js` for programmatic color usage.

### Typography

- Body: `Plus Jakarta Sans` via `font-family` global default
- Data/numbers: `JetBrains Mono` — use class `font-data` or `data-value`
- Scale: `--font-xs` (12px) through `--font-6xl` (40px)

### Spacing

Tailwind extended scale (4px base): `space-1`=4px, `space-2`=8px, `space-3`=12px, `space-4`=16px, `space-6`=24px, `space-8`=32px

### Shadows

```css
--shadow-card
--shadow-card-hover
--shadow-overlay
--shadow-modal
```

---

## Utility Classes (defined in `src/index.css`)

Always prefer these over raw Tailwind when they exist:

| Class | Usage |
|-------|-------|
| `card-premium` | Standard white card with subtle border + shadow |
| `card-glass` | Glassmorphism card (white/translucent) |
| `btn-premium` | Primary CTA button (blue, rounded, shadow) |
| `input-premium` | Standard form input |
| `title-prominent` | H2-level section title |
| `subtitle-prominent` | H3-level subtitle |
| `label-prominent` | Form label |
| `font-data` / `data-value` | Monospace for numbers/prices |

---

## Component Organization

```
src/
  components/        # All React components (JSX)
  services/          # Data + business logic (plain JS)
  utils/             # Helpers (performanceMonitor, errorMapper)
  index.css          # Global styles + tokens + utility classes
  main.jsx           # Entry point (ErrorBoundary + ReactDOM)
  App.jsx            # Root state + data loading
```

### Key Components

- `AppleStyleDashboard.jsx` — main shell with page routing (state: `currentPage`)
- `AppleHeader.jsx` — fixed top nav
- `LoginPage.jsx` — standalone auth (no service deps, direct `fetch()`)
- `QuotationBuilder.jsx` — quotation form with line items + services
- `ClientsPage.jsx` — client list + ClientDetailModal for history
- `DashboardPage.jsx` — KPIs + charts (recharts)
- `AdminPage.jsx` — lazy-loaded admin panel

### Data Services

All data goes through **`src/services/d1Service.js`** — REST calls to `/api/*` (Cloudflare D1):

```js
getClients(), addClient(c), updateClient(c)
getQuotations(), addQuotation(q), updateQuotation(q)
getMaterials(), addMaterial(m)
```

Never use `storageService.js`, `databasePool.js`, or IndexedDB for main data flows.

---

## Figma MCP Integration Rules

When implementing Figma designs:

1. Run `get_design_context` for the target node first
2. Run `get_screenshot` for visual reference
3. Translate output to JSX using project conventions below
4. Validate against screenshot before marking complete

### Translation Rules

- Use **Tailwind utility classes** for layout/spacing
- Use **CSS custom properties** (`var(--color-*)`) for colors in `style={}` props
- Use **utility classes** (`card-premium`, `btn-premium`, etc.) instead of raw Tailwind when they fit
- If Figma uses `ASTON_BRAND` / `#0052CC` — import from `themeService.js`:
  ```js
  import { ASTON_BRAND, hexToRgba } from '../services/themeService';
  ```
- Numbers and prices → add `font-data` or `data-value` class
- **NEVER hardcode hex colors** in JSX — map to tokens or themeService constants

### Asset Rules

- IMPORTANT: Use localhost sources from Figma MCP directly
- Icons are inline SVGs in the component file — **do NOT install icon libraries**
- IMPORTANT: Define SVG icon `const` components **before** any array/object that uses them (TDZ rule)
- Static assets go in `public/`

---

## Critical Rules

- **IMPORTANT**: All `const` components/icons used in module-level arrays must be declared BEFORE those arrays (prevents TDZ ReferenceError → blank white page)
- **IMPORTANT**: Never import `databasePool.js`, `syncService.js`, `multiUserService.js` in components or `LoginPage.jsx`
- **IMPORTANT**: API routes use `functions/api/[[path]].js` — always include `operator_id` when inserting quotations
- **IMPORTANT**: Deploy uses `npx wrangler@3.78.0` (Node v24 workaround)
- **IMPORTANT**: Do NOT use `process.exit(1)` in build scripts — use `process.exit(0)`

---

## Multi-User / Auth

- Session stored in `localStorage` key `metalflow_user` (JSON: `{ id, login, name, role, tenantId }`)
- Roles: `admin` (sees all data) / `operator` (sees own quotations only)
- Data filtering via `DataAccessService.filterQuotations(quotations, currentUser)` and `filterClients`
- Auth API: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`
- Default credentials: `admin` / `123456`
