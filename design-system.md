# Design System - App de Casal

## 🎯 Conceito Visual

**Vibe:** Divertido clean inovador - Um espaço íntimo mas moderno, acolhedor mas não meloso

**Estratégia de Design:**

- Cores vibrantes mas sofisticadas (fugir do rosa clichê)
- Micro-interações que surpreendem
- Espaços generosos (breathing room)
- Rounded corners moderados (não muito infantil)

---

## 🎨 Paleta de Cores

### Tema Claro

**Cores Principais:**

```
Primary (Roxo Vibrante):     #7C3AED (violet-600)
Secondary (Coral Suave):     #FB923C (orange-400)
Accent (Azul Elétrico):      #3B82F6 (blue-500)
```

**Neutros:**

```
Background:     #FFFFFF
Surface:        #F9FAFB (gray-50)
Border:         #E5E7EB (gray-200)
Text Primary:   #111827 (gray-900)
Text Secondary: #6B7280 (gray-500)
```

**Feedback:**

```
Success:  #10B981 (green-500)
Warning:  #F59E0B (amber-500)
Error:    #EF4444 (red-500)
Info:     #06B6D4 (cyan-500)
```

### Tema Escuro

**Cores Principais:**

```
Primary (Roxo Claro):        #A78BFA (violet-400)
Secondary (Coral Vibrante):  #FDBA74 (orange-300)
Accent (Azul Brilhante):     #60A5FA (blue-400)
```

**Neutros:**

```
Background:     #0F172A (slate-900)
Surface:        #1E293B (slate-800)
Border:         #334155 (slate-700)
Text Primary:   #F1F5F9 (slate-100)
Text Secondary: #94A3B8 (slate-400)
```

**Feedback:**

```
Success:  #34D399 (green-400)
Warning:  #FBBF24 (amber-400)
Error:    #F87171 (red-400)
Info:     #22D3EE (cyan-400)
```

---

## 📝 Tipografia

### Fonte Principal: **Inter** (Google Fonts)

- Moderna, clean, ótima legibilidade
- Humanista e amigável
- Excelente em mobile

### Fonte Display: **Sora** (Google Fonts)

- Para títulos e destaques
- Geométrica mas suave
- Traz personalidade sem ser infantil

### Escala Tipográfica

```
Hero (H1):       48px / 3rem    - font-bold - Sora
Title (H2):      32px / 2rem    - font-bold - Sora
Heading (H3):    24px / 1.5rem  - font-semibold - Sora
Subheading (H4): 20px / 1.25rem - font-semibold - Inter
Body Large:      18px / 1.125rem - font-normal - Inter
Body:            16px / 1rem    - font-normal - Inter
Body Small:      14px / 0.875rem - font-normal - Inter
Caption:         12px / 0.75rem - font-medium - Inter
```

### Line Height

```
Títulos:  1.2 - 1.3
Parágrafos: 1.6 - 1.7
```

---

## 📐 Layout & Spacing

### Sistema de Espaçamento (Tailwind)

```
xs:  4px   (1)
sm:  8px   (2)
md:  16px  (4)
lg:  24px  (6)
xl:  32px  (8)
2xl: 48px  (12)
3xl: 64px  (16)
```

### Breakpoints (Mobile First)

```
sm:  640px  - Telefone grande
md:  768px  - Tablet
lg:  1024px - Desktop
xl:  1280px - Desktop grande
```

### Container

```
Mobile:  Padding 16px (4)
Tablet:  Padding 24px (6)
Desktop: Max-width 1200px, Padding 32px (8)
```

### Border Radius

```
Pequeno:  6px  (rounded-md)   - Inputs, cards pequenos
Médio:    12px (rounded-xl)   - Cards principais
Grande:   16px (rounded-2xl)  - Modais, imagens
Completo: 9999px (rounded-full) - Avatares, badges
```

---

## 🎭 Componentes Principais

### Cards de Mensagem/Mídia

