# 📊 RELATÓRIO DE ANÁLISE COMPLETA - noo.us

## 📌 Visão Geral do Projeto
**noo.us** é uma aplicação web voltada para casais e pessoas próximas (família, amigos) que desejam compartilhar momentos especiais, surpresas e manter conexões emocionais através de um sistema de vínculos múltiplos.

**Stack Tecnológica:**
- **Frontend:** Astro + React 18 + Tailwind CSS
- **Backend:** Firebase (Firestore, Auth, Storage, Functions)
- **Autenticação:** Email/Senha, Google OAuth, SMS (Phone)
- **Deploy:** Firebase Hosting
- **Testes:** Jest + React Testing Library (parcialmente implementado)

---

## 🎯 FUNCIONALIDADES IDENTIFICADAS

### 🔹 1. Sistema de Autenticação Multi-Método

**Descrição:**  
Sistema completo de autenticação que suporta 3 métodos: Email/Senha, Google OAuth e SMS/Phone, com cadastro e login separados, recuperação de senha e persistência de sessão.

**Pontos Fortes:**
- ✅ Múltiplos métodos de autenticação aumentam acessibilidade
- ✅ reCAPTCHA integrado para proteção contra bots em SMS
- ✅ Validação robusta de dados (frontend + Firebase)
- ✅ Sistema de avatares com cores aleatórias para usuários sem foto
- ✅ Seleção de gênero para personalizar avatar padrão
- ✅ Persistência de sessão (local/session storage)

**Pontos Fracos:**
- ⚠️ Sem verificação de email obrigatória (usuários podem criar conta sem confirmar)
- ⚠️ Não há bloqueio de conta por múltiplas tentativas falhas de login
- ⚠️ Falta feedback visual quando SMS está sendo enviado
- ⚠️ Regras do Firestore permitem leitura pública de usuários (`allow read: if true` na linha 20)
- ⚠️ Não há 2FA (Two-Factor Authentication)

**Ideias de Melhoria:**
- Adicionar verificação obrigatória de email com link de confirmação
- Implementar bloqueio temporário após 5 tentativas falhas
- Adicionar loading skeleton durante envio de SMS
- Restringir leitura de usuários apenas para buscas específicas (email/phone)
- Adicionar opção de 2FA via SMS ou TOTP

**Novas Ideias Relacionadas:**
- **Login com Apple** (especialmente para iOS)
- **Biometria** (Face ID/Touch ID) para login rápido em dispositivos móveis
- **Login sem senha** (Magic Link via email)
- **Recuperação de conta** via perguntas de segurança ou contato de emergência

**Sugestões Técnicas:**
- Migrar para Firebase Authentication Emulator em desenvolvimento
- Implementar rate limiting mais granular com Redis/Cloud Firestore
- Adicionar logs de auditoria (IP, device, timestamp) para segurança
- Usar `react-hook-form` para formulários mais performáticos
- Implementar lazy loading do reCAPTCHA para melhorar LCP (Largest Contentful Paint)

---

### 🔹 2. Sistema de Vínculos Múltiplos

**Descrição:**  
Permite que usuários se conectem com múltiplas pessoas (parceiro, família, amigos), enviando convites por email/telefone, com notificações em tempo real.

**Pontos Fortes:**
- ✅ Suporte a múltiplos vínculos (não limita a apenas um parceiro)
- ✅ Tipos de relacionamento customizáveis (partner, family, friend)
- ✅ Sistema de convites com notificações
- ✅ Validação para evitar auto-vinculação
- ✅ Verificação de convites duplicados
- ✅ Links espelho (ambos usuários têm referência um do outro)

**Pontos Fracos:**
- ⚠️ Não há sistema de bloqueio (usuário pode receber convites indesejados repetidamente)
- ⚠️ Ausência de labels/apelidos personalizados para vínculos
- ⚠️ Não permite enviar mensagem junto com o convite
- ⚠️ Falta histórico de convites rejeitados/aceitos
- ⚠️ Usuário precisa saber email/telefone exato (não há busca por nome)

**Ideias de Melhoria:**
- Adicionar sistema de bloqueio de usuários
- Permitir adicionar notas/apelidos aos vínculos
- Campo opcional de mensagem ao enviar convite
- Painel de histórico de convites
- Busca inteligente por nome (fuzzy search)

