# 🧩 Plano de Ação do Projeto - noo.us

**Data da Análise:** 27 de Janeiro de 2025  
**Projeto:** App de Surpresas para Casais  
**Stack:** Astro + React + Firebase + Tailwind CSS  
**Linhas de Código:** ~4.589 linhas (sem node_modules/dist)

---

## 🔍 Visão Geral

### ✅ Pontos Positivos Identificados

1. **Arquitetura Bem Estruturada**
   - Refatoração recente muito bem executada (Dashboard: 1.615 → 344 linhas, 79% de redução)
   - Separação clara de responsabilidades com hooks customizados
   - Componentização adequada com 11 componentes extraídos do Dashboard
   - Services bem organizados (auth, user, validation)

2. **Código Limpo e Moderno**
   - Uso adequado de React Hooks (useState, useEffect, custom hooks)
   - Componentes funcionais seguindo boas práticas
   - Firebase bem integrado com listeners em tempo real
   - JSDoc presente em componentes principais

3. **Segurança Implementada**
   - Firebase Rules bem definidas e granulares
   - Autenticação multi-método (Email, Phone, Google)
   - Validações no frontend e proteção via Rules
   - Hashing de senhas (SHA256 + salt)

4. **UX/UI Profissional**
   - Design System bem definido no Tailwind config
   - Paleta de cores consistente e harmônica
   - Feedback visual (toasts, modals, loading states)
   - Responsividade considerada

5. **Features Completas**
   - Sistema de vínculos múltiplos
   - Notificações em tempo real
   - Tipos variados de surpresas (mensagem, foto, música, encontro)
   - Sistema de reações
   - Modo privado para conteúdo sensível

### ⚠️ Pontos de Atenção e Melhorias Necessárias

1. **Performance e Otimização** (Prioridade: ALTA)
   - Falta de memoization (React.memo, useMemo, useCallback)
   - Re-renderizações desnecessárias em componentes grandes
   - Queries Firebase sem pagination adequada
   - Ausência de lazy loading de componentes
   - Imagens sem otimização

2. **Código Morto e Inconsistências** (Prioridade: MÉDIA)
   - Variáveis não utilizadas em vários componentes
   - Código comentado que pode ser removido
   - Espaços em branco excessivos (ex: Dashboard.jsx linhas 447-471)
   - Inconsistência entre `partnerId` e sistema de links múltiplos

3. **Segurança** (Prioridade: ALTA)
   - Salt de senha hardcoded e exposto no código
   - SHA256 sozinho não é adequado para senhas (falta bcrypt/Argon2)
   - Falta rate limiting nas operações sensíveis
   - Validação de imagens pode ser mais robusta

4. **Acessibilidade** (Prioridade: MÉDIA)
   - Falta de labels ARIA em vários botões
   - Contraste de cores não verificado (WCAG)
   - Navegação por teclado não testada
   - Falta de alt text descritivo em algumas imagens

5. **Testes e Qualidade** (Prioridade: ALTA)
   - Ausência total de testes unitários
   - Sem testes de integração
   - Sem CI/CD configurado
   - Falta de linting rules consistentes

6. **Documentação** (Prioridade: BAIXA)
   - Falta README.md com instruções
   - Variáveis de ambiente não documentadas
   - Falta de guia de contribuição

---

## 💅 Estilização e UI/UX

### ✅ Pontos Fortes

1. **Design System Coerente**
   - Paleta de cores bem definida (primary, secondary, accent, neutral)
   - Uso consistente de gradientes
   - Tipografia hierarquizada (Inter + Sora)
   - Espaçamentos harmônicos

2. **Componentes Visuais**
   - Cards com sombras e transições suaves
   - Modais com backdrop blur elegante
   - Animações CSS (`animate-fade-in`, `animate-scale-in`)
   - Sistema de toasts não intrusivo

3. **Responsividade Inicial**
   - Breakpoints mobile considerados
   - Bottom navigation para mobile
   - Inputs com `font-size: 16px` para evitar zoom no iOS

### 🔧 Oportunidades de Melhoria

