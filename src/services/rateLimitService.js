import { getFunctions, httpsCallable } from 'firebase/functions';
import { showToast } from '../components/Toast';

const functions = getFunctions();

/**
 * Envia convite de vínculo via Cloud Function
 * Protegido com rate limiting (5 convites/hora)
 * 
 * @param {Object} data - Dados do convite
 * @param {string} data.recipientEmail - Email do destinatário (ou)
 * @param {string} data.recipientPhone - Telefone do destinatário
 * @param {string} data.relationship - Tipo: 'partner' | 'family' | 'friend'
 * @returns {Promise<Object>} Resultado da operação
 */
export const sendLinkInviteSecure = async (data) => {
  try {
    const sendLinkInvite = httpsCallable(functions, 'sendLinkInvite');
    const result = await sendLinkInvite(data);
    return result.data;
  } catch (error) {
    console.error('Erro ao enviar convite:', error);
    
    // Tratamento de erros específicos
    if (error.code === 'functions/resource-exhausted') {
      showToast('Muitas tentativas. Aguarde alguns minutos.', 'error');
    } else if (error.code === 'functions/not-found') {
      showToast('Usuário não encontrado com esse email/telefone.', 'error');
    } else if (error.code === 'functions/already-exists') {
      showToast('Você já tem um vínculo com este usuário.', 'warning');
    } else if (error.code === 'functions/unauthenticated') {
      showToast('Você precisa estar logado.', 'error');
    } else {
      showToast(error.message || 'Erro ao enviar convite.', 'error');
    }
    
    throw error;
  }
};

/**
 * Valida token reCAPTCHA
 * 
 * @param {string} token - Token do reCAPTCHA
 * @param {string} action - Ação sendo executada
 * @returns {Promise<Object>} Resultado da validação
 */
export const validateRecaptcha = async (token, action) => {
  try {
    const validate = httpsCallable(functions, 'validateRecaptcha');
    const result = await validate({ token, action });
    return result.data;
  } catch (error) {
    console.error('Erro ao validar reCAPTCHA:', error);
    throw error;
  }
};

/**
 * Rate limiting client-side (adicional à proteção server-side)
 * Armazena timestamps de ações no localStorage
 * 
 * @param {string} action - Nome da ação
 * @param {number} maxAttempts - Máximo de tentativas
 * @param {number} windowMinutes - Janela de tempo em minutos
 * @returns {boolean} True se permitido, false se bloqueado
 */
export const checkClientRateLimit = (action, maxAttempts, windowMinutes) => {
  try {
    const key = `rateLimit_${action}`;
    const stored = localStorage.getItem(key);
    const attempts = stored ? JSON.parse(stored) : [];
    
    const now = Date.now();
    const windowStart = now - (windowMinutes * 60 * 1000);
    
    // Filtrar tentativas antigas
    const recentAttempts = attempts.filter(time => time > windowStart);
    
    if (recentAttempts.length >= maxAttempts) {
      const oldestAttempt = Math.min(...recentAttempts);
      const remainingMs = (oldestAttempt + (windowMinutes * 60 * 1000)) - now;
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      
      showToast(
        `Muitas tentativas. Aguarde ${remainingMinutes} minuto(s).`,
        'warning'
      );
      return false;
    }
    
    // Adicionar nova tentativa
    recentAttempts.push(now);
    localStorage.setItem(key, JSON.stringify(recentAttempts));
    
    return true;
  } catch (error) {
    // Se localStorage falhar, permitir (proteção server-side ainda funciona)
    console.warn('Erro no rate limit client-side:', error);
    return true;
  }
};