**Novas Ideias Relacionadas:**
- **QR Code para vincular** presencialmente (mais rápido e seguro)
- **Níveis de privacidade** por vínculo (algumas surpresas só para certos vínculos)
- **Grupos de vínculos** (família, amigos próximos, etc.)
- **Sincronização de calendário** entre vínculos
- **Sugestões de surpresas** baseadas no tipo de vínculo

**Sugestões Técnicas:**
- Implementar índice de busca com Algolia/Elasticsearch para pesquisa por nome
- Criar subcoleção `blockedUsers` para gerenciar bloqueios
- Adicionar campo `metadata` em vínculos para extensibilidade
- Usar Firebase Cloud Messaging (FCM) para push notifications
- Implementar debounce na busca de usuários

---

### 🔹 3. Sistema de Surpresas (4 Tipos)

**Descrição:**  
Permite criar e enviar 4 tipos de surpresas: Mensagem, Foto, Música (Spotify), e Proposta de Encontro, com sistema de reações, modo privado e visualização de histórico.

**Pontos Fortes:**
- ✅ Variedade de tipos de conteúdo
- ✅ Sistema de reações com emojis
- ✅ Modo privado com desfoque (blur effect)
- ✅ Upload de imagens otimizado
- ✅ Integração com Spotify para músicas
- ✅ Notificações em tempo real para novas surpresas
- ✅ "Momento do Dia" para relembrar surpresas antigas

**Pontos Fracos:**
- ⚠️ Não há edição de surpresas após envio
- ⚠️ Ausência de agendamento (enviar surpresa em data futura)
- ⚠️ Limite de 1 imagem por surpresa foto
- ⚠️ Sem compressão progressiva de imagens (WebP, AVIF)
- ⚠️ Não há busca/filtros avançados (por tipo, palavra-chave, período)
- ⚠️ Falta confirmação antes de deletar surpresa
- ⚠️ Música Spotify só funciona com URL (não há busca integrada)

**Ideias de Melhoria:**
- Permitir edição dentro de 5 minutos após envio
- Sistema de agendamento com cron jobs (Firebase Functions)
- Galeria com múltiplas fotos (até 10)
- Usar bibliotecas como `sharp` ou Cloudinary para compressão
- Adicionar busca full-text e filtros por tags
- Modal de confirmação para ações destrutivas
- Integrar Spotify API para buscar músicas

**Novas Ideias Relacionadas:**
- **Surpresas em vídeo** (gravação curta de 30s)
- **Surpresas de voz** (áudio gravado)
- **Cartas digitais animadas** com templates
- **Contagem regressiva** para eventos especiais
- **Cápsulas do tempo** (surpresas que se revelam no futuro)
- **Surpresas colaborativas** (várias pessoas contribuem)
- **GIFs animados** como tipo de surpresa
- **Jogos interativos** (quiz sobre o relacionamento)

**Sugestões Técnicas:**
- Implementar CDN (Cloudflare/Imgix) para imagens
- Usar `react-virtualized` ou `react-window` para listas longas
- Adicionar infinite scroll com paginação otimizada
- Implementar service worker para cache de imagens offline
- Usar WebP/AVIF com fallback para JPEG
- Adicionar skeleton loaders para melhor UX
- Implementar drag-and-drop para múltiplas imagens

---

### 🔹 4. Sistema de Notificações

**Descrição:**  
Sino de notificações com dropdown (desktop) e modal (mobile), exibe convites de vínculo, surpresas recebidas e ações pendentes.

**Pontos Fortes:**
- ✅ UI responsiva (dropdown desktop / modal mobile)
- ✅ Badge de contagem não lidas
- ✅ Timestamps relativos (ex: "5min", "2h")
- ✅ Avatares dos remetentes
- ✅ Marcar como lida individual ou em lote
- ✅ Fecha automaticamente ao clicar fora (desktop)

**Pontos Fracos:**
- ⚠️ Não há som/vibração para novas notificações
- ⚠️ Ausência de push notifications (apenas in-app)
- ⚠️ Limite de 50 notificações (query com `limit(50)`)
- ⚠️ Não agrupa notificações similares (ex: "3 novas surpresas")
- ⚠️ Falta preferências de notificação (quais tipos receber)

