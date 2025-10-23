Preciso implementar a página HOME do app de casal com o conceito "Dashboard Vivo" - um hub central modular e personalizável.

============================================
CONCEITO GERAL
============================================

A Home é o centro de comando do relacionamento, onde o casal:

- Vê status da relação em tempo real
- Acessa funcionalidades rapidamente
- Mantém engajamento com gamificação
- Sente conexão imediata ao abrir o app

Usar o design system já implementado (paleta violet/orange/blue, fontes Inter/Sora, tema claro/escuro).

============================================
ESTRUTURA DE WIDGETS
============================================

IMPLEMENTAR SISTEMA DE WIDGETS MODULARES:

Cada widget é um componente independente que pode:

- Ser mostrado/ocultado
- Ser reordenado (drag & drop)
- Ter tamanho ajustável (small/medium/large/full)
- Ser removido da Home
- Ter estado próprio e loading state

============================================
WIDGETS A IMPLEMENTAR
============================================

--- WIDGETS ATIVOS POR PADRÃO ---

1. WIDGET HERO STATUS (sempre fixo no topo, não removível)
   Componente: HeroStatusWidget
   Props: { couple, streak, daysTogether }

Conteúdo:

- Avatares dos dois usuários com indicador de presença online (🟢/⚪)
- Contador de dias juntos (animado ao carregar)
- Streak atual com ícone de fogo 🔥 (animação pulse)
- Gradiente sutil de fundo (from-primary/10 via-secondary/10 to-accent/10)
- Botão CTA: "Enviar carinho rápido" (abre menu de ações)
- Nome do casal em destaque

Animações:

- Contador conta de 0 até valor real (2s)
- Avatar do parceiro com glow sutil quando online
- Streak com pulse animation
- Hover no botão: elevação suave

---

2. WIDGET AÇÕES RÁPIDAS (sempre visível após Hero)
   Componente: QuickActionsWidget
   Props: { onAction }

Conteúdo:

- Grid de botões grandes 2x2 ou 5 em linha (responsivo)
- Ações: 💬 Mensagem | 📸 Foto | 🎵 Música | ❤️ Reação | 🎁 Surpresa
- Ícones coloridos (cada um com cor do tipo)
- Touch-friendly (min 48px)
- Abre modal/drawer correspondente ao clicar

Estilos:

- Cards com hover:scale-105
- Background subtle (card color)
- Border sutil
- Icons lucide-react

---

3. WIDGET DESAFIOS DO DIA
   Componente: DailyChallengesWidget
   Props: { challenges, onComplete }

Conteúdo:

- Título: "🎯 DESAFIOS DE HOJE"
- Lista de 3 desafios diários:
  - "Enviar 3 mensagens" (2/3) [66%]
  - "Compartilhar 1 música" ✓ Completo!
  - "Reagir a 2 momentos" (1/2) [50%]
- Progress bar para cada desafio
- XP ganho hoje + nível do relacionamento
- Animação de confetti quando completa desafio

Dados dos desafios:
{
id, title, current, goal, completed, xp, icon
}

Gamificação:

- Níveis: Bronze (0-100), Prata (101-500), Ouro (501-1000), Platina (1000+)
- XP por desafio: 10-50 pontos
- Badges especiais em marcos

---

4. WIDGET PRÓXIMOS EVENTOS
   Componente: UpcomingEventsWidget
   Props: { events, onAddEvent }

Conteúdo:

- Título: "📅 PRÓXIMOS EVENTOS"
- Lista dos próximos 3 eventos com:
  - Ícone do tipo (🎂 aniversário, 🍽️ jantar, ✈️ viagem, 💍 marco)
  - Nome do evento
  - Contagem regressiva (em X dias)
  - Progress bar visual mostrando proximidade
- Botão [+ Adicionar evento]
- Link [Ver todos →]

Estrutura evento:
{
id, type, title, date, icon, color, isImportant
}

Progress bar:

