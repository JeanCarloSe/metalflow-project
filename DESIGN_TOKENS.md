# 🎨 Design Tokens - MetalFlow UI/UX Minimalista

## Overview
Sistema de design minimalista com Apple styles, implementado com Tailwind CSS e design tokens responsivos.

---

## 📐 Padrões Responsivos (Mobile-First)

### Padding Responsivo

#### Seções (py - padding vertical de seções)
```jsx
// ❌ Errado (não responsivo)
py-24
py-16
py-8

// ✅ Correto (mobile-first)
py-6 sm:py-8 md:py-12 lg:py-16     // Seções grandes
py-4 sm:py-6 md:py-8                // Seções médias
py-2 sm:py-3 md:py-4                // Seções pequenas
```

#### Padding Horizontal (px)
```jsx
// ❌ Errado
px-4

// ✅ Correto
px-3 sm:px-4    // Container principal
px-2 sm:px-3    // Card/elemento compacto
```

#### Padding Interno (p - padding uniforme)
```jsx
// Cards e boxes
p-4 sm:p-6 md:p-8      // Card grande
p-3 sm:p-4             // Card médio
p-2 sm:p-3             // Card pequeno
```

---

### Gaps Responsivos

```jsx
// Pequeno espaço entre items
gap-2 sm:gap-3           // Items em linha (botões, badges)

// Médio espaço
gap-3 sm:gap-4 md:gap-6  // Cards em grid

// Grande espaço
gap-4 sm:gap-6 md:gap-8  // Seções com cards grandes

// Espaçamento vertical (space-y)
space-y-2 sm:space-y-3         // Items compactos (links, labels)
space-y-3 sm:space-y-4 md:space-y-6  // Conteúdo normal
space-y-4 sm:space-y-6 md:space-y-8  // Seções grandes
```

---

### Tipografia Responsiva

#### Títulos de Página (H1)
```jsx
text-4xl sm:text-5xl md:text-6xl lg:text-7xl
```

#### Títulos de Seção (H2)
```jsx
text-3xl sm:text-4xl md:text-5xl
```

#### Títulos de Card (H3)
```jsx
text-2xl sm:text-3xl md:text-4xl
```

#### Subtítulos (H4)
```jsx
text-xl sm:text-2xl
```

#### Texto Corpo
```jsx
text-sm sm:text-base md:text-lg
```

#### Texto Pequeno
```jsx
text-xs sm:text-sm
```

---

### Componentes (Botões, Inputs, Badges)

#### Botões
```jsx
// Padding responsivo
px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4

// Texto responsivo
text-xs sm:text-sm md:text-base

// Border radius minimalista
rounded-lg              // Botões e inputs
rounded-full            // EVITAR (use rounded-lg)
rounded-2xl             // Cards grandes
```

#### Inputs
```jsx
px-3 sm:px-4 py-2 sm:py-3
text-sm sm:text-base
rounded-lg
```

#### Badges/Pills
```jsx
px-2 sm:px-3 py-1 rounded-full
text-xs sm:text-sm
```

---

### Margin-Bottom (para espaçamento vertical)

```jsx
// Substitua espaçamento fixo por responsivo
❌ mb-8      → ✅ mb-4 sm:mb-6 md:mb-8
❌ mb-12     → ✅ mb-6 sm:mb-8 md:mb-12
❌ mb-16     → ✅ mb-8 sm:mb-12 md:mb-16
```

---

### Grids Responsivos

```jsx
// Padrão desktop: 1 col mobile, 2 cols tablet, 3-4 cols desktop
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6

// Variação: 1 col mobile, 2 cols desktop
grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8

// Variação: 2 cols sempre
grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6
```

---

## 🎯 Checklist de Refatoração

Para cada componente, aplique:

### Seção Principal
- [ ] `max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12`

### Cards/Boxes
- [ ] `p-4 sm:p-6 md:p-8 rounded-2xl`
- [ ] `gap-3 sm:gap-4 md:gap-6` (para grids dentro)

### Títulos
- [ ] H1: `text-4xl sm:text-5xl md:text-6xl lg:text-7xl`
- [ ] H2: `text-3xl sm:text-4xl md:text-5xl`
- [ ] H3: `text-2xl sm:text-3xl`

### Botões
- [ ] `px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4`
- [ ] `text-xs sm:text-sm md:text-base`
- [ ] `rounded-lg` (não rounded-full)

### Inputs
- [ ] `px-3 sm:px-4 py-2 sm:py-3`
- [ ] `text-sm sm:text-base`
- [ ] `rounded-lg`

### Spacing Vertical
- [ ] Seções: `space-y-4 sm:space-y-6 md:space-y-8`
- [ ] Items: `space-y-2 sm:space-y-3`

---

## 🎨 Apple Styles Mantidos

✅ **Glassmorphism**: `glass-light`, `glass-medium`, `glass-dark`
✅ **Gradients**: Botões com `from-blue-500 to-blue-600`
✅ **Borders Minimalistas**: `border border-gray-100` (não shadows pesadas)
✅ **Rounded Corners**: `rounded-2xl`, `rounded-3xl`
✅ **Animações Suaves**: `transition-all duration-300`
✅ **Hover Effects Subtis**: `scale-105` (não 120)

---

## 📋 Componentes Refatorados

✅ tailwind.config.js - Design tokens adicionados
✅ src/index.css - Classes consolidadas e minimalistas
✅ AppleHeader.jsx
✅ AppleHero.jsx
✅ AppleFeatures.jsx
✅ AppleFooter.jsx
✅ LoginPage.jsx

---

## 🔄 Componentes Pendentes

Aplicar padrões em:
- DashboardPage.jsx
- QuotationBuilder.jsx
- AdminPage.jsx
- ClientsPage.jsx
- ReportPage.jsx
- AnalyticsReport.jsx
- AdminClientManager.jsx
- AdminMaterialManager.jsx
- 30+ componentes secundários

---

## 📐 Exemplo Prático de Refatoração

### ANTES (não responsivo)
```jsx
<div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
  <h2 className="text-4xl font-bold mb-6">Título</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    <div className="card-premium p-8">
      <h3 className="text-2xl mb-4">Card</h3>
      <button className="px-6 py-3 rounded-full btn-premium">Clique</button>
    </div>
  </div>
</div>
```

### DEPOIS (mobile-first responsivo)
```jsx
<div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 md:mb-6">Título</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-12">
    <div className="card-premium p-4 sm:p-6 md:p-8">
      <h3 className="text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3 md:mb-4">Card</h3>
      <button className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base rounded-lg btn-premium">Clique</button>
    </div>
  </div>
</div>
```

---

## 🎯 Resultado Final

- ✅ UI minimalista com distribuição equilibrada
- ✅ Responsividade perfeita: 320px → 1920px
- ✅ Apple styles mantidos (glassmorphism, gradients, animations)
- ✅ Design tokens padronizados
- ✅ Escalável e fácil de manter