**Ideias de Melhoria:**
- Adicionar som sutil e vibração (com opção de desabilitar)
- Implementar Firebase Cloud Messaging para push
- Paginação infinita para histórico completo
- Agrupar notificações do mesmo tipo/remetente
- Painel de configurações de notificações

**Novas Ideias Relacionadas:**
- **Notificações por email** (resumo diário/semanal)
- **Lembretes automáticos** (aniversário, datas especiais)
- **Notificações de marcos** (100ª surpresa, 1 ano juntos)
- **Modo "Não Perturbe"** em horários específicos
- **Notificações de inatividade** ("Faz tempo que você não envia uma surpresa...")

**Sugestões Técnicas:**
- Integrar Firebase Cloud Messaging
- Usar Web Push API para navegadores
- Implementar notification service worker
- Adicionar analytics para taxa de abertura
- Usar Firestore Triggers para criar notificações automaticamente

---

### 🔹 5. Dashboard Multi-Aba (Home, Surpresas, Vínculos)

**Descrição:**  
Interface principal com navegação por abas: Home (feed + ações rápidas), Surpresas (histórico completo), Vínculos (gerenciar conexões).

**Pontos Fortes:**
- ✅ Navegação intuitiva e mobile-friendly
- ✅ Bottom navigation persistente (mobile)
- ✅ Lazy loading do ProfileSettings
- ✅ Estado local gerenciado com hooks customizados
- ✅ Componentes bem separados por responsabilidade

**Pontos Fracos:**
- ⚠️ Não há deep linking (URLs não mudam por aba)
- ⚠️ Falta breadcrumb em desktop
- ⚠️ Não persiste aba ativa entre reloads
- ⚠️ Transições entre abas são instantâneas (sem animação)
- ⚠️ Header ocupa muito espaço vertical em mobile

**Ideias de Melhoria:**
- Implementar routing com URLs (ex: `/dashboard/home`, `/dashboard/surprises`)
- Adicionar breadcrumb para navegação hierárquica
- Salvar aba ativa em localStorage
- Adicionar transições suaves com Framer Motion
- Header collapse ao scroll (auto-hide)

**Novas Ideias Relacionadas:**
- **Aba "Calendário"** com timeline de surpresas
- **Aba "Estatísticas"** (gráficos de atividade)
- **Aba "Memórias"** (álbum de fotos)
- **Modo dark/light** com toggle
- **Customização de tema** (cores primárias)

**Sugestões Técnicas:**
- Migrar para React Router ou Astro routing
- Usar Zustand ou Redux Toolkit para estado global
- Implementar `useReducer` para lógica complexa de abas
- Adicionar Suspense boundaries por aba
- Usar Intersection Observer para lazy load de conteúdo

---

### 🔹 6. Perfil e Configurações

**Descrição:**  
Permite editar nome, foto de perfil, selecionar avatar personalizado e fazer logout.

**Pontos Fortes:**
- ✅ Upload de foto com preview
- ✅ Galeria de avatares com cores randômicas
- ✅ Validação de tamanho/tipo de arquivo
- ✅ Feedback visual durante upload
- ✅ Lazy loading do componente

**Pontos Fracos:**
- ⚠️ Não permite alterar email ou telefone
- ⚠️ Ausência de configurações de privacidade
- ⚠️ Falta opção de excluir conta
- ⚠️ Não mostra estatísticas do usuário (surpresas enviadas/recebidas)
- ⚠️ Sem integração com temas (dark mode)

**Ideias de Melhoria:**
- Permitir troca de email com reautenticação
- Adicionar configurações de privacidade (quem pode me encontrar)
- Fluxo de exclusão de conta com confirmação dupla
- Dashboard de estatísticas pessoais
- Seletor de tema (light/dark/auto)

**Novas Ideias Relacionadas:**
- **Bio/Descrição** customizável
- **Status do relacionamento** (namorando, casado, etc.)
- **Integração com redes sociais** (compartilhar marcos)
- **Exportar dados** (GDPR compliance)
- **Histórico de atividades** (log de login, ações)

**Sugestões Técnicas:**
- Usar Context API para tema global
- Implementar crop de imagem antes do upload
- Adicionar WebP conversion no backend (Cloud Functions)
- Implementar soft delete para contas (30 dias para recuperação)
- Adicionar campos `updatedAt` em todos os documentos

---

### 🔹 7. Filtros e Busca de Surpresas

