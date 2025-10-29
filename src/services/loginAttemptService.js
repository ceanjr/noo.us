/**
 * Service para gerenciar tentativas de login e bloqueios temporários
 */

const STORAGE_KEY = 'login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos em ms

/**
 * Obter tentativas de login do localStorage
 * @param {string} email - Email do usuário
 * @returns {Object} Dados de tentativas { count, lockedUntil }
 */
const getAttempts = (email) => {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY}_${email}`);
    if (!data) return { count: 0, lockedUntil: null };
    return JSON.parse(data);
  } catch (e) {
    return { count: 0, lockedUntil: null };
  }
};

/**
 * Salvar tentativas de login
 * @param {string} email - Email do usuário
 * @param {Object} data - Dados { count, lockedUntil }
 */
const saveAttempts = (email, data) => {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${email}`, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar tentativas de login:', e);
  }
};

/**
 * Verificar se usuário está bloqueado
 * @param {string} email - Email do usuário
 * @returns {Object} { isLocked: boolean, remainingTime: number }
 */
export const checkLoginLock = (email) => {
  const attempts = getAttempts(email);
  
  if (!attempts.lockedUntil) {
    return { isLocked: false, remainingTime: 0 };
  }

  const now = Date.now();
  const remainingTime = attempts.lockedUntil - now;

  if (remainingTime <= 0) {
    // Bloqueio expirou, limpar
    saveAttempts(email, { count: 0, lockedUntil: null });
    return { isLocked: false, remainingTime: 0 };
  }

  return { isLocked: true, remainingTime };
};

/**
 * Registrar tentativa de login falhada
 * @param {string} email - Email do usuário
 * @returns {Object} { isLocked: boolean, attemptsRemaining: number, lockedUntil: number|null }
 */
export const recordFailedAttempt = (email) => {
  const attempts = getAttempts(email);
  const newCount = attempts.count + 1;

  if (newCount >= MAX_ATTEMPTS) {
    const lockedUntil = Date.now() + LOCKOUT_DURATION;
    saveAttempts(email, { count: newCount, lockedUntil });
    return {
      isLocked: true,
      attemptsRemaining: 0,
      lockedUntil,
    };
  }

  saveAttempts(email, { count: newCount, lockedUntil: null });
  return {
    isLocked: false,
    attemptsRemaining: MAX_ATTEMPTS - newCount,
    lockedUntil: null,
  };
};

/**
 * Resetar tentativas após login bem-sucedido
 * @param {string} email - Email do usuário
 */
export const resetLoginAttempts = (email) => {
  saveAttempts(email, { count: 0, lockedUntil: null });
};

/**
 * Formatar tempo restante de bloqueio
 * @param {number} ms - Milissegundos
 * @returns {string} Tempo formatado
 */
export const formatLockoutTime = (ms) => {
  const minutes = Math.ceil(ms / 60000);
  if (minutes === 1) return '1 minuto';
  return `${minutes} minutos`;
};
