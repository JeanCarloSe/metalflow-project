# 🎬 Page Transitions & Effects - MetalFlow

## ✨ Efeitos Implementados

Implementação de efeitos de transição premium baseados em best practices de sites modernos como Apple, Figma e Webflow.

---

## 🎯 Efeitos de Transição de Página

### 1. **Slide Up** (Padrão)
```jsx
// Entrada suave de baixo para cima com fade
hidden: { opacity: 0, y: 40 }
visible: { opacity: 1, y: 0 }
duration: 0.5s
easing: cubic-bezier(0.23, 1, 0.320, 1)
```
- ✅ Natural e fluido
- ✅ Sugestiona movimento de conteúdo
- ✅ Usado em Apple.com, Figma.com

### 2. **Fade In**
```jsx
hidden: { opacity: 0 }
visible: { opacity: 1 }
duration: 0.6s
```
- ✅ Suave e elegante
- ✅ Sem movimento distrator
- ✅ Bom para páginas com muito texto

### 3. **Scale In**
```jsx
hidden: { opacity: 0, scale: 0.95 }
visible: { opacity: 1, scale: 1 }
duration: 0.5s
```
- ✅ Sensação de zoom
- ✅ Profundidade visual
- ✅ Bom para cards e modais

### 4. **Blur Fade** (Premium)
```jsx
hidden: { opacity: 0, filter: 'blur(10px)' }
visible: { opacity: 1, filter: 'blur(0px)' }
duration: 0.6s
```
- ✅ Efeito premium e sofisticado
- ✅ Usado em Webflow.com
- ✅ Cria sensação de "focus in"

---

## 🎨 Logo Profissional - MetalFlowLogo

Nova logo moderna e animada com:

### Design
- ✅ Ícone SVG metalizado (gradiente azul)
- ✅ Linhas fluindo para representar movimento
- ✅ Tipografia gradient + subtítulo
- ✅ Animação de pulse sutilmente

### Tamanhos
- `sm`: 8x8 (small header)
- `md`: 10x10 (navbar padrão)
- `lg`: 12x12 (hero/landing)
- `xl`: 16x16 (modal/banner)

### Uso
```jsx
import { MetalFlowLogoWithText } from './MetalFlowLogo';

<MetalFlowLogoWithText size="md" onNavigate={handleNavigate} />
```

---

## 🎬 Usando AnimatedCard para Elementos

Para adicionar efeitos em cards e seções:

```jsx
import AnimatedCard from './AnimatedCard';

{/* Slide up com delay */}
<AnimatedCard delay={0.1} variant="slide-up">
  <div className="card-glass">Conteúdo</div>
</AnimatedCard>

{/* Fade in simples */}
<AnimatedCard variant="fade-in">
  <div className="card-glass">Conteúdo</div>
</AnimatedCard>

{/* Scale in para cards */}
<AnimatedCard variant="scale-in" delay={0.2}>
  <div className="card-glass">Conteúdo</div>
</AnimatedCard>

{/* Blur fade premium */}
<AnimatedCard variant="blur-fade" delay={0.3}>
  <div className="card-glass">Conteúdo</div>
</AnimatedCard>
```

### Variantes Disponíveis
- `slide-up`: Default suave de baixo
- `fade-in`: Transição simples
- `scale-in`: Zoom entrada
- `blur-fade`: Blur desfoque (premium)

---

## 📋 Implementação Atual

### ✅ Implementado
- [x] Página transitions (Slide Up padrão)
- [x] AnimatePresence para sincronização
- [x] Logo profissional novo
- [x] Animação de scroll trigger (whileInView)
- [x] Componente AnimatedCard reutilizável

### 🔄 Próximos Passos (Opcionais)
- [ ] Aplicar AnimatedCard nas cards do Dashboard
- [ ] Aplicar AnimatedCard nos gráficos Recharts
- [ ] Efeito de transição nos botões de ação rápida
- [ ] Animação de carregamento de dados (skeleton loading)
- [ ] Parallax effect em hero sections

---

## 🚀 Performance

Todos os efeitos usam:
- ✅ GPU-accelerated transforms (scale, y translate)
- ✅ Optimal durations (300-600ms)
- ✅ Cubic-bezier easing para movimentos naturais
- ✅ AnimatePresence com `mode="wait"` para sincronização
- ✅ `whileInView` com throttle (viewport intersection)

**Resultado**: Transições suaves sem impacto na performance.

---

## 🎯 Best Practices Aplicadas

1. **Duration**: 300-600ms (não muito rápido nem lento)
2. **Easing**: cubic-bezier smooth vs linear
3. **Stagger**: delay para cascata visual (0.1s, 0.2s, 0.3s)
4. **Exit Animation**: mais rápido (300ms) que entrada (500-600ms)
5. **Wait Mode**: AnimatePresence com `mode="wait"` previne overlap

---

## 📊 Referências

- [Framer Motion - Animations](https://www.framer.com/motion/)
- [Apple.com Transitions](https://www.apple.com)
- [Figma Interactions](https://www.figma.com)
- [Webflow Effects](https://webflow.com)

---

Enjoy smooth transitions! 🎉