**Descrição:**  
Filtros por período (hoje, semana, mês, ano, tudo) para visualizar histórico de surpresas.

**Pontos Fortes:**
- ✅ Filtros predefinidos fáceis de usar
- ✅ Query otimizada com Firestore

**Pontos Fracos:**
- ⚠️ Não há busca por texto livre
- ⚠️ Ausência de filtro por tipo de surpresa
- ⚠️ Não permite filtrar por remetente
- ⚠️ Falta calendário visual para selecionar data específica
- ⚠️ Sem tags ou categorias customizáveis

**Ideias de Melhoria:**
- Adicionar barra de busca com full-text search
- Checkboxes para filtrar por tipo (Mensagem, Foto, etc.)
- Dropdown para filtrar por vínculo específico
- Date picker para intervalo customizado
- Sistema de tags ao criar surpresa

**Novas Ideias Relacionadas:**
- **Busca avançada** com operadores (AND, OR, NOT)
- **Filtros salvos** (queries favoritas)
- **Ordenação customizável** (mais recentes, mais antigas, mais reações)
- **Modo timeline** (visualização cronológica)
- **Mapa de calor** mostrando dias com mais atividade

**Sugestões Técnicas:**
- Integrar Algolia ou Typesense para busca full-text
- Implementar índices compostos no Firestore
- Usar debounce na barra de busca
- Adicionar pré-fetch de resultados ao hover
- Implementar virtual scrolling para listas grandes

---

### 🔹 8. Modo Privado

**Descrição:**  
Oculta conteúdo sensível com desfoque até que usuário clique para revelar.

**Pontos Fortes:**
- ✅ Protege privacidade em locais públicos
- ✅ Efeito blur elegante
- ✅ Estado persiste durante sessão
- ✅ Ícone de cadeado claro

**Pontos Fracos:**
- ⚠️ Não há autenticação extra para revelar (PIN, biometria)
- ⚠️ Estado não persiste entre reloads
- ⚠️ Não há modo "sempre privado" por padrão
- ⚠️ Falta timer de auto-blur após X segundos

**Ideias de Melhoria:**
- Adicionar PIN ou biometria para revelar
- Salvar preferência em localStorage
- Opção de marcar surpresas como sempre privadas
- Auto-blur após 30s de inatividade

**Novas Ideias Relacionadas:**
- **Modo incógnito** completo (não salva histórico)
- **Autodestruição** de surpresas após visualização
- **Screenshot protection** (avisos, watermarks)
- **Vault seguro** com criptografia ponta-a-ponta

**Sugestões Técnicas:**
- Usar Web Crypto API para criptografia local
- Implementar screenshot detection (limitado)
- Adicionar canvas watermark dinâmica
- Usar IndexedDB para armazenar estado criptografado

---

### 🔹 9. "Momento do Dia"

**Descrição:**  
Exibe uma surpresa aleatória antiga para relembrar momentos especiais.

**Pontos Fortes:**
- ✅ Feature nostálgica e emocional
- ✅ Incentiva engajamento diário
- ✅ Query simples e eficiente

**Pontos Fracos:**
- ⚠️ Não é realmente aleatório (sempre a primeira)
- ⚠️ Não muda ao longo do dia
- ⚠️ Pode repetir surpresas recentes
- ⚠️ Não considera surpresas favoritas

**Ideias de Melhoria:**
- Implementar randomização real (shuffle client-side)
- Mudar a cada 12h ou ao abrir o app
- Priorizar surpresas antigas (>30 dias)
- Permitir favoritar surpresas

**Novas Ideias Relacionadas:**
- **"Esta semana há X anos"** (flashback semanal)
- **Surpresas populares** (mais reagidas)
- **Primeira surpresa do mês/ano**
- **Galeria de melhores momentos** anual

**Sugestões Técnicas:**
- Usar Cloud Function scheduled para pre-calcular "momento do dia"
- Implementar algoritmo de weighted random (prioriza antigas)
- Adicionar campo `lastShownAsMemory` para evitar repetição
- Cache no cliente com TTL de 12h

---

### 🔹 10. Sistema de Reações

**Descrição:**  
Permite reagir a surpresas com emojis (❤️ 😊 😍 😢 👏 🎉), com contadores visíveis.

