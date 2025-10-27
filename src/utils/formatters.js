/**
 * Formata número de telefone brasileiro para exibição
 * @param {string} phone - Telefone (apenas dígitos)
 * @returns {string} Telefone formatado (XX) XXXXX-XXXX
 */
export const formatPhoneDisplay = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 7)
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

/**
 * Remove caracteres não numéricos de um telefone
 * @param {string} phone - Telefone com ou sem formatação
 * @returns {string} Apenas dígitos
 */
export const cleanPhone = (phone) => {
  return phone.replace(/\D/g, '');
};

/**
 * Adiciona código do país ao telefone brasileiro
 * @param {string} phone - Telefone sem código do país
 * @returns {string} +55XXXXXXXXXXX
 */
export const addBrazilCountryCode = (phone) => {
  const cleaned = cleanPhone(phone);
  return `+55${cleaned}`;
};