1. **Consistência Visual**
   ```
   PROBLEMA: Uso misto de classes utilitárias
   - Alguns botões: "bg-primary-500 hover:bg-primary-600"
   - Outros: "bg-gradient-to-r from-pink-500 to-purple-500"
   
   SOLUÇÃO: Criar componentes de botão padrão
   - <Button variant="primary" />
   - <Button variant="gradient" />
   - <Button variant="outline" />
   ```

2. **Espaçamentos**
   ```
   PROBLEMA: Inconsistência em padding/margin
   - Alguns cards: p-4
   - Outros cards: p-6
   - Alguns: sm:p-6
   
   SOLUÇÃO: Padronizar no Tailwind config
   - spacing.card.sm: '1rem'
   - spacing.card.md: '1.5rem'
   - spacing.card.lg: '2rem'
   ```

3. **Estados de Loading**
   ```
   PROBLEMA: Loading genérico em vários lugares
   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
   
   SOLUÇÃO: Componente <LoadingSpinner /> reutilizável com variantes
   - size: sm | md | lg
   - color: primary | secondary | white
   ```

4. **Acessibilidade**
   - Adicionar `aria-label` em todos os botões de ícone
   - Implementar `focus-visible` para navegação por teclado
   - Garantir contraste mínimo de 4.5:1 para texto
   - Adicionar skip links para navegação

5. **Feedback Visual**
   - Animações de skeleton loading ao invés de spinners
   - Estados vazios mais informativos e ilustrados
   - Micro-interações em botões (scale, ripple)
   - Progress indicators para uploads

6. **Dark Mode**
   - Preparar variáveis CSS para suporte futuro
   - Usar classes do Tailwind (`dark:`)
   - Salvar preferência do usuário

### 📋 Checklist de Melhorias UI/UX

- [ ] Criar componente `<Button />` com variantes
- [ ] Padronizar espaçamentos nos cards
- [ ] Implementar `<LoadingSpinner />` e `<SkeletonLoader />`
- [ ] Adicionar aria-labels em todos os botões de ícone
- [ ] Verificar contraste de cores (ferramenta: WebAIM)
- [ ] Testar navegação completa por teclado
- [ ] Implementar estados vazios ilustrados
- [ ] Adicionar animações de micro-interação
- [ ] Preparar tema para dark mode
- [ ] Testar em diferentes tamanhos de tela (320px - 2560px)

---

## ⚙️ Código e Arquitetura

### ✅ Boas Práticas Seguidas

1. **Separação de Responsabilidades**
   - Services isolados (authService, userService, validationService)
   - Hooks customizados para lógica reutilizável
   - Componentes UI focados apenas em apresentação

2. **Firebase Bem Estruturado**
   - Listeners em tempo real bem implementados
   - Unsubscribe adequado nos useEffect
   - Queries otimizadas com where clauses

3. **Validações Robustas**
   - DDDs brasileiros validados
   - Email regex adequado
   - Telefone com 11 dígitos
   - Senha com requisitos mínimos

### 🔧 Trechos Problemáticos e Soluções

#### 1. **Re-renderizações Desnecessárias**

**PROBLEMA (Dashboard.jsx, linha 32-47):**
```javascript
const handleRevealSurprise = async (surpriseId) => {
  setRevealedSurprises((prev) => {
    const next = new Set(prev);
    next.add(surpriseId);
    return next;
  });
  // ... Firebase update
};
```

**SOLUÇÃO:**
```javascript
// Memoizar função com useCallback
const handleRevealSurprise = useCallback(async (surpriseId) => {
  setRevealedSurprises((prev) => {
    const next = new Set(prev);
    next.add(surpriseId);
    return next;
  });
  // ... Firebase update
}, []);
```

#### 2. **Código Duplicado em Modais**

**PROBLEMA (CreatePhotoModal, CreateMusicModal, CreateDateModal):**
```javascript
// Lógica de validação e submit repetida em 4 modais
const handleSubmit = (e) => {
  e.preventDefault();
  if (!title.trim()) {
    showToast('Título é obrigatório', 'error');
    return;
  }
  // ...
};
```

**SOLUÇÃO:**
```javascript
// Criar hook customizado
function useSurpriseForm(type) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const validate = useCallback(() => {
    if (!title.trim()) {
      showToast('Título é obrigatório', 'error');
      return false;
    }
    return true;
  }, [title]);
  
  return { title, setTitle, content, setContent, validate };
}
```