- Calcula % baseado em data criação → data evento
- Cores mudam conforme proximidade (verde → amarelo → vermelho)

---

5. WIDGET FEED RESUMIDO
   Componente: RecentActivityWidget
   Props: { activities, onViewAll }

Conteúdo:

- Título: "💫 ÚLTIMAS ATIVIDADES"
- Últimas 3-5 atividades do casal
- Para cada atividade:
  - Ícone do tipo (🎵/📸/💬)
  - Autor + ação
  - Preview do conteúdo (truncado)
  - Timestamp relativo (há 2h)
  - Botões de ação inline: [♥ Reagir] [💬 Comentar]
- Link [Ver tudo no Feed →]

Features:

- Auto-atualiza a cada 30s
- Animação slide-in para nova atividade
- Badge de "novo" em itens não vistos

---

--- WIDGETS OPCIONAIS (podem ser adicionados) ---

6. WIDGET ESTATÍSTICAS
   Componente: StatsWidget
   Props: { stats }

Conteúdo:

- Título: "📊 VOCÊS EM NÚMEROS"
- Grid de stats com ícones:
  - 💬 2.847 mensagens
  - 📸 156 fotos
  - 🎵 32 músicas
  - ❤️ 1.234 reações
- Contadores animados ao entrar no viewport
- Indicador de crescimento desde último login (+12 desde ontem)
- Link [Ver relatório completo →]

Animação:

- useIntersectionObserver para animar quando visível
- Contador incrementa suavemente

---

7. WIDGET MEMÓRIA DO DIA
   Componente: DailyMemoryWidget
   Props: { memory }

Conteúdo:

- Título: "✨ MEMÓRIA DO DIA"
- Card com:
  - Data do evento original (📅 Há 1 ano hoje...)
  - Thumbnail da foto/conteúdo
  - Título/descrição do momento
  - Botão [Ver memória completa →]
- Gradiente nostálgico de fundo

Algoritmo:

- Busca momentos do mesmo dia (dia/mês) em anos anteriores
- Prioriza momentos com fotos
- Se não houver: momento aleatório antigo

---

8. WIDGET MOOD TRACKER
   Componente: MoodTrackerWidget
   Props: { todayMood, onSelectMood }

Conteúdo:

- Título: "💭 COMO VOCÊS ESTÃO?"
- Último mood registrado
- Seletor de humor de hoje:
  [😊 Felizes] [😍 Apaixonados] [🥳 Celebrando] [😴 Tranquilos] [😔 Precisando de apoio]
- Sugestão contextual baseada no mood:
  - Apaixonados → "Que tal uma mensagem carinhosa?"
  - Tranquilos → "Momento perfeito para compartilhar uma música relaxante"
- Gráfico simples de moods da semana
- Mostra também os moods da semana do parceiro vinculado

Dados:
{
date, mood (emoji), person, suggestions[]
}

---

9. WIDGET SURPRESAS PREVIEW
   Componente: SurprisesPreviewWidget
   Props: { momentsCount, recentMoments }

Conteúdo:

- Título: "🎁 SURPRESAS & MEMÓRIAS"
- Contador: "Vocês têm X memórias especiais guardadas 💜"
- Mini-grid visual (2x3) com thumbnails dos últimos momentos
- Botão [Explorar tudo →] (leva para aba Surpresas/Constellation)

Grid:

- 6 thumbnails pequenos
- Hover: scale + blur de fundo
- Click: abre modal ou navega

---

10. WIDGET SUGESTÕES INTELIGENTES
    Componente: SmartSuggestionsWidget
    Props: { suggestion, onAction, onDismiss }

Conteúdo:

- Título: "💡 SUGESTÃO DO DIA"
- Texto da sugestão baseado em padrões:
  - "Vocês não compartilham música há 3 dias. Que tal enviar aquela especial?"
  - "João fez aniversário há 1 semana. Já planejaram comemorar juntos?"
  - "Vocês têm 5 fotos sem reação. Que tal revisitar memórias?"
