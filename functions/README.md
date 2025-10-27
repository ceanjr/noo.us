# Rate Limiting com Firebase

Este diretório contém Cloud Functions para implementar rate limiting no app noo.us.

## Funcionalidades

### 1. `sendLinkInvite`
Cloud Function para enviar convites de vínculo com rate limiting.

**Limite:** 5 convites por hora por usuário

**Uso no frontend:**
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const sendLinkInvite = httpsCallable(functions, 'sendLinkInvite');

try {
  const result = await sendLinkInvite({
    recipientEmail: 'user@example.com',
    relationship: 'partner'
  });
  console.log(result.data.message);
} catch (error) {
  if (error.code === 'functions/resource-exhausted') {
    showToast('Muitas tentativas. Aguarde um pouco.', 'error');
  }
}
```

### 2. `cleanupRateLimits`
Função agendada que roda diariamente para limpar rate limits antigos.

**Schedule:** A cada 24 horas

### 3. `validateRecaptcha`
Placeholder para validação de reCAPTCHA v3 (implementação futura).

## Coleção `rateLimits` no Firestore

Estrutura do documento:
```javascript
{
  attempts: [timestamp1, timestamp2, ...],
  blockedUntil: timestamp | null,
  lastAttempt: timestamp
}
```

## Deploy

```bash
cd functions
npm install
firebase deploy --only functions
```

## Testes Locais

```bash
cd functions
npm run serve
```

## Rate Limiting por Ação

| Ação | Limite | Janela | Bloqueio |
|------|--------|--------|----------|
| link_invite | 5 tentativas | 1 hora | 15 minutos |
| login | 10 tentativas | 15 min | 30 minutos |
| sms_send | 3 tentativas | 1 hora | 1 hora |

## Próximas Implementações

- [ ] Rate limit para login (10 tentativas / 15 min)
- [ ] Rate limit para SMS (3 tentativas / hora)  
- [ ] Rate limit para criação de surpresas (30 / dia)
- [ ] Integração com reCAPTCHA v3
- [ ] Dashboard de monitoramento de rate limits
- [ ] Notificação de admin para atividades suspeitas