#### 3. **Queries Firebase Sem Paginação**

**PROBLEMA (useDashboardData.js, linha 43):**
```javascript
const q = query(
  collection(db, 'surprises'),
  where('recipientId', '==', userId)
);
```

**SOLUÇÃO:**
```javascript
// Adicionar paginação
const q = query(
  collection(db, 'surprises'),
  where('recipientId', '==', userId),
  orderBy('createdAt', 'desc'),
  limit(50)
);
```

#### 4. **Salt de Senha Exposto**

**PROBLEMA (crypto.js, linha 3):**
```javascript
const SALT_KEY = 'noo_us_secure_v1';
export const hashPassword = (password) => {
  return CryptoJS.SHA256(password + SALT_KEY).toString();
};
```

**SOLUÇÃO:**
```javascript
// 1. Remover hashing client-side (Firebase Auth já faz isso)
// 2. Para dados adicionais, usar bcrypt no backend
import bcrypt from 'bcryptjs';

export const hashPasswordServer = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};
```

#### 5. **Inconsistência de Estado (partnerId vs links)**

**PROBLEMA:**
- Profile tem `partnerId` (vínculo único)
- Sistema novo usa `links` subcollection (múltiplos)
- Código usa ambos, causando confusão

**SOLUÇÃO:**
```javascript
// Migração de dados:
// 1. Mover todos os partnerId para links subcollection
// 2. Remover campo partnerId do profile
// 3. Usar apenas activeLink (principal) em localStorage
```

### 📋 Checklist de Refatoração de Código

- [ ] Adicionar React.memo em componentes pesados
- [ ] Implementar useCallback para handlers
- [ ] Criar hook `useSurpriseForm` compartilhado
- [ ] Adicionar paginação em todas as queries Firebase
- [ ] Remover hashing client-side de senhas
- [ ] Migrar sistema de partnerId para links
- [ ] Remover código comentado e espaços em branco
- [ ] Extrair constantes para arquivo separado
- [ ] Padronizar nomenclatura de variáveis
- [ ] Adicionar PropTypes ou TypeScript

---

## 🚀 Performance

### 🐌 Gargalos Identificados

1. **Renderizações Excessivas**
   - Dashboard re-renderiza a cada mudança de aba
   - MomentCard re-renderiza ao hover (reactionBar)
   - Listas não virtualizadas (pode ser problema com 100+ itens)

2. **Queries Firebase Não Otimizadas**
   - Carregando todas as surpresas de uma vez
   - Duas queries separadas para dateConflicts (pode ser uma com 'in')
   - Links sendo buscados um por um no useLinks

3. **Imagens Sem Otimização**
   - Fotos de perfil sem compression
   - Sem responsive images (srcset)
   - Sem lazy loading

4. **Bundle Size**
   - Lucide-react importando todos os ícones
   - Firebase SDK completo (pode usar tree-shaking)
   - CryptoJS desnecessário (pode usar Web Crypto API)

### ⚡ Estratégias de Otimização

#### 1. **Memoization**

```javascript
// Dashboard.jsx
const MemoizedHomeTab = React.memo(HomeTab);
const MemoizedSurprisesTab = React.memo(SurprisesTab);
const MemoizedVinculosTab = React.memo(VinculosTab);

// MomentCard.jsx
export default React.memo(MomentCard, (prevProps, nextProps) => {
  return (
    prevProps.moment.id === nextProps.moment.id &&
    prevProps.isRevealed === nextProps.isRevealed &&
    prevProps.isPrivateMode === nextProps.isPrivateMode
  );
});
```

#### 2. **Lazy Loading de Componentes**

```javascript
// App.jsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));
const ProfileSettings = lazy(() => import('./ProfileSettings'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {user && profile ? (
        <Dashboard />
      ) : (
        <Auth />
      )}
    </Suspense>
  );
}
```

#### 3. **Virtualização de Listas**

```javascript
// Para listas grandes de surpresas
import { FixedSizeList } from 'react-window';

function SurprisesList({ surprises }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={surprises.length}
      itemSize={280}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <MomentCard moment={surprises[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

#### 4. **Otimização de Imagens**

```javascript
// storage.js
import imageCompression from 'browser-image-compression';