**Pontos Fortes:**
- ✅ Interação rápida e expressiva
- ✅ Contadores em tempo real
- ✅ Múltiplas reações possíveis
- ✅ UI minimalista

**Pontos Fracos:**
- ⚠️ Não mostra quem reagiu (apenas contadores)
- ⚠️ Não há notificação quando alguém reage
- ⚠️ Limite fixo de 6 emojis
- ⚠️ Não permite remover reação facilmente

**Ideias de Melhoria:**
- Mostrar lista de quem reagiu ao clicar no contador
- Notificar autor quando alguém reage
- Emoji picker customizável
- Toggle para remover reação

**Novas Ideias Relacionadas:**
- **Reações GIF** (integração com GIPHY)
- **Reações de voz** (áudio curto de 3s)
- **Super reações** com animações especiais
- **Ranking de surpresas** mais reagidas

**Sugestões Técnicas:**
- Usar `arrayUnion`/`arrayRemove` para otimizar writes
- Implementar optimistic updates
- Adicionar haptic feedback (mobile)
- Animar contadores com Framer Motion

---

## 📈 RECOMENDAÇÕES GERAIS

### 🎨 UX/UI

1. **Design System Completo**
   - Criar biblioteca de componentes reutilizáveis (Storybook)
   - Definir tokens de design (cores, espaçamentos, tipografia)
   - Padronizar animações e transições

2. **Acessibilidade (A11Y)**
   - Adicionar navegação por teclado completa
   - Labels ARIA para screen readers
   - Contraste de cores WCAG AAA
   - Suporte a preferências de movimento reduzido

3. **Onboarding**
   - Tutorial interativo no primeiro acesso
   - Tooltips contextuais
   - Sugestões inteligentes de ações

4. **Feedback Visual Aprimorado**
   - Skeleton loaders em todos os carregamentos
   - Animações de sucesso/erro mais expressivas
   - Progress bars para uploads longos

### ⚡ Performance

1. **Otimização de Bundle**
   - Code splitting por rota
   - Tree shaking agressivo
   - Lazy load de componentes pesados
   - Dynamic imports para modais

2. **Imagens**
   - Implementar CDN (Cloudflare Images)
   - Formatos modernos (WebP, AVIF) com fallback
   - Lazy loading nativo (`loading="lazy"`)
   - Responsive images (srcset)

3. **Firestore**
   - Implementar paginação em todas as queries
   - Usar índices compostos eficientes
   - Cache local com TTL apropriado
   - Batch writes para operações múltiplas

4. **Service Worker**
   - Cache de assets estáticos
   - Offline-first para leitura
   - Background sync para writes offline

### 🏗️ Arquitetura

1. **Estado Global**
   - Migrar para Zustand ou Jotai (mais leve que Redux)
   - Separar estado UI de dados do servidor
   - Implementar React Query para cache de servidor

2. **TypeScript**
   - Migrar gradualmente para TypeScript
   - Tipos para Firestore documents
   - Props com interfaces bem definidas

3. **Testes**
   - Cobertura mínima de 70%
   - Unit tests para utils e services
   - Integration tests para hooks
   - E2E com Playwright para fluxos críticos

4. **Monorepo (Opcional)**
   - Separar frontend, functions, e packages compartilhados
   - Usar Turborepo ou Nx

### 🔒 Segurança

1. **Firebase Rules**
   - Restringir leitura pública de usuários
   - Adicionar rate limiting nativo
   - Validar estrutura de dados com `request.resource.data`

2. **Sanitização**
   - Sanitizar inputs HTML (DOMPurify)
   - Validar URLs de Spotify antes de embed
   - Escape XSS em conteúdo gerado por usuário

3. **HTTPS & CSP**
   - Enforçar HTTPS em todas as requests
   - Content Security Policy headers
   - HSTS (HTTP Strict Transport Security)

4. **Auditoria**
   - Logs de ações sensíveis (delete, unlink)
   - Monitoramento de anomalias (Firebase App Check)
   - Alertas de segurança automatizados

### 📊 Observabilidade

1. **Analytics**
   - Google Analytics 4 ou Mixpanel
   - Eventos customizados (criar surpresa, vincular)
   - Funnels de conversão

2. **Error Tracking**
   - Integrar Sentry ou Rollbar
   - Source maps para debugging
   - User context nos erros

3. **Performance Monitoring**
   - Firebase Performance Monitoring
   - Core Web Vitals tracking
   - Alertas de regressão

### 🌍 Internacionalização (i18n)

1. **Múltiplos Idiomas**
   - react-i18next para traduções
   - Suporte inicial: PT-BR, EN, ES
   - Detecção automática de idioma

2. **Localização**
   - Formatos de data/hora por região
   - Moedas (para futuras features premium)
   - RTL support (árabe, hebraico)

### 💰 Monetização (Futuro)

1. **Plano Premium**
   - Surpresas ilimitadas (freemium com limite)
   - Temas customizados
   - Backup em nuvem premium
   - Sem ads

2. **Marketplace**
   - Templates de cartas premium
   - Stickers e emojis pagos
   - Efeitos especiais de surpresas

3. **Parcerias**
   - Integração com lojas de presentes
   - Descontos em restaurantes/cinemas
   - Cashback em compras via links

### 🚀 Novas Features Estratégicas

1. **App Mobile Nativo**
   - React Native ou Flutter
   - Push notifications nativas
   - Widget de calendário
   - Compartilhamento via deeplink

2. **Gamificação**
   - Conquistas e badges
   - Streak de surpresas diárias
   - Desafios semanais ("envie 3 tipos diferentes")
   - Ranking mensal (privado ao casal)

3. **IA e ML**
   - Sugestões personalizadas de surpresas
   - Geração de mensagens com GPT
   - Reconhecimento de imagem (tags automáticas)
   - Análise de sentimento em mensagens

4. **Integração com Assistentes**
   - Google Assistant / Alexa
   - "Ok Google, enviar surpresa para [parceiro]"
   - Lembretes proativos via voz

5. **Social Features**
   - Compartilhar conquistas (anonimizadas)
   - Comunidade de casais (forum)
   - Blog de dicas de relacionamento
   - Stories temporárias (24h)

---

## 🎯 PRIORIZAÇÃO (Framework RICE)

**Alta Prioridade (Quick Wins):**
1. Push Notifications (Reach ↑ Impact ↑↑ Confidence ↑ Effort ↓)
2. Agendamento de Surpresas (Reach ↑ Impact ↑↑ Confidence ↑ Effort ↓)
3. Múltiplas Fotos por Surpresa (Reach ↑↑ Impact ↑ Confidence ↑↑ Effort ↓)
4. QR Code para Vincular (Reach ↑ Impact ↑ Confidence ↑↑ Effort ↓)
5. Dark Mode (Reach ↑↑ Impact ↑ Confidence ↑↑ Effort ↓)

**Média Prioridade:**
6. TypeScript Migration (Reach ↑ Impact ↑ Confidence ↑ Effort ↑↑)
7. App Mobile Nativo (Reach ↑↑↑ Impact ↑↑↑ Confidence ↑ Effort ↑↑↑)
8. Sistema de Tags/Busca (Reach ↑ Impact ↑ Confidence ↑ Effort ↑)
9. Gamificação (Reach ↑↑ Impact ↑↑ Confidence ↓ Effort ↑↑)
10. IA para Sugestões (Reach ↑↑ Impact ↑↑ Confidence ↓ Effort ↑↑↑)

**Baixa Prioridade (Long-term):**
11. Internacionalização (Reach ↑ Impact ↑ Confidence ↑ Effort ↑↑)
12. Monetização Premium (Reach ↓ Impact ↑↑↑ Confidence ↓ Effort ↑↑)
13. Marketplace (Reach ↓ Impact ↑↑ Confidence ↓ Effort ↑↑↑)

---

## 📝 CONCLUSÃO

O **noo.us** tem uma base sólida com funcionalidades essenciais bem implementadas. Os principais pontos de atenção são:

**Crítico:**
- Segurança das Firebase Rules (leitura pública de usuários)
- Ausência de push notifications (baixo engagement)
- Performance de imagens sem CDN

**Importante:**
- Falta de testes automatizados
- TypeScript para escalabilidade
- Observabilidade limitada

**Nice-to-have:**
- Features de gamificação
- IA para personalização
- App mobile nativo

A aplicação demonstra potencial para crescer em um produto robusto focado em relacionamentos, com oportunidades claras de monetização e diferenciação no mercado.

---

**Relatório gerado em:** 2025-10-28  
**Análise realizada por:** GitHub Copilot CLI