- Botões: [Ação sugerida] [Ignorar]
- Pode ser dispensado (swipe ou X)

Algoritmo:

- Analisa padrões de uso
- Detecta gaps (sem interação por X dias)
- Sugere ações baseado em histórico
- Aprende com dismissals

---

============================================
SISTEMA DE PERSONALIZAÇÃO DA HOME
============================================

TELA DE CONFIGURAÇÃO DE LAYOUT:
Rota: /home/customize ou modal sobreposto

Interface:

```
┌─────────────────────────────────┐
│  📱 PERSONALIZAR HOME           │
│                                 │
│  Arraste para reordenar:       │
│                                 │
│  [≡] Hero Status      [👁️ ON] │ (não removível)
│  [≡] Ações Rápidas    [👁️ ON] │
│  [≡] Desafios         [👁️ ON] │
│  [≡] Próximos Eventos [👁️ OFF]│
│  [≡] Feed Resumido    [👁️ ON] │
│  [≡] Estatísticas     [👁️ OFF]│
│                                 │
│  ➕ ADICIONAR WIDGET            │
│  [Memória do Dia]              │
│  [Mood Tracker]                │
│  [Sugestões IA]                │
│  [etc...]                      │
│                                 │
│  TAMANHO DOS CARDS:            │
│  ( ) Compacto  (•) Normal      │
│  ( ) Confortável               │
│                                 │
│  [Restaurar padrão]            │
│  [Salvar layout] ✓             │
└─────────────────────────────────┘
```

Funcionalidades:

1. **Drag & Drop** para reordenar (usar @dnd-kit/core)
2. **Toggle de visibilidade** (exceto Hero)
3. **Adicionar widgets** da lista de disponíveis
4. **Remover widgets** (swipe ou botão X)
5. **Ajustar densidade** (compacto/normal/confortável)
6. **Salvar configuração** no localStorage ou backend
7. **Restaurar padrão** em um clique

Dados de configuração:

```typescript
interface HomeLayout {
  widgets: Array<{
    id: string;
    type: WidgetType;
    visible: boolean;
    order: number;
    size: 'small' | 'medium' | 'large' | 'full';
  }>;
  density: 'compact' | 'normal' | 'comfortable';
  lastModified: Date;
}
```

Persistência:

- Salvar em localStorage: 'homeLayout'
- Sincronizar com backend para multi-device
- Carregar no mount da Home

============================================
FUNCIONALIDADES ESPECIAIS
============================================

1. PULL TO REFRESH

- Implementar com touch gestures
- Animação de loading circular
- Atualiza todos widgets simultaneamente
- Feedback tátil (vibração sutil se disponível)
- Mostra timestamp da última atualização

Biblioteca: react-pull-to-refresh ou custom

---

2. SKELETON LOADING

- Cada widget tem versão skeleton
- Mostra placeholders durante carregamento
- Animação shimmer suave
- Mantém layout (evita layout shift)

Componente: WidgetSkeleton

```jsx
<WidgetSkeleton type="hero" className="h-48" />
```

---

3. EMPTY STATES INTELIGENTES

- Quando não há dados, mostrar mensagens contextuais:
  - Sem eventos: "Vamos planejar algo especial? 🎉 [+ Criar evento]"
  - Sem atividades: "Seja o primeiro a compartilhar algo hoje! 💜"
  - Sem desafios completos: "Complete um desafio para ganhar XP!"
- Ilustrações SVG sutis
- CTAs claros para ação

---

4. ANIMAÇÕES DE ENTRADA (Stagger)

- Widgets aparecem em sequência ao carregar
- Delay incremental (50ms entre cada)
- Fade + slide up animation
- Usar framer-motion ou CSS animations

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05 }}
>
  <Widget />
