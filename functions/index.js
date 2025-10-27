const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Rate limiting helper usando Firestore
const checkRateLimit = async (userId, action, maxAttempts, windowMinutes) => {
  const now = Date.now();
  const windowStart = now - (windowMinutes * 60 * 1000);
  
  const rateLimitRef = admin.firestore()
    .collection('rateLimits')
    .doc(`${userId}_${action}`);
  
  const doc = await rateLimitRef.get();
  const data = doc.data() || { attempts: [], blockedUntil: null };
  
  // Verificar se está bloqueado
  if (data.blockedUntil && data.blockedUntil > now) {
    const remainingMinutes = Math.ceil((data.blockedUntil - now) / 60000);
    throw new functions.https.HttpsError(
      'resource-exhausted',
      `Muitas tentativas. Tente novamente em ${remainingMinutes} minutos.`
    );
  }
  
  // Filtrar tentativas dentro da janela de tempo
  const recentAttempts = data.attempts.filter(time => time > windowStart);
  
  // Verificar limite
  if (recentAttempts.length >= maxAttempts) {
    // Bloquear por 15 minutos
    await rateLimitRef.set({
      attempts: recentAttempts,
      blockedUntil: now + (15 * 60 * 1000),
      lastAttempt: now
    });
    
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Muitas tentativas. Tente novamente em 15 minutos.'
    );
  }
  
  // Registrar nova tentativa
  recentAttempts.push(now);
  await rateLimitRef.set({
    attempts: recentAttempts,
    blockedUntil: null,
    lastAttempt: now
  });
  
  return true;
};

/**
 * Cloud Function para enviar convite de vínculo
 * Protegida com rate limiting (5 convites por hora)
 */
exports.sendLinkInvite = functions.https.onCall(async (data, context) => {
  // Verificar autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Usuário não autenticado.'
    );
  }
  
  const userId = context.auth.uid;
  const { recipientEmail, recipientPhone, relationship } = data;
  
  // Rate limiting: 5 convites por hora
  await checkRateLimit(userId, 'link_invite', 5, 60);
  
  // Validar dados
  if (!recipientEmail && !recipientPhone) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email ou telefone é obrigatório.'
    );
  }
  
  // Validar relacionamento
  const validRelationships = ['partner', 'family', 'friend'];
  if (!validRelationships.includes(relationship)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Tipo de relacionamento inválido.'
    );
  }
  
  try {
    // Buscar dados do remetente
    const senderDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();
    
    if (!senderDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Usuário não encontrado.');
    }
    
    const senderData = senderDoc.data();
    
    // Buscar destinatário por email ou telefone
    let recipientQuery;
    if (recipientEmail) {
      recipientQuery = admin.firestore()
        .collection('users')
        .where('email', '==', recipientEmail)
        .limit(1);
    } else {
      recipientQuery = admin.firestore()
        .collection('users')
        .where('phoneNumber', '==', recipientPhone)
        .limit(1);
    }
    
    const recipientSnapshot = await recipientQuery.get();
    
    if (recipientSnapshot.empty) {
      throw new functions.https.HttpsError(
        'not-found',
        'Usuário não encontrado com esse email/telefone.'
      );
    }
    
    const recipientDoc = recipientSnapshot.docs[0];
    const recipientId = recipientDoc.id;
    
    // Verificar se já existe vínculo
    const existingLink = await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('links')
      .where('partnerId', '==', recipientId)
      .limit(1)
      .get();
    
    if (!existingLink.empty) {
      throw new functions.https.HttpsError(
        'already-exists',
        'Você já tem um vínculo com este usuário.'
      );
    }
    
    // Criar notificação de convite
    await admin.firestore().collection('notifications').add({
      type: 'link_invite',
      senderId: userId,
      senderName: senderData.name,
      senderPhotoURL: senderData.photoURL || '',
      recipientId: recipientId,
      relationship: relationship,
      status: 'pending',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return {
      success: true,
      message: 'Convite enviado com sucesso!',
    };
  } catch (error) {
    console.error('Erro ao enviar convite:', error);
    throw error;
  }
});

/**
 * Cloud Function para limpar rate limits antigos
 * Executada diariamente
 */
exports.cleanupRateLimits = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const rateLimitsRef = admin.firestore().collection('rateLimits');
    const oldLimits = await rateLimitsRef
      .where('lastAttempt', '<', oneDayAgo)
      .get();
    
    const batch = admin.firestore().batch();
    oldLimits.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    console.log(`Limpeza concluída: ${oldLimits.size} rate limits removidos.`);
    return null;
  });

/**
 * Cloud Function para validar reCAPTCHA (opcional)
 * Pode ser usada para validar formulários sensíveis
 */
exports.validateRecaptcha = functions.https.onCall(async (data, context) => {
  const { token, action } = data;
  
  if (!token) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Token reCAPTCHA é obrigatório.'
    );
  }
  
  // Aqui você implementaria a validação com Google reCAPTCHA v3
  // Por enquanto, apenas um placeholder
  
  return {
    success: true,
    score: 0.9, // Score de exemplo
  };
});
