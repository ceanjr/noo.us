const PASSWORD_MIN_LENGTH = 6;

// DDDs válidos no Brasil
const VALID_DDDS = [
  '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '21', '22', '24', '27', '28',
  '31', '32', '33', '34', '35', '37', '38',
  '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '51', '53', '54', '55',
  '61', '62', '63', '64', '65', '66', '67', '68', '69',
  '71', '73', '74', '75', '77', '79',
  '81', '82', '83', '84', '85', '86', '87', '88', '89',
  '91', '92', '93', '94', '95', '96', '97', '98',
];

/**
 * Valida telefone brasileiro (celular)
 * @param {string} phone - Telefone (apenas dígitos ou formatado)
 * @returns {string|null} Mensagem de erro ou null se válido
 */
export const validateBrazilPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length !== 11) {
    return 'O telefone deve ter 11 dígitos (DDD + número)';
  }

  const ddd = cleaned.substring(0, 2);
  if (!VALID_DDDS.includes(ddd)) {
    return 'DDD inválido';
  }

  if (cleaned[2] !== '9') {
    return 'Número de celular deve começar com 9';
  }

  return null;
};

/**
 * Valida senha
 * @param {string} password - Senha
 * @param {string|null} confirmPassword - Confirmação de senha (opcional)
 * @returns {string|null} Mensagem de erro ou null se válida
 */
export const validatePassword = (password, confirmPassword = null) => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres`;
  }

  if (confirmPassword !== null && password !== confirmPassword) {
    return 'As senhas não coincidem';
  }

  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);

  if (!hasNumber || !hasLetter) {
    return 'Senha deve conter letras e números';
  }

  return null;
};

/**
 * Valida email
 * @param {string} email - Email
 * @returns {string|null} Mensagem de erro ou null se válido
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return 'Email é obrigatório';
  }

  if (!emailRegex.test(email)) {
    return 'Email inválido';
  }

  return null;
};

/**
 * Valida nome
 * @param {string} name - Nome
 * @returns {string|null} Mensagem de erro ou null se válido
 */
export const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return 'Nome deve ter pelo menos 2 caracteres';
  }

  return null;
};

/**
 * Valida data de início do relacionamento
 * @param {string} date - Data no formato ISO
 * @returns {string|null} Mensagem de erro ou null se válida
 */
export const validateRelationshipDate = (date) => {
  if (!date) {
    return 'Data é obrigatória';
  }

  const selectedDate = new Date(date);
  const today = new Date();

  if (selectedDate > today) {
    return 'A data não pode ser no futuro';
  }

  return null;
};