export const uploadProfilePhoto = async (file, userId) => {
  // Comprimir imagem
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 512,
    useWebWorker: true,
  };
  const compressedFile = await imageCompression(file, options);
  
  // Upload
  const storageRef = ref(storage, `profiles/${userId}/avatar.jpg`);
  await uploadBytes(storageRef, compressedFile);
  return await getDownloadURL(storageRef);
};
```

#### 5. **Tree Shaking de Ícones**

```javascript
// Ao invés de:
import { Home, Gift, Users } from 'lucide-react';

// Fazer:
import Home from 'lucide-react/dist/esm/icons/home';
import Gift from 'lucide-react/dist/esm/icons/gift';
import Users from 'lucide-react/dist/esm/icons/users';
```

#### 6. **Debouncing em Inputs**

```javascript
// usePartnerActions.js
import { debounce } from 'lodash-es';

const handleSearchPartner = useMemo(
  () => debounce(async (searchTerm) => {
    // buscar no Firebase
  }, 300),
  []
);
```

### 📋 Checklist de Performance

- [ ] Adicionar React.memo em componentes de lista
- [ ] Implementar lazy loading de rotas/componentes
- [ ] Virtualizar lista de surpresas (react-window)
- [ ] Comprimir imagens antes de upload
- [ ] Implementar srcset para imagens responsivas
- [ ] Otimizar imports de lucide-react
- [ ] Adicionar debounce em inputs de busca
- [ ] Implementar pagination infinita em listas
- [ ] Configurar code splitting no Vite
- [ ] Adicionar service worker para cache

---

## 🧱 Organização e Padrões

### ✅ Estrutura Atual (Boa)

```
src/
├── components/       # Componentes React
│   ├── dashboard/   # Componentes do Dashboard
│   └── auth/        # Componentes de Autenticação
├── hooks/           # Custom Hooks
├── services/        # Lógica de negócio
├── utils/           # Funções utilitárias
├── contexts/        # React Contexts
├── layouts/         # Layouts Astro
├── pages/           # Páginas Astro
└── styles/          # CSS Global
```

### 🔧 Melhorias Sugeridas

#### 1. **Separar Constantes**

```
src/
├── constants/
│   ├── colors.js       # Paleta de cores
│   ├── relationships.js # Tipos de relacionamento
│   ├── ddds.js         # DDDs válidos
│   └── index.js        # Exports
```

#### 2. **Adicionar Types (TypeScript ou JSDoc)**

```javascript
// types/surprise.js
/**
 * @typedef {Object} Surprise
 * @property {string} id
 * @property {'message'|'photo'|'music'|'date'} type
 * @property {string} title
 * @property {string} content
 * @property {string} senderId
 * @property {string} senderName
 * @property {string} recipientId
 * @property {string} createdAt
 * @property {boolean} viewed
 * @property {Reaction[]} reactions
 */
```

#### 3. **Criar Pasta de Testes**

```
src/
├── __tests__/
│   ├── hooks/
│   │   ├── useAuthState.test.js
│   │   ├── useDashboardData.test.js
│   │   └── useMoments.test.js
│   ├── services/
│   │   ├── authService.test.js
│   │   └── validationService.test.js
│   └── utils/
│       └── formatters.test.js
```

#### 4. **Convenções de Nomenclatura**

**ATUAL (inconsistente):**
```
- useAuthState.js (camelCase)
- AuthRefactored.jsx (PascalCase)
- authService.js (camelCase)
```

**SUGERIDO (padronizado):**
```
Arquivos:
- Componentes: PascalCase (Button.jsx)
- Hooks: camelCase (useAuth.js)
- Utils: camelCase (formatters.js)
- Types: PascalCase (Surprise.ts)