</motion.div>
```

---

5. NOTIFICAÇÕES EM TEMPO REAL

- Badge vermelho nos widgets com novidades
- Exemplo: Widget Feed com "3 novas atividades"
- Badge pulse animation
- Clear ao abrir o widget
- WebSocket ou polling para updates

---

7. GESTOS AVANÇADOS

- Swipe left em widget: menu de ações (editar/remover/configurar)
- Swipe right: marcar como lido/dispensar
- Long press: drag to reorder
- Double tap: expandir/colapsar widget

---

8. REFRESH INTELIGENTE

- Auto-refresh em background quando app volta de background
- Indicador sutil de "atualizando..." no topo
- Não interrompe interação do usuário
- Merge suave de novos dados

---

9. ONBOARDING/TUTORIAL

- Primeira vez que usuário acessa Home:
  - Tooltip: "Essa é sua Home! Toque aqui para personalizar"
  - Explica como funciona o app e como usá-lo
  - Spotlight nos principais widgets
  - Tutorial opcional: "Como usar os desafios"
- Pode ser pulado
- Não reaparece caso marcado como "não mostrar novamente" (flag no localStorage)

---

============================================
LAYOUT RESPONSIVO
============================================

MOBILE (< 768px):

- Stack vertical (1 coluna)
- Hero sempre no topo
- Ações Rápidas logo abaixo (sticky após scroll)
- Demais widgets em pilha
- Padding: 16px (p-4)
- Widgets full-width

TABLET (768px - 1024px):

- Grid 2 colunas
- Hero span 2 colunas
- Ações Rápidas span 2 colunas
- Widgets alternam (1 ou 2 colunas dependendo do tamanho)
- Padding: 24px (p-6)

DESKTOP (> 1024px):

- Grid 3 colunas (ou 12 col com span variável)
- Hero span 3 colunas
- Ações Rápidas span 3 colunas
- Widgets podem ser 1, 2 ou 3 colunas
- Max-width: 1200px centralizado
- Padding: 32px (p-8)

Layout Grid:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  <div className="col-span-full"> {/* Hero */} </div>
  <div className="col-span-full"> {/* Ações */} </div>
  <div className="md:col-span-1"> {/* Widget normal */} </div>
  <div className="md:col-span-2"> {/* Widget largo */} </div>
</div>
```

============================================
HIERARQUIA DE INFORMAÇÃO
============================================

ABOVE THE FOLD (sempre visível sem scroll):

1. Hero Status - dias juntos + presença
2. Ações Rápidas - comunicação imediata
3. Notificações urgentes (se houver)

PRIORIDADE ALTA (scroll mínimo): 4. Desafios do dia (gamificação) 5. Próximos eventos (planejamento)

PRIORIDADE MÉDIA (mais abaixo): 6. Feed resumido 7. Estatísticas 8. Memória do dia

PRIORIDADE BAIXA (final da página): 9. Sugestões IA 10. Widgets opcionais

============================================
DADOS E API
============================================

Endpoints necessários:

GET /api/home/dashboard
Retorna todos dados da Home:
{
couple: { person1, person2, daysTogether, status },
streak: { current, longest, lastActivity },
challenges: [],
events: [],
activities: [],
stats: {},
memory: {},
suggestions: []
}

GET /api/home/layout
Retorna configuração de layout do usuário

POST /api/home/layout
Salva nova configuração de layout

POST /api/challenges/:id/complete
Marca desafio como completo

POST /api/mood
Registra mood do dia

============================================
ESTRUTURA DE ARQUIVOS
============================================

src/
pages/
Home.tsx (página principal)
HomeCustomize.tsx (tela de personalização)

