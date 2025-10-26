import { auth } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { showToast } from '../components/Toast';
import { hashPassword } from '../utils/crypto';
import {
  createUserProfile,
  updateLastLogin,
  loadUserProfile,
} from './userService';

const googleProvider = new GoogleAuthProvider();

// ===== Avatar helpers =====
// Avatar palette based on Tailwind brand colors (primary/secondary strong shades)
const AVATAR_PALETTE = ['#fcc639','#f7b83b','#f29e48','#ec6d77','#e86485','#db5d98'];
const pickRandomColor = () => AVATAR_PALETTE[Math.floor(Math.random()*AVATAR_PALETTE.length)];
const getAvatarForGender = (gender) => {
  const g = (gender || '').toLowerCase();
  let icon = '/images/icons/neutral.png';
  if (g.includes('masc')) icon = '/images/icons/male.png';
  else if (g.includes('fem')) icon = '/images/icons/female.png';
  else if (g.includes('neut')) icon = '/images/icons/neutral.png';
  return { icon, bg: pickRandomColor() };
};


/**
 * Configura reCAPTCHA para verificaÃ§Ã£o de telefone
 * @param {Object|null} existingVerifier - Verifier existente (para cleanup)
 * @returns {RecaptchaVerifier|null} Novo verifier ou null em caso de erro
 */
export const setupRecaptcha = (existingVerifier = null) => {
  try {
    // Limpar verifier anterior se existir
    if (existingVerifier && existingVerifier.verifier) {
      return existingVerifier;
    }

    if (existingVerifier && typeof existingVerifier.clear === 'function') {
      try {
        existingVerifier.clear();
      } catch (e) {
        if (!String(e).includes('already destroyed')) {
          console.warn('Aviso ao limpar reCAPTCHA anterior:', e);
        }
      }
    }

    // Limpar container HTML
    const container = document.getElementById('recaptcha-container');
    if (container) {
      container.innerHTML = '';
    }

    // Criar novo verifier
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => console.log('reCAPTCHA resolvido'),
      'expired-callback': () => setupRecaptcha(),
    });

    return verifier;
  } catch (error) {
    console.error('Erro ao configurar reCAPTCHA:', error);
    return null;
  }
};

/**
 * Envia cÃ³digo de verificaÃ§Ã£o por SMS
 * @param {string} phoneNumber - Telefone (apenas dÃ­gitos, sem cÃ³digo paÃ­s)
 * @param {RecaptchaVerifier|null} verifier - reCAPTCHA verifier
 * @returns {Promise<Object>} Confirmation result do Firebase
 */
export const sendPhoneVerificationCode = async (phoneNumber, verifier) => {
  const formattedPhone = `+55${phoneNumber}`;

  let activeVerifier = verifier;
  if (!activeVerifier) {
    activeVerifier = setupRecaptcha();
    if (!activeVerifier) {
      throw new Error('NÃ£o foi possÃ­vel configurar o reCAPTCHA');
    }
  }

  try {
    const result = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      activeVerifier
    );
    showToast('CÃ³digo enviado via SMS! ðŸ“±', 'success');
    return result;
  } catch (error) {
    console.error('Erro ao enviar SMS:', error);

    if (error.code === 'auth/invalid-phone-number') {
      showToast('NÃºmero de telefone invÃ¡lido', 'error');
    } else if (error.code === 'auth/too-many-requests') {
      showToast('Muitas tentativas. Aguarde alguns minutos', 'error');
    } else if (error.message.includes('reCAPTCHA')) {
      showToast('Erro de verificaÃ§Ã£o. Tente novamente', 'error');
      setTimeout(() => setupRecaptcha(), 500);
    } else {
      showToast('Erro ao enviar cÃ³digo. Tente novamente', 'error');
    }

    throw error;
  }
};

/**
 * Verifica cÃ³digo SMS
 * @param {Object} confirmationResult - Resultado do sendPhoneVerificationCode
 * @param {string} code - CÃ³digo de 6 dÃ­gitos
 * @returns {Promise<Object>} Firebase user
 */
export const verifyPhoneCode = async (confirmationResult, code) => {
  if (!confirmationResult) {
    throw new Error('Nenhum cÃ³digo pendente de verificaÃ§Ã£o');
  }

  try {
    const result = await confirmationResult.confirm(code);
    return result.user;
  } catch (error) {
    console.error('Erro ao verificar cÃ³digo:', error);

    if (error.code === 'auth/invalid-verification-code') {
      showToast('CÃ³digo invÃ¡lido. Verifique e tente novamente', 'error');
    } else if (error.code === 'auth/code-expired') {
      showToast('CÃ³digo expirado. Solicite um novo', 'error');
    } else {
      showToast('Erro ao verificar cÃ³digo', 'error');
    }

    throw error;
  }
};

/**
 * Login/Signup com Google
 * @param {boolean} isSignup - Se Ã© cadastro (true) ou login (false)
 * @returns {Promise<Object>} Firebase user
 */
