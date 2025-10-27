# 🚀 Guia de Deploy - noo.us

**Status:** Pronto para deploy!  
**Data:** 27 de Outubro de 2025

---

## ✅ Pré-requisitos

- [x] Firebase CLI instalado ✅
- [x] Build testado e funcionando ✅
- [x] Cloud Functions criadas ✅
- [x] Firestore Rules atualizadas ✅
- [ ] Autenticação no Firebase (necessária)
- [ ] Projeto Firebase criado (necessária)

---

## 📋 Checklist Pré-Deploy

### 1. Build do Frontend
```bash
# Testar build local
npm run build

# Verificar se dist/ foi criado
ls -la dist/

# Preview da build
npm run preview
```

**Status:** ✅ Build testado (última execução: sucesso)

### 2. Cloud Functions
```bash
# Instalar dependências
cd functions
npm install

# Verificar package.json
cat package.json
```

**Dependências necessárias:**
- firebase-admin: ^12.0.0
- firebase-functions: ^5.0.0
- express: ^4.18.2
- cors: ^2.8.5

### 3. Firestore Rules & Indexes
```bash
# Verificar rules
cat firestore.rules

# Verificar indexes
cat firestore.indexes.json
```

**Status:** ✅ Rules atualizadas (rate limiting + segurança)

---

## 🔐 Passo 1: Autenticação

```bash
# Login no Firebase
firebase login

# Verificar autenticação
firebase projects:list
```

**Nota:** Isso abrirá o navegador para login com Google.

---

## 🎯 Passo 2: Inicializar Projeto (se necessário)

```bash
# Se ainda não inicializou
firebase init

# Selecionar:
# - Firestore (rules + indexes)
# - Functions (JavaScript/TypeScript)
# - Hosting

# Configurações recomendadas:
# - Firestore rules: firestore.rules
# - Firestore indexes: firestore.indexes.json
# - Functions language: JavaScript
# - Functions source: functions
# - Public directory: dist
# - Single-page app: Yes
# - GitHub deploys: No (por enquanto)
```

**Status:** Já configurado via firebase.json ✅

---

## 🚀 Passo 3: Deploy Completo

### Opção A: Deploy de Tudo (Recomendado para primeira vez)

```bash
# Deploy completo
firebase deploy
```

Isso irá fazer deploy de:
- ✅ Firestore Rules
- ✅ Firestore Indexes
- ✅ Cloud Functions (3 functions)
- ✅ Hosting (frontend build)

### Opção B: Deploy Separado (Mais controle)

```bash
# 1. Deploy apenas Firestore Rules
firebase deploy --only firestore:rules

# 2. Deploy apenas Indexes
firebase deploy --only firestore:indexes

# 3. Deploy apenas Functions
firebase deploy --only functions

# 4. Deploy apenas Hosting
firebase deploy --only hosting
```

---

## ⚙️ Passo 4: Criar Índices Compostos

Após o deploy, alguns índices podem precisar ser criados manualmente:

### Via Console Firebase:
1. Acesse: https://console.firebase.google.com/
2. Selecione seu projeto
3. Vá em: **Firestore Database** → **Indexes**
4. Clique em **Create Index**

### Índices Necessários:

#### Índice 1: Surprises (recipientId + createdAt)
- **Collection:** `surprises`
- **Fields:**
  - `recipientId` (Ascending)
  - `createdAt` (Descending)
- **Query scope:** Collection

#### Índice 2: Notifications (recipientId + createdAt)
- **Collection:** `notifications`
- **Fields:**
  - `recipientId` (Ascending)
  - `createdAt` (Descending)
- **Query scope:** Collection

#### Índice 3: Surprises (senderId + createdAt)
- **Collection:** `surprises`
- **Fields:**
  - `senderId` (Ascending)
  - `createdAt` (Descending)
- **Query scope:** Collection

**Atalho:** O Firebase geralmente sugere criar índices automaticamente quando detecta queries que precisam deles.

---

## 🧪 Passo 5: Validação Pós-Deploy

### 1. Verificar Hosting
```bash
# URL será algo como:
# https://seu-projeto.web.app
# ou
# https://seu-projeto.firebaseapp.com

# Testar URL
curl -I https://seu-projeto.web.app
```

