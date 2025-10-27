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
 * Configura reCAPTCHA para verificação de telefone
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

    window.recaptchaVerifier = verifier;
    return verifier;
  } catch (error) {
    console.error('Erro ao configurar reCAPTCHA:', error);
    return null;
  }
};

/**
 * Envia código de verificação por SMS
 * @param {string} phoneNumber - Telefone (apenas dígitos, sem código país)
 * @param {RecaptchaVerifier|null} verifier - reCAPTCHA verifier
 * @returns {Promise<Object>} Confirmation result do Firebase
 */
export const sendPhoneVerificationCode = async (phoneNumber, verifier) => {
  const formattedPhone = `+55${phoneNumber}`;

  let activeVerifier = verifier;
  if (!activeVerifier) {
    activeVerifier = setupRecaptcha();
    if (!activeVerifier) {
      throw new Error('Não foi possível configurar o reCAPTCHA');
    }
  }

  try {
    const result = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      activeVerifier
    );
    showToast('Código enviado via SMS! 📱', 'success');
    return result;
  } catch (error) {
    console.error('Erro ao enviar SMS:', error);

    if (error.code === 'auth/invalid-phone-number') {
      showToast('Número de telefone inválido', 'error');
    } else if (error.code === 'auth/too-many-requests') {
      showToast('Muitas tentativas. Aguarde alguns minutos', 'error');
    } else if (error.message.includes('reCAPTCHA')) {
      showToast('Erro de verificação. Tente novamente', 'error');
      setTimeout(() => setupRecaptcha(), 500);
    } else {
      showToast('Erro ao enviar código. Tente novamente', 'error');
    }

    throw error;
  }
};

/**
 * Verifica código SMS
 * @param {Object} confirmationResult - Resultado do sendPhoneVerificationCode
 * @param {string} code - Código de 6 dígitos
 * @returns {Promise<Object>} Firebase user
 */
export const verifyPhoneCode = async (confirmationResult, code) => {
  if (!confirmationResult) {
    throw new Error('Nenhum código pendente de verificação');
  }

  try {
    const result = await confirmationResult.confirm(code);
    return result.user;
  } catch (error) {
    console.error('Erro ao verificar código:', error);

    if (error.code === 'auth/invalid-verification-code') {
      showToast('Código inválido. Verifique e tente novamente', 'error');
    } else if (error.code === 'auth/code-expired') {
      showToast('Código expirado. Solicite um novo', 'error');
    } else {
      showToast('Erro ao verificar código', 'error');
    }

    throw error;
  }
};

/**
 * Login/Signup com Google
 * @param {boolean} isSignup - Se é cadastro (true) ou login (false)
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
        showToast('Conta não encontrada. Crie uma conta primeiro', 'error');
        throw new Error('Conta não encontrada');
      }

      // Criar novo perfil
      await createUserProfile(user.uid, {
        name: user.displayName || 'Usuário',
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        passwordHash: '',
        partnerId: null,
      partnerName: null,
      authMethod: 'google',
      photoURL: user.photoURL || '',
    });

      showToast('Conta criada com sucesso! 💖', 'success');
    } else {
      // Login existente
      await updateLastLogin(user.uid);
      showToast('Bem-vindo de volta! 💕', 'success');
    }

    return user;
  } catch (error) {
    console.error('Erro no login com Google:', error);

    if (error.code === 'auth/popup-closed-by-user') {
      showToast('Login cancelado', 'warning');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      showToast('Esta conta já existe com outro método de login', 'error');
    } else if (error.message !== 'Conta não encontrada') {
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
      authMethod: 'email',
      gender,
      photoURL: avatar.icon,
      avatarBg: avatar.bg,
    });

    showToast('Conta criada com sucesso! 💖', 'success');
    return userCredential.user;
  } catch (error) {
    let errorMessage = 'Erro ao criar conta';

    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Este email já está em uso';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido';
    }

    showToast(errorMessage, 'error');
    throw error;
  }
};

/**
 * Login com email e senha
 * @param {string} email - Email
 * @param {string} password - Senha
 * @param {boolean} rememberMe - Manter sessão
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
    showToast('Bem-vindo de volta! 💕', 'success');
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
 * Cadastro com telefone (após verificação SMS)
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

    showToast('Conta criada com sucesso! 💖', 'success');
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    showToast('Erro ao criar perfil do usuário', 'error');
    throw error;
  }
};

/**
 * Login com telefone (via SMS)
 * NOTA: Login por telefone agora usa apenas SMS verification
 * Firebase Auth gerencia a autenticação de forma segura
 * @param {string} phoneNumber - Telefone (apenas dígitos)
 * @returns {Promise<Object>} Objeto indicando que precisa verificação
 */
export const phoneLogin = async (phoneNumber) => {
  // Phone login agora apenas redireciona para verificação SMS
  // O Firebase Auth gerencia a autenticação de forma segura
  return {
    needsPhoneVerification: true,
    phoneNumber,
  };
};

/**
 * Envia email de recuperação de senha
 * @param {string} email - Email para recuperação
 * @returns {Promise<void>}
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    showToast(
      'Email de recuperação enviado! Verifique sua caixa de entrada',
      'success'
    );
  } catch (error) {
    let errorMessage = 'Erro ao enviar email de recuperação';

    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Email não encontrado';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido';
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
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
  await signOut(auth);
  showToast('Logout realizado com sucesso', 'success');
};