Variáveis:
- camelCase: userId, partnerName
- PascalCase: Componentes
- UPPER_CASE: Constantes
```

#### 5. **Git Commit Messages**

**SUGERIDO (Conventional Commits):**
```
feat: adicionar sistema de reações em surpresas
fix: corrigir bug de notificação duplicada
refactor: extrair hook useNotifications
perf: otimizar query de surpresas com pagination
docs: adicionar README com instruções
style: padronizar espaçamentos em cards
test: adicionar testes para authService
chore: atualizar dependências do Firebase
```

### 📋 Checklist de Organização

- [ ] Criar pasta `constants/` e mover valores hardcoded
- [ ] Adicionar JSDoc ou TypeScript em todos os arquivos
- [ ] Criar estrutura de testes
- [ ] Padronizar nomenclatura de arquivos
- [ ] Documentar convenções no README
- [ ] Configurar ESLint com regras de organização
- [ ] Criar .editorconfig para consistência de IDE
- [ ] Adicionar Prettier para formatação automática

---

## 🧩 Acessibilidade e Responsividade

### ⚠️ Problemas de Acessibilidade

1. **Navegação por Teclado**
   ```javascript
   // PROBLEMA: Botões sem foco visível
   <button onClick={handleClick}>
   
   // SOLUÇÃO:
   <button 
     onClick={handleClick}
     className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
   >
   ```

2. **Labels ARIA Ausentes**
   ```javascript
   // PROBLEMA:
   <button onClick={onClose}>
     <X className="w-6 h-6" />
   </button>
   
   // SOLUÇÃO:
   <button 
     onClick={onClose}
     aria-label="Fechar modal"
   >
     <X className="w-6 h-6" />
   </button>
   ```

3. **Contraste de Cores**
   ```
   VERIFICAR:
   - text-gray-500 em bg-white (ratio: ?)
   - text-white em bg-primary-400 (ratio: ?)
   
   FERRAMENTAS:
   - WebAIM Contrast Checker
   - axe DevTools
   ```

4. **Landmarks Semânticos**
   ```javascript
   // PROBLEMA: Uso genérico de div
   <div className="header">
   
   // SOLUÇÃO: Usar HTML5 semântico
   <header>
   <nav>
   <main>
   <aside>
   <footer>
   ```

### 📱 Responsividade

#### Pontos Fortes:
- ✅ Bottom navigation adaptativa (mobile/desktop)
- ✅ Breakpoints considerados (sm:, md:, lg:)
- ✅ Font-size 16px para evitar zoom no iOS

#### Melhorias Necessárias:

1. **Testes em Múltiplos Dispositivos**
   ```
   Testar em:
   - Mobile: 320px (iPhone SE), 375px, 414px
   - Tablet: 768px, 1024px
   - Desktop: 1280px, 1920px, 2560px
   ```

2. **Orientação Landscape em Mobile**
   ```javascript
   // Adicionar estilos para landscape
   @media (max-height: 600px) and (orientation: landscape) {
     .bottom-navigation {
       display: none; // ou adaptar
     }
   }
   ```

3. **Touch Targets**
   ```
   PROBLEMA: Alguns botões < 44x44px
   SOLUÇÃO: Garantir min-width e min-height de 44px
   ```

### 📋 Checklist de Acessibilidade

- [ ] Adicionar aria-label em todos os botões de ícone
- [ ] Implementar focus-visible em elementos interativos
- [ ] Testar navegação completa por Tab
- [ ] Verificar contraste de todas as cores (WCAG AA)
- [ ] Adicionar alt text descritivo em imagens
- [ ] Usar landmarks semânticos (header, nav, main)
- [ ] Testar com leitor de tela (NVDA/JAWS)
- [ ] Garantir touch targets de 44x44px
- [ ] Testar em modo de alto contraste
- [ ] Adicionar skip links para navegação

### 📋 Checklist de Responsividade

- [ ] Testar em iPhone SE (320px)
- [ ] Testar em tablets (768px, 1024px)
- [ ] Testar em desktops grandes (2560px)
- [ ] Testar orientação landscape em mobile
- [ ] Verificar font-size em todos os breakpoints
- [ ] Testar upload de imagem em mobile
- [ ] Verificar modais em telas pequenas
- [ ] Testar zoom de 200% (WCAG)

---

## 🔒 Segurança e Backend

### ⚠️ Vulnerabilidades Críticas

#### 1. **Senha Hash Inadequado (CRÍTICO)**

**PROBLEMA:**
```javascript
// crypto.js
const SALT_KEY = 'noo_us_secure_v1'; // Salt hardcoded
const hashPassword = (password) => {
  return CryptoJS.SHA256(password + SALT_KEY).toString();
};
```

**RISCOS:**
- SHA256 é muito rápido → vulnerável a brute force
- Salt único para todos → rainbow tables funcionam
- Client-side hashing expõe lógica

**SOLUÇÃO:**
```javascript
// REMOVER hash client-side completamente
// Firebase Auth já faz hashing seguro (bcrypt/scrypt)