### 2. Verificar Cloud Functions
```bash
# Listar functions deployadas
firebase functions:list

# Verificar logs
firebase functions:log
```

**Functions esperadas:**
- ✅ sendLinkInvite
- ✅ cleanupRateLimits
- ✅ validateRecaptcha

### 3. Verificar Firestore Rules
```bash
# No Console Firebase:
# Firestore Database → Rules

# Verificar se as regras foram aplicadas
# Deve mostrar a data/hora do último deploy
```

### 4. Testar Rate Limiting
```javascript
// No console do navegador da app deployada
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const sendInvite = httpsCallable(functions, 'sendLinkInvite');

// Tentar enviar 6 convites rapidamente
// O 6º deve ser bloqueado pelo rate limit
for (let i = 0; i < 6; i++) {
  await sendInvite({ 
    recipientEmail: 'test@example.com',
    relationship: 'partner' 
  });
}
```

---

## 🐛 Troubleshooting

### Erro: "Permission denied" nas Rules
**Solução:**
```bash
# Re-deploy das rules
firebase deploy --only firestore:rules

# Verificar no Console se foram aplicadas
```

### Erro: Functions não aparecem
**Solução:**
```bash
# Verificar se as dependências estão instaladas
cd functions
npm install

# Re-deploy
firebase deploy --only functions
```

### Erro: "Index required"
**Solução:**
- O Firebase mostrará um link direto para criar o índice
- Clique no link e aguarde a criação (~2-5 minutos)
- Ou crie manualmente via Console

### Build falha
**Solução:**
```bash
# Limpar cache
rm -rf node_modules dist .astro
npm install
npm run build
```

---

## 📊 Monitoramento Pós-Deploy

### Firebase Console - Áreas para Monitorar:

1. **Functions** → **Dashboard**
   - Execuções por minuto
   - Erros
   - Logs em tempo real

2. **Firestore** → **Usage**
   - Leituras/escritas
   - Storage usado
   - Verificar se paginação está funcionando

3. **Hosting** → **Usage**
   - Bandwidth
   - Requests
   - Deploy history

4. **Authentication** → **Users**
   - Novos usuários
   - Métodos de login
   - Taxa de erro

---

## 🔄 Deploy Contínuo (Futuro)

### GitHub Actions (Opcional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: w9jds/firebase-action@master
        with:
          args: deploy
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

## 📝 Comandos Úteis Pós-Deploy

```bash
# Ver logs das functions em tempo real
firebase functions:log --only sendLinkInvite

# Abrir hosting no navegador
firebase open hosting:site

# Abrir console do Firebase
firebase open

# Ver informações do projeto
firebase projects:list

# Rollback (se necessário)
firebase hosting:channel:deploy preview-rollback
```

---

## ✅ Checklist Final

Após o deploy, verificar:

- [ ] Frontend acessível via URL do Firebase Hosting
- [ ] Login com email funcionando
- [ ] Login com Google funcionando  
- [ ] Login com telefone funcionando (SMS)
- [ ] Criar surpresa funcionando
- [ ] Rate limiting bloqueando após 5 tentativas
- [ ] Notificações em tempo real funcionando
- [ ] Upload de fotos funcionando
- [ ] Lazy loading do ProfileSettings funcionando
- [ ] Nenhum erro 403 (permissions) no console
- [ ] Índices compostos criados

---

## 🎉 Sucesso!

Se todos os checks passaram:

**🚀 DEPLOY CONCLUÍDO COM SUCESSO!**

Seu app noo.us está agora em produção com:
- ✅ Segurança robusta (rate limiting + rules)
- ✅ Performance otimizada (paginação + lazy loading)
- ✅ Acessibilidade (WCAG 2.1 A)
- ✅ Cloud Functions ativas
- ✅ Monitoramento ativo

---

## 📞 Suporte

Se encontrar problemas:
1. Verificar Firebase Console → Logs
2. Verificar Network tab do navegador (erros 403/500)
3. Testar em modo anônimo (limpar cache)
4. Verificar se todas as env vars estão setadas

---

**Desenvolvido com 💖**  
**Deploy guide v1.0**
