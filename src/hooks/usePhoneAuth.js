import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  setupRecaptcha,
  sendPhoneVerificationCode,
  verifyPhoneCode,
} from '../services/authService';

/**
 * Custom hook para autenticação por telefone
 * @returns {Object} Funções e estado para phone auth
 */
export function usePhoneAuth() {
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationStep, setShowVerificationStep] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);

  // Limpa o estado do hook quando o usuário desloga
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        if (
          window.recaptchaVerifier &&
          typeof window.recaptchaVerifier.clear === 'function'
        ) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
        setRecaptchaVerifier(null);
        setConfirmationResult(null);
        setShowVerificationStep(false);
        setVerificationCode('');
      }
    });

    return () => unsubscribe();
  }, []);

  // Setup reCAPTCHA quando step/authMethod mudar
  useEffect(() => {
    return () => {
      // Cleanup ao desmontar
      if (recaptchaVerifier && typeof recaptchaVerifier.clear === 'function') {
        try {
          recaptchaVerifier.clear();
        } catch (e) {
          // Ignorar erros de cleanup
        }
      }
    };
  }, [recaptchaVerifier]);

  /**
   * Envia código de verificação por SMS
   * @param {string} phoneNumber - Telefone (apenas dígitos)
   * @returns {Promise<boolean>} True se enviado com sucesso
   */
  const sendVerification = async (phoneNumber) => {
    setIsSendingSMS(true);
    try {
      // Garante que um novo verifier seja criado se necessário
      const verifier = setupRecaptcha();
      setRecaptchaVerifier(verifier);

      const result = await sendPhoneVerificationCode(phoneNumber, verifier);
      setConfirmationResult(result);
      setShowVerificationStep(true);
      return true;
    } catch (error) {
      console.error('Erro ao enviar verificação:', error);
      return false;
    } finally {
      setIsSendingSMS(false);
    }
  };

  /**
   * Verifica código SMS
   * @returns {Promise<Object|null>} Firebase user ou null
   */
  const verifyCode = async () => {
    try {
      const user = await verifyPhoneCode(confirmationResult, verificationCode);

      // Reset estado
      setShowVerificationStep(false);
      setVerificationCode('');
      setConfirmationResult(null);

      return user;
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      return null;
    }
  };

  /**
   * Cancela verificação
   */
  const cancelVerification = () => {
    setShowVerificationStep(false);
    setVerificationCode('');
    setConfirmationResult(null);
  };

  /**
   * Reseta estado do reCAPTCHA
   */
  const resetRecaptcha = () => {
    const verifier = setupRecaptcha(recaptchaVerifier);
    setRecaptchaVerifier(verifier);
  };

  return {
    // Estado
    showVerificationStep,
    verificationCode,
    isSendingSMS,

    // Setters
    setVerificationCode,

    // Funções
    sendVerification,
    verifyCode,
    cancelVerification,
    resetRecaptcha,
  };
}