```
- Background: Surface color
- Border: 1px solid border color
- Radius: rounded-xl (12px)
- Padding: 16px (4)
- Shadow: subtle (shadow-sm no claro, glow sutil no escuro)
- Hover: Leve elevação (shadow-md)
```

### Botões

**Primary (CTA principal)**

```
- Background: Primary color
- Text: White
- Radius: rounded-lg (8px)
- Padding: py-3 px-6
- Hover: Escurece 10%
- Transition: 150ms
```

**Secondary**

```
- Background: Transparent
- Border: 2px solid primary
- Text: Primary color
- Hover: Background primary + opacity 10%
```

**Ghost**

```
- Background: Transparent
- Text: Text secondary
- Hover: Background surface
```

### Inputs

```
- Height: 48px (mobile) / 44px (desktop)
- Padding: px-4
- Radius: rounded-lg (8px)
- Border: 2px solid border color
- Focus: Ring 2px primary color
- Placeholder: Text secondary
```

### Avatar

```
- Size Small: 32px
- Size Medium: 48px
- Size Large: 64px
- Radius: rounded-full
- Border: 2px solid primary (quando ativo)
```

---

## ✨ Princípios de Design

### 1. Micro-interações Deliciosas

- Animações suaves (150-300ms)
- Feedback tátil em ações importantes
- Transições entre estados
- Loading states divertidos

### 2. Hierarquia Visual Clara

- Espaço em branco generoso
- Contraste adequado (WCAG AA mínimo)
- Tamanhos progressivos
- Peso tipográfico definido

### 3. Consistência

- Mesmo spacing system em todo app
- Cores sempre dos tokens definidos
- Componentes reutilizáveis
- Padrões de interação previsíveis

### 4. Personalidade

- Ilustrações sutis (não usar em excesso)
- Ícones rounded (não sharp)
- Copy amigável e humano
- Celebrações de momentos especiais

---

## 🎨 Mood Board de Referência

**Cores:** Pense em um pôr do sol moderno - roxos profundos, laranjas suaves, azuis elétricos

**Vibe Visual:**

- Notion (organização clean)
- Linear (velocidade e sofisticação)
- Superhuman (atenção aos detalhes)
- Arc Browser (inovação em UI)

**NÃO É:**

- Rosa/vermelho clichê romântico
- Infantil ou muito brincalhão
- Corporativo ou frio
- Sobrecarregado de elementos

---

## 📱 Exemplo de Tela Principal

```
┌─────────────────────────────────┐
│  [Avatar A] 💜 [Avatar B]       │ ← Header com avatares do casal
│                                 │
│  ┌──────────────────────────┐  │
│  │  🎵 [Música compartilhada]│  │ ← Card com rounded-xl
│  │  "Nossa música" - User A  │  │   Background surface
│  │  há 2 horas               │  │   Padding generoso
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │  📸 [Foto]               │  │
│  │  "Momento especial"      │  │
│  │  há 5 horas              │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │  💬 "Mensagem carinhosa" │  │
│  │  há 1 dia                │  │
│  └──────────────────────────┘  │
│                                 │
│         [+ Novo momento]        │ ← Botão Primary roxo
└─────────────────────────────────┘
```

---

## 🚀 Próximos Passos

1. **Configurar Tailwind com essa paleta**
2. **Instalar shadcn/ui e customizar temas**
3. **Importar fontes Inter e Sora**
4. **Criar componentes base (Button, Card, Input)**
5. **Testar no mobile primeiro**

---

## 💡 Dicas de Implementação

**Dark Mode:**

- Usar `dark:` prefix do Tailwind
- Reduzir contraste no escuro (não usar preto puro)
- Aumentar saturação de cores no escuro

**Performance:**

- Lazy load de imagens
- Otimizar fontes (font-display: swap)
- Animações com CSS transforms (não layout)

**Acessibilidade:**

- Contraste mínimo 4.5:1 para texto
- Touch targets mínimo 44x44px
- Focus states visíveis
- Suporte a screen readers