export const googleSignIn = async (isSignup = false) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const existingProfile = await loadUserProfile(user.uid);

    if (!existingProfile) {
      if (!isSignup) {
        await signOut(auth);
        showToast('Conta nÃ£o encontrada. Crie uma conta primeiro', 'error');
        throw new Error('Conta nÃ£o encontrada');
      }

      // Criar novo perfil
      await createUserProfile(user.uid, {
        name: user.displayName || 'UsuÃ¡rio',
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        passwordHash: '',
        partnerId: null,
        partnerName: null,
        authMethod: 'google',
        photoURL: user.photoURL || '',
      });

      showToast('Conta criada com sucesso! ðŸ’', 'success');
    } else {
      // Login existente
      await updateLastLogin(user.uid);
      showToast('Bem-vindo de volta! ðŸ’•', 'success');
    }

    return user;
  } catch (error) {
    console.error('Erro no login com Google:', error);

    if (error.code === 'auth/popup-closed-by-user') {
      showToast('Login cancelado', 'warning');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      showToast('Esta conta jÃ¡ existe com outro mÃ©todo de login', 'error');
    } else if (error.message !== 'Conta nÃ£o encontrada') {
      showToast('Erro ao fazer login com Google', 'error');
    }

    throw error;
  }
};

/**
 * Cadastro com email e senha
 * @param {Object} data - {email, password, name}
 * @returns {Promise<Object>} Firebase user
 */
export const emailSignup = async ({
  email,
  password,
  name,
  gender = 'Gênero Neutro',
}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const avatar = getAvatarForGender(gender);
    await createUserProfile(userCredential.user.uid, {
      name,
      email,
      phoneNumber: '',
      passwordHash: hashPassword(password),
      authMethod: 'email',
      gender,
      photoURL: avatar.icon,
      avatarBg: avatar.bg,
    });

    showToast('Conta criada com sucesso! ðŸ’', 'success');
    return userCredential.user;
  } catch (error) {
    let errorMessage = 'Erro ao criar conta';

    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Este email jÃ¡ estÃ¡ em uso';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email invÃ¡lido';
    }

    showToast(errorMessage, 'error');
    throw error;
  }
};

/**
 * Login com email e senha
 * @param {string} email - Email
 * @param {string} password - Senha
 * @param {boolean} rememberMe - Manter sessÃ£o
 * @returns {Promise<Object>} Firebase user
 */
export const emailLogin = async (email, password, rememberMe = true) => {
  try {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateLastLogin(userCredential.user.uid);
    showToast('Bem-vindo de volta! ðŸ’•', 'success');
    return userCredential.user;
  } catch (error) {
    let errorMessage = 'Erro ao fazer login';

    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password'
    ) {
      errorMessage = 'Email ou senha incorretos';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'Esta conta foi desativada';
    }

    showToast(errorMessage, 'error');
    throw error;
  }
};

/**
 * Cadastro com telefone (apÃ³s verificaÃ§Ã£o SMS)
 * @param {Object} data - {userId, name, phoneNumber}
 * @returns {Promise<void>}
 */
export const phoneSignup = async ({
  userId,
  name,
  phoneNumber,
  gender = 'Gênero Neutro',
}) => {
  try {
    const avatar = getAvatarForGender(gender);
    await createUserProfile(userId, {
      name,
      email: '',
      phoneNumber,
      authMethod: 'phone',
      gender,
      photoURL: avatar.icon,
      avatarBg: avatar.bg,
    });

    showToast('Conta criada com sucesso! ðŸ’', 'success');
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    showToast('Erro ao criar perfil do usuÃ¡rio', 'error');
    throw error;
  }
};

/**
 * Login com telefone e senha
 * @param {string} phoneNumber - Telefone (apenas dÃ­gitos)
 * @param {string} password - Senha
 * @returns {Promise<Object>} Firebase user
 */
export const phoneLogin = async (phoneNumber, password) => {
  try {
    const { findUserByPhone } = await import('./userService');
    const { verifyPassword } = await import('../utils/crypto');

    // Buscar usuÃ¡rio pelo telefone
    const userResult = await findUserByPhone(phoneNumber);
    if (!userResult) {
      showToast('Telefone nÃ£o cadastrado', 'error');
      throw new Error('Telefone nÃ£o cadastrado');
    }

    // Verificar senha
    const isPasswordValid = verifyPassword(password, userResult.data.passwordHash);
    if (!isPasswordValid) {
      showToast('Senha incorreta', 'error');
      throw new Error('Senha incorreta');
    }

    // Login com Firebase usando o mesmo telefone (trigger SMS)
    // Isso sincroniza o estado do Firebase Auth
    showToast('Enviando cÃ³digo de verificaÃ§Ã£o...', 'info');

    // Retornar os dados do usuÃ¡rio para continuar o fluxo
    return {
      needsPhoneVerification: true,
      phoneNumber,
      userId: userResult.id,
      userData: userResult.data,
    };
  } catch (error) {
    console.error('Erro no login por telefone:', error);
    if (!error.message.includes('Telefone nÃ£o cadastrado') && !error.message.includes('Senha incorreta')) {
      showToast('Erro ao fazer login', 'error');
    }
    throw error;
  }
};

/**
 * Envia email de recuperaÃ§Ã£o de senha
 * @param {string} email - Email para recuperaÃ§Ã£o
 * @returns {Promise<void>}
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    showToast(
      'Email de recuperaÃ§Ã£o enviado! Verifique sua caixa de entrada',
      'success'
    );
  } catch (error) {
    let errorMessage = 'Erro ao enviar email de recuperaÃ§Ã£o';

    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Email nÃ£o encontrado';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email invÃ¡lido';
    }

    showToast(errorMessage, 'error');
    throw error;
  }
};

/**
 * Logout
 * @returns {Promise<void>}
 */
export const logout = async () => {
  await signOut(auth);
  showToast('Logout realizado com sucesso', 'success');
};