components/
home/
HomeContainer.tsx (container principal com grid)

      widgets/
        HeroStatusWidget.tsx
        QuickActionsWidget.tsx
        DailyChallengesWidget.tsx
        UpcomingEventsWidget.tsx
        RecentActivityWidget.tsx
        StatsWidget.tsx
        DailyMemoryWidget.tsx
        MoodTrackerWidget.tsx
        SurprisesPreviewWidget.tsx
        SmartSuggestionsWidget.tsx
        ConnectionCounterWidget.tsx
        TimelineWidget.tsx

      shared/
        WidgetContainer.tsx (wrapper comum)
        WidgetSkeleton.tsx (loading state)
        WidgetEmptyState.tsx (sem dados)

      customization/
        LayoutCustomizer.tsx (tela de personalização)
        WidgetSelector.tsx (adicionar widgets)
        DensityToggle.tsx (ajustar densidade)


hooks/
useHomeLayout.ts (gerencia layout personalizado)
usePullToRefresh.ts (pull to refresh)
useWidgetData.ts (fetch data de widgets)
useRealTimeUpdates.ts (websocket/polling)

utils/
homeLayoutManager.ts (salvar/carregar layout)
widgetRegistry.ts (registro de widgets disponíveis)

============================================
ESTADOS E CONTEXT
============================================

HomeContext:

```typescript
interface HomeContextType {
  layout: HomeLayout;
  density: 'compact' | 'normal' | 'comfortable';
  updateLayout: (layout: HomeLayout) => void;
  addWidget: (widgetType: string) => void;
  removeWidget: (widgetId: string) => void;
  reorderWidgets: (from: number, to: number) => void;
  toggleWidget: (widgetId: string) => void;
  isCustomizing: boolean;
  setIsCustomizing: (value: boolean) => void;
}
```

============================================
MÉTRICAS E ANALYTICS
============================================

Rastrear:

- Tempo na Home vs outras abas
- Widgets mais usados
- Frequência de personalização
- Taxa de completude de desafios
- Engajamento com ações rápidas
- Cliques em CTAs
- Pull to refresh usage

Eventos:

- home_view
- widget_interacted (type, action)
- layout_customized
- challenge_completed
- quick_action_used
- suggestion_acted / suggestion_dismissed

============================================
ACESSIBILIDADE
============================================

- Todos botões com aria-labels descritivos
- Navegação por teclado (tab order lógico)
- Focus visible em todos interativos
- Screen reader friendly (roles, labels)
- Contraste mínimo WCAG AA
- Touch targets mínimo 44x44px
- Redução de movimento (prefers-reduced-motion)

============================================
PERFORMANCE
============================================

Otimizações:

- Lazy load widgets abaixo do fold
- Virtualize long lists (se aplicável)
- Memoize widgets com React.memo
- Debounce auto-refresh
- Code splitting por widget
- Image lazy loading
- Suspense boundaries
- Error boundaries por widget (um erro não quebra toda Home)

============================================
TESTES
============================================

Casos a testar:

- Carregamento inicial da Home
- Personalização de layout (add/remove/reorder)
- Pull to refresh
- Responsividade mobile/tablet/desktop
- Empty states
- Loading states
- Error states
- Interações com cada widget
- Persistência de configuração
- Modo claro/escuro

============================================
PRÓXIMOS PASSOS
============================================

1. Criar estrutura base (HomeContainer + Context)
2. Implementar widgets ativos por padrão (Hero, Ações, Desafios, Eventos, Feed)
3. Adicionar sistema de personalização (drag & drop, toggle)
4. Implementar widgets opcionais
5. Adicionar funcionalidades especiais (pull to refresh, animations, etc)
6. Polir responsividade
7. Testes de usabilidade
8. Otimizações de performance
9. Analytics

============================================
NOTAS FINAIS
============================================

- Usar design system já implementado (cores, fontes, espaçamentos)
- Shadcn/ui para componentes base (Button, Card, Progress, etc)
- Framer Motion para animações complexas (opcional)
- @dnd-kit para drag & drop
- Lucide React para ícones
- Tailwind para estilização
- TypeScript obrigatório
- Código limpo, componentizado e documentado

A Home deve ser RÁPIDA, INTUITIVA e DAR VONTADE DE USAR. Cada widget deve agregar valor e motivar interação!
