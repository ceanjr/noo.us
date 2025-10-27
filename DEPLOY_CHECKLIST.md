# ✅ Deploy Checklist - noo.us

## Pré-Deploy

### Ambiente Local
- [ ] `npm run build` executa sem erros
- [ ] `npm run preview` mostra app funcionando
- [ ] Todas as dependências instaladas
- [ ] `.env` com variáveis Firebase configuradas

### Cloud Functions
- [ ] `cd functions && npm install` sem erros
- [ ] Verificar `functions/package.json` tem todas as deps
- [ ] Testar funções localmente (opcional): `npm run serve`

### Firestore
- [ ] `firestore.rules` revisadas e corretas
- [ ] `firestore.indexes.json` criado
- [ ] Entender quais coleções existem

---

## Deploy

### 1. Autenticação
```bash
firebase login
```
- [ ] Login realizado com sucesso
- [ ] `firebase projects:list` mostra projeto correto

### 2. Build
```bash
npm run build
```
- [ ] Build concluído sem erros
- [ ] Pasta `dist/` criada
- [ ] Verificar tamanho do bundle

### 3. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```
- [ ] Deploy concluído
- [ ] Verificar no Console Firebase

### 4. Deploy Cloud Functions
```bash
firebase deploy --only functions
```
- [ ] Deploy concluído
- [ ] 3 functions deployadas:
  - [ ] sendLinkInvite
  - [ ] cleanupRateLimits
  - [ ] validateRecaptcha

### 5. Deploy Hosting
```bash
firebase deploy --only hosting
```
- [ ] Deploy concluído
- [ ] URL gerada e acessível

---

## Pós-Deploy

### Validações Imediatas
- [ ] Acessar URL do hosting
- [ ] Login com email funciona
- [ ] Login com Google funciona
- [ ] Criar conta nova funciona
- [ ] Nenhum erro 403 no console

### Criar Índices Compostos
- [ ] Acesar Console Firebase → Firestore → Indexes
- [ ] Criar índice: surprises (recipientId ASC, createdAt DESC)
- [ ] Criar índice: notifications (recipientId ASC, createdAt DESC)
- [ ] Aguardar criação (~2-5 min cada)

### Testes Funcionais
- [ ] Criar surpresa (cada tipo):
  - [ ] Mensagem
  - [ ] Foto
  - [ ] Música
  - [ ] Encontro
- [ ] Enviar convite de vínculo
- [ ] Receber notificação em tempo real
- [ ] Rate limiting funciona (tentar 6 convites)
- [ ] Upload de foto de perfil
- [ ] ProfileSettings abre (lazy loading)

### Monitoramento
- [ ] Verificar Functions → Logs (sem erros)
- [ ] Verificar Firestore → Usage (queries razoáveis)
- [ ] Verificar Hosting → Bandwidth
- [ ] Verificar Authentication → Users

---

## Rollback (Se Necessário)

### Se algo der errado:
```bash
# Voltar hosting para versão anterior
firebase hosting:rollback

# Ver histórico de deploys
firebase deploy:history
```

---

## ✅ Deploy Completo!

Data: _______________  
Hora: _______________  
URL Produção: _______________  

**Assinatura:** _______________
