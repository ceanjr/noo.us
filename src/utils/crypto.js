import CryptoJS from 'crypto-js';

const SALT_KEY = 'noo_us_secure_v1';

/**
 * Hash de senha com SHA256 e salt
 * @param {string} password - Senha em texto plano
 * @returns {string} Hash SHA256 da senha
 */
export const hashPassword = (password) => {
  return CryptoJS.SHA256(password + SALT_KEY).toString();
};

/**
 * Verifica se a senha corresponde ao hash
 * @param {string} password - Senha em texto plano
 * @param {string} hash - Hash armazenado
 * @returns {boolean} True se a senha está correta
 */
export const verifyPassword = (password, hash) => {
  return hashPassword(password) === hash;
};