// Se precisar armazenar senha adicional:
// 1. Usar Firebase Functions
// 2. bcrypt ou Argon2 server-side
// 3. Salt único por usuário
```

#### 2. **Firebase Rules - Leitura Pública de Usuários**

**PROBLEMA:**
```javascript
// firestore.rules linha 20
allow read: if true; // PERIGOSO!
```

**RISCOS:**
- Qualquer pessoa pode listar todos os usuários
- Exposição de dados pessoais (email, telefone)

**SOLUÇÃO:**
```javascript
// Permitir apenas busca específica com validação
allow get: if request.auth != null;
allow list: if false; // Nunca permitir listar todos

// Busca por email/telefone via Firebase Function
// com rate limiting e validação
```

#### 3. **Rate Limiting Ausente**

**PROBLEMA:**
- Não há limitação de tentativas de login
- Envio ilimitado de SMS de verificação
- Criação ilimitada de convites

**SOLUÇÃO:**
```javascript
// Implementar Firebase App Check
// + Cloud Functions com rate limiting

import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5 // 5 tentativas
});

app.post('/api/login', limiter, async (req, res) => {
  // login logic
});
```

#### 4. **Validação de Upload de Imagens**

**PROBLEMA:**
```javascript
// storage.js - validação apenas no frontend
export const validateImageFile = (file, maxSizeMB = 5) => {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Arquivo deve ser uma imagem' };
  }
  // ...
};
```

**RISCOS:**
- Validação client-side pode ser bypassada
- Sem validação de conteúdo (magic bytes)
- Possível upload de malware

**SOLUÇÃO:**
```javascript
// Firebase Storage Rules
match /profiles/{userId}/{fileName} {
  allow write: if request.auth != null
             && request.auth.uid == userId
             && request.resource.size < 5 * 1024 * 1024
             && request.resource.contentType.matches('image/.*');
}

// + Validação server-side com Sharp
const sharp = require('sharp');
const validateImage = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    return metadata.format in ['jpeg', 'png', 'webp'];
  } catch {
    return false;
  }
};
```

### 🔐 Boas Práticas Implementadas

1. ✅ Firebase Auth com múltiplos métodos
2. ✅ HTTPS obrigatório (Firebase Hosting)
3. ✅ Rules granulares por coleção
4. ✅ Validação de dados no frontend
5. ✅ reCAPTCHA em phone auth

### 📋 Checklist de Segurança

- [ ] **CRÍTICO:** Remover hashing client-side de senhas
- [ ] **CRÍTICO:** Restringir leitura pública de usuários
- [ ] **ALTA:** Implementar rate limiting
- [ ] **ALTA:** Adicionar validação server-side de imagens
- [ ] **ALTA:** Implementar Firebase App Check
- [ ] **MÉDIA:** Adicionar CSP headers
- [ ] **MÉDIA:** Implementar 2FA (autenticação em dois fatores)
- [ ] **MÉDIA:** Logs de auditoria (quem fez o quê)
- [ ] **BAIXA:** Sanitização de inputs (XSS)
- [ ] **BAIXA:** Criptografia de dados sensíveis no Firestore

### 🛡️ Melhorias de Backend

#### 1. **Cloud Functions para Operações Sensíveis**

```javascript
// functions/src/index.js
exports.sendLinkInvite = functions.https.onCall(async (data, context) => {
  // Validar autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated');
  }
  
  // Rate limiting
  const userId = context.auth.uid;
  const rateLimitKey = `invite:${userId}`;
  const count = await incrementRateLimit(rateLimitKey);
  if (count > 5) {
    throw new functions.https.HttpsError('resource-exhausted');
  }
  
  // Validar dados
  const { recipientEmail } = data;
  if (!isValidEmail(recipientEmail)) {
    throw new functions.https.HttpsError('invalid-argument');
  }
  
  // Executar ação
  // ...
});
```

#### 2. **Backup Automatizado**

```javascript
// functions/src/backup.js
exports.scheduledFirestoreBackup = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const client = new firestore.v1.FirestoreAdminClient();
    const bucket = 'gs://noo-us-backups';
    await client.exportDocuments({
      name: client.databasePath(projectId, '(default)'),
      outputUriPrefix: bucket,
      collectionIds: []
    });
  });
```

---

## 🧭 Próximos Passos

### 🔴 Prioridade ALTA (1-2 semanas)

#### Segurança Crítica
1. **[ ] Remover Hashing Client-Side de Senhas**
   - Tempo: 2 horas
   - Impacto: Crítico
   - Ação: Deletar crypto.js, confiar no Firebase Auth

2. **[ ] Restringir Leitura Pública de Usuários**
   - Tempo: 4 horas
   - Impacto: Crítico
   - Ação: Atualizar Firebase Rules, criar Cloud Function para busca

3. **[ ] Implementar Rate Limiting**
   - Tempo: 1 dia
   - Impacto: Alto
   - Ação: Firebase App Check + Functions com limiter

#### Performance
4. **[ ] Adicionar Paginação em Queries**
   - Tempo: 1 dia
   - Impacto: Alto
   - Ação: Implementar limit() e startAfter() em todas as queries

5. **[ ] Memoizar Componentes Pesados**
   - Tempo: 1 dia
   - Impacto: Médio
   - Ação: React.memo em MomentCard, tabs, modais

#### Testes
6. **[ ] Configurar Jest + Testing Library**
   - Tempo: 1 dia
   - Impacto: Alto
   - Ação: Setup, criar 10 testes básicos para hooks

### 🟡 Prioridade MÉDIA (2-4 semanas)

#### Código
7. **[ ] Migrar Sistema partnerId → Links**
   - Tempo: 2 dias
   - Impacto: Médio
   - Ação: Script de migração de dados, remover partnerId

8. **[ ] Criar Hook useSurpriseForm Compartilhado**
   - Tempo: 4 horas
   - Impacto: Baixo
   - Ação: Extrair lógica comum dos 4 modais de criação

9. **[ ] Adicionar Lazy Loading de Componentes**
   - Tempo: 4 horas
   - Impacto: Médio
   - Ação: React.lazy() em Dashboard, ProfileSettings

#### Acessibilidade
10. **[ ] Adicionar ARIA Labels em Botões**
    - Tempo: 4 horas
    - Impacto: Médio
    - Ação: Audit com axe DevTools, corrigir todos

11. **[ ] Implementar Focus Visible**
    - Tempo: 2 horas
    - Impacto: Médio
    - Ação: Adicionar classes focus-visible em botões/links

#### UI/UX
12. **[ ] Criar Componente Button Padrão**
    - Tempo: 1 dia
    - Impacto: Baixo
    - Ação: Button.jsx com variantes (primary, outline, ghost)

13. **[ ] Implementar Skeleton Loading**
    - Tempo: 4 horas
    - Impacto: Baixo
    - Ação: SkeletonCard.jsx para listas de surpresas

### 🟢 Prioridade BAIXA (1-2 meses)

#### Documentação
14. **[ ] Criar README Completo**
    - Tempo: 4 horas
    - Impacto: Baixo
    - Ação: Instruções de setup, variáveis de ambiente, scripts

15. **[ ] Adicionar JSDoc em Todos os Arquivos**
    - Tempo: 2 dias
    - Impacto: Baixo
    - Ação: Documentar props, parâmetros, retornos

#### Qualidade
16. **[ ] Configurar ESLint + Prettier**
    - Tempo: 2 horas
    - Impacto: Baixo
    - Ação: .eslintrc, .prettierrc, scripts no package.json

17. **[ ] Migrar para TypeScript**
    - Tempo: 1-2 semanas
    - Impacto: Médio
    - Ação: Gradual, começando por utils e services

#### Features
18. **[ ] Implementar Dark Mode**
    - Tempo: 2 dias
    - Impacto: Baixo
    - Ação: Tailwind dark:, Context para tema

19. **[ ] PWA com Service Worker**
    - Tempo: 2 dias
    - Impacto: Médio
    - Ação: Workbox, manifest.json, offline support

---

## 📊 Resumo Executivo

### Métricas do Projeto

| Métrica | Valor Atual | Alvo | Status |
|---------|-------------|------|--------|
| **Linhas de Código** | 4.589 | < 5.000 | ✅ |
| **Componentes** | 47 | < 60 | ✅ |
| **Hooks Customizados** | 7 | 8-12 | ✅ |
| **Cobertura de Testes** | 0% | > 70% | ❌ |
| **Performance (Lighthouse)** | ? | > 90 | ⚠️ |
| **Acessibilidade (Lighthouse)** | ? | > 90 | ⚠️ |
| **Bundle Size** | ? | < 200KB | ⚠️ |

### Tempo Estimado Total

| Prioridade | Tarefas | Tempo Total |
|------------|---------|-------------|
| **ALTA** | 6 tarefas | ~5 dias |
| **MÉDIA** | 7 tarefas | ~7 dias |
| **BAIXA** | 6 tarefas | ~12 dias |
| **TOTAL** | **19 tarefas** | **~24 dias** |

### ROI das Melhorias

| Melhoria | Esforço | Impacto | ROI |
|----------|---------|---------|-----|
| Remover hash client-side | Baixo | Crítico | ⭐⭐⭐⭐⭐ |
| Rate limiting | Médio | Alto | ⭐⭐⭐⭐ |
| Pagination queries | Baixo | Alto | ⭐⭐⭐⭐⭐ |
| React.memo | Baixo | Médio | ⭐⭐⭐⭐ |
| Testes unitários | Alto | Alto | ⭐⭐⭐ |
| TypeScript migration | Alto | Médio | ⭐⭐ |

---

## 🎯 Objetivos por Sprint

### Sprint 1 (Semana 1-2): Segurança e Performance Crítica
- [ ] Corrigir vulnerabilidades de senha
- [ ] Implementar rate limiting
- [ ] Adicionar paginação em queries
- [ ] Configurar Firebase App Check

**Meta:** Eliminar riscos críticos de segurança

### Sprint 2 (Semana 3-4): Qualidade de Código
- [ ] Setup de testes (Jest + RTL)
- [ ] Escrever 20 testes unitários
- [ ] Memoizar componentes
- [ ] Adicionar lazy loading

**Meta:** Cobertura de testes > 30%

### Sprint 3 (Semana 5-6): UX e Acessibilidade
- [ ] Componente Button padrão
- [ ] ARIA labels completo
- [ ] Focus visible implementado
- [ ] Skeleton loading

**Meta:** Lighthouse Accessibility > 85

### Sprint 4 (Semana 7-8): Documentação e DevEx
- [ ] README completo
- [ ] JSDoc em arquivos principais
- [ ] ESLint + Prettier
- [ ] CI/CD básico

**Meta:** Onboarding de novo dev em < 2 horas

---

## 📞 Suporte e Recursos

### Ferramentas Recomendadas

**Análise de Código:**
- ESLint
- Prettier
- SonarQube (qualidade)
- Bundle Analyzer

**Performance:**
- Lighthouse CI
- Web Vitals
- React DevTools Profiler
- Firebase Performance Monitoring

**Acessibilidade:**
- axe DevTools
- WAVE
- Lighthouse Accessibility Audit
- NVDA / JAWS (screen readers)

**Testes:**
- Jest
- React Testing Library
- Cypress (E2E)
- Firebase Emulator Suite

**Segurança:**
- npm audit
- Snyk
- Firebase Security Rules Unit Tests
- OWASP ZAP

### Links Úteis

- [Firebase Best Practices](https://firebase.google.com/docs/rules/best-practices)
- [React Performance Optimization](https://react.dev/learn/render-and-commit#optimizing-performance)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web.dev Performance](https://web.dev/performance/)

---

**Documento gerado em:** 27 de Janeiro de 2025  
**Próxima revisão:** Após conclusão do Sprint 1  
**Responsável:** Equipe de Desenvolvimento noo.us
