import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
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
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import Dashboard from './Dashboard';
import Toast, { showToast } from './Toast';
import Modal from './Modal';
import {
  Heart,
  Smartphone,
  Mail,
  Link as LinkIcon,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Shield,
  KeyRound,
} from 'lucide-react';
import CryptoJS from 'crypto-js';

const PASSWORD_MIN_LENGTH = 6;
const SALT_KEY = 'noo_us_secure_v1';
const googleProvider = new GoogleAuthProvider();

export default function Auth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [step, setStep] = useState('choice');
  const [authMethod, setAuthMethod] = useState('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relationshipStart, setRelationshipStart] = useState('');
  const [partnerIdentifier, setPartnerIdentifier] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationStep, setShowVerificationStep] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetMethod, setResetMethod] = useState('email');
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const hashPassword = (password) => {
    return CryptoJS.SHA256(password + SALT_KEY).toString();
  };

  const verifyPassword = (password, hash) => {
    return hashPassword(password) === hash;
  };

  const setupRecaptcha = () => {
    try {
      if (recaptchaVerifier && recaptchaVerifier.verifier) {
        return recaptchaVerifier;
      }

      if (recaptchaVerifier && typeof recaptchaVerifier.clear === 'function') {
        try {
          recaptchaVerifier.clear();
        } catch (e) {
          if (!String(e).includes('already destroyed')) {
            console.warn('Aviso ao limpar reCAPTCHA anterior:', e);
          }
        }
      }

      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.innerHTML = '';
      }

      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => console.log('reCAPTCHA resolvido'),
        'expired-callback': () => setupRecaptcha(),
      });

      setRecaptchaVerifier(verifier);
      return verifier;
    } catch (error) {
      console.error('Erro ao configurar reCAPTCHA:', error);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.error('Erro ao configurar persistência:', error);
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (step === 'signup' && authMethod === 'phone') {
      setTimeout(() => setupRecaptcha(), 100);
    }

    return () => {
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (e) {}
      }
    };
  }, [step, authMethod]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadProfile(currentUser.uid);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const validateBrazilPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 11)
      return 'O telefone deve ter 11 dígitos (DDD + número)';

    const validDDDs = [
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '21',
      '22',
      '24',
      '27',
      '28',
      '31',
      '32',
      '33',
      '34',
      '35',
      '37',
      '38',
      '41',
      '42',
      '43',
      '44',
      '45',
      '46',
      '47',
      '48',
      '49',
      '51',
      '53',
      '54',
      '55',
      '61',
      '62',
      '63',
      '64',
      '65',
      '66',
      '67',
      '68',
      '69',
      '71',
      '73',
      '74',
      '75',
      '77',
      '79',
      '81',
      '82',
      '83',
      '84',
      '85',
      '86',
      '87',
      '88',
      '89',
      '91',
      '92',
      '93',
      '94',
      '95',
      '96',
      '97',
      '98',
      '99',
    ];

    const ddd = cleaned.substring(0, 2);
    if (!validDDDs.includes(ddd)) return 'DDD inválido';
    if (cleaned[2] !== '9') return 'Número de celular deve começar com 9';
    return null;
  };

  const validatePassword = (pass, confirmPass = null) => {
    if (pass.length < PASSWORD_MIN_LENGTH) {
      return `Senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres`;
    }
    if (confirmPass !== null && pass !== confirmPass) {
      return 'As senhas não coincidem';
    }
    const hasNumber = /\d/.test(pass);
    const hasLetter = /[a-zA-Z]/.test(pass);
    if (!hasNumber || !hasLetter) {
      return 'Senha deve conter letras e números';
    }
    return null;
  };

  const formatPhoneDisplay = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 7)
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
      7,
      11
    )}`;
  };

  const handlePhoneChange = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      setPhoneNumber(cleaned);
      setPhoneError('');
    }
  };

  const loadProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setProfile(userDoc.data());
      }
    } catch (error) {
      showToast('Erro ao carregar perfil', 'error');
    }
  };

  const sendPhoneVerification = async (phoneNumber) => {
    try {
      const formattedPhone = `+55${phoneNumber}`;
      let verifier = recaptchaVerifier;
      if (!verifier) {
        verifier = setupRecaptcha();
        if (!verifier)
          throw new Error('Não foi possível configurar o reCAPTCHA');
      }

      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        verifier
      );
      setConfirmationResult(result);
      setShowVerificationStep(true);
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

  const verifyPhoneCode = async () => {
    try {
      if (!confirmationResult)
        throw new Error('Nenhum código pendente de verificação');
      const result = await confirmationResult.confirm(verificationCode);
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

  const handleGoogleSignIn = async (isSignup = false) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        if (!isSignup) {
          await signOut(auth);
          showToast('Conta não encontrada. Crie uma conta primeiro', 'error');
          return;
        }
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName || 'Usuário',
          email: user.email,
          phoneNumber: user.phoneNumber || '',
          passwordHash: '',
          relationshipStart: '',
          partnerId: null,
          partnerName: null,
          authMethod: 'google',
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
        showToast('Conta criada com sucesso! 💝', 'success');

        // Carregar perfil e atualizar estado
        await loadProfile(user.uid);
        setUser(user);
      } else {
        await updateDoc(doc(db, 'users', user.uid), {
          lastLogin: serverTimestamp(),
        });
        showToast('Bem-vindo de volta! 💕', 'success');

        // Carregar perfil e atualizar estado
        await loadProfile(user.uid);
        setUser(user);
      }
    } catch (error) {
      console.error('Erro no login com Google:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        showToast('Login cancelado', 'warning');
      } else if (
        error.code === 'auth/account-exists-with-different-credential'
      ) {
        showToast('Esta conta já existe com outro método de login', 'error');
      } else {
        showToast('Erro ao fazer login com Google', 'error');
      }
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    const passwordValidation = validatePassword(password, confirmPassword);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        phoneNumber: '',
        passwordHash: hashPassword(password),
        relationshipStart,
        partnerId: null,
        partnerName: null,
        authMethod: 'email',
        photoURL: '',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
      showToast('Conta criada com sucesso! 💝', 'success');
    } catch (error) {
      let errorMessage = 'Erro ao criar conta';
      if (error.code === 'auth/email-already-in-use')
        errorMessage = 'Este email já está em uso';
      else if (error.code === 'auth/weak-password')
        errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres';
      else if (error.code === 'auth/invalid-email')
        errorMessage = 'Email inválido';
      showToast(errorMessage, 'error');
    }
  };

  const handlePhoneSignup = async (e) => {
    e.preventDefault();
    const validationError = validateBrazilPhone(phoneNumber);
    if (validationError) {
      setPhoneError(validationError);
      return;
    }

    const passwordValidation = validatePassword(password, confirmPassword);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    try {
      const formattedPhone = `+55${phoneNumber}`;
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phoneNumber', '==', formattedPhone));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        showToast('Este telefone já está cadastrado', 'error');
        return;
      }

      await sendPhoneVerification(phoneNumber);
      window.tempSignupData = {
        name,
        phoneNumber: formattedPhone,
        relationshipStart,
        password: hashPassword(password),
      };
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
    }
  };

  const handlePhoneSignupVerification = async (e) => {
    e.preventDefault();
    try {
      const { name, phoneNumber, relationshipStart, password } =
        window.tempSignupData;
      const user = await verifyPhoneCode();

      // Criar email temporário baseado no telefone
      const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-11);
      const tempEmail = `${cleanPhone}@phone.noo.us`;

      await setDoc(doc(db, 'users', user.uid), {
        name,
        email: tempEmail,
        phoneNumber,
        passwordHash: password,
        relationshipStart,
        partnerId: null,
        partnerName: null,
        authMethod: 'phone',
        photoURL: '',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });

      delete window.tempSignupData;
      setShowVerificationStep(false);
      setVerificationCode('');
      setConfirmationResult(null);
      showToast('Conta criada com sucesso! 💝', 'success');
    } catch (error) {
      console.error('Erro na verificação:', error);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      await signInWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          lastLogin: serverTimestamp(),
        });
      }
      showToast('Bem-vindo de volta! 💕', 'success');
    } catch (error) {
      let errorMessage = 'Email ou senha incorretos';
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Aguarde alguns minutos';
      }
      showToast(errorMessage, 'error');
    }
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    try {
      const validationError = validateBrazilPhone(phoneNumber);
      if (validationError) {
        setPhoneError(validationError);
        return;
      }

      const passwordValidation = validatePassword(password);
      if (passwordValidation) {
        setPasswordError(passwordValidation);
        return;
      }

      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      const formattedPhone = `+55${phoneNumber}`;
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phoneNumber', '==', formattedPhone));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        showToast('Telefone não cadastrado', 'error');
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      if (!verifyPassword(password, userData.passwordHash)) {
        showToast('Senha incorreta', 'error');
        return;
      }

      // Usar o email temporário que foi criado no cadastro
      const userEmail = userData.email;

      if (!userEmail) {
        showToast(
          'Erro ao fazer login. Entre em contato com o suporte',
          'error'
        );
        return;
      }

      // Fazer login usando credenciais do Firebase Auth
      // Tentar com a senha temporária do telefone
      const tempPassword = 'temp_password_' + phoneNumber;

      try {
        await signInWithEmailAndPassword(auth, userEmail, tempPassword);
      } catch (loginError) {
        // Se o usuário ainda não existe no Auth (improvável), criar
        if (
          loginError.code === 'auth/user-not-found' ||
          loginError.code === 'auth/invalid-credential'
        ) {
          try {
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              userEmail,
              tempPassword
            );

            // Se o UID for diferente, atualizar Firestore
            if (userCredential.user.uid !== userDoc.id) {
              await setDoc(doc(db, 'users', userCredential.user.uid), {
                ...userData,
                email: userEmail,
              });
              await deleteDoc(doc(db, 'users', userDoc.id));
            }
          } catch (createError) {
            console.error('Erro ao criar usuário no Auth:', createError);
            showToast('Erro ao fazer login. Tente novamente', 'error');
            return;
          }
        } else {
          throw loginError;
        }
      }

      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          lastLogin: serverTimestamp(),
        });
      }

      showToast('Bem-vindo de volta! 💕', 'success');
    } catch (error) {
      console.error('Erro no login:', error);
      showToast('Erro ao fazer login. Tente novamente', 'error');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      if (resetMethod === 'email') {
        if (!resetEmail) {
          showToast('Digite seu email', 'warning');
          return;
        }
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', resetEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          showToast('Email não encontrado', 'error');
          return;
        }

        await sendPasswordResetEmail(auth, resetEmail);
        showToast(
          'Email de recuperação enviado! Verifique sua caixa de entrada 📧',
          'success',
          5000
        );
        setShowForgotPassword(false);
        setResetEmail('');
      } else {
        const validationError = validateBrazilPhone(resetPhone);
        if (validationError) {
          showToast(validationError, 'error');
          return;
        }

        const formattedPhone = `+55${resetPhone}`;
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('phoneNumber', '==', formattedPhone));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          showToast('Telefone não encontrado', 'error');
          return;
        }

        setModal({
          isOpen: true,
          title: '📱 Recuperação por Telefone',
          message:
            'Entre em contato com o suporte através do email suporte@noo.us informando seu telefone cadastrado para recuperar sua senha.',
          type: 'info',
        });
        setShowForgotPassword(false);
        setResetPhone('');
      }
    } catch (error) {
      console.error('Erro na recuperação:', error);
      if (error.code === 'auth/user-not-found') {
        showToast('Email não encontrado', 'error');
      } else {
        showToast('Erro ao enviar email de recuperação', 'error');
      }
    }
  };

  const handleLinkPartner = async (e) => {
    e.preventDefault();
    try {
      const usersRef = collection(db, 'users');
      let q;

      if (partnerIdentifier.includes('@')) {
        q = query(usersRef, where('email', '==', partnerIdentifier));
      } else {
        const formattedPhone = partnerIdentifier.startsWith('+')
          ? partnerIdentifier
          : `+55${partnerIdentifier.replace(/\D/g, '')}`;
        q = query(usersRef, where('phoneNumber', '==', formattedPhone));
      }

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        showToast('Parceiro(a) não encontrado(a)', 'error');
        return;
      }

      const partnerDoc = querySnapshot.docs[0];
      const partnerId = partnerDoc.id;
      const partnerData = partnerDoc.data();

      if (partnerData.partnerId && partnerData.partnerId !== user.uid) {
        showToast('Este usuário já está vinculado a outra pessoa', 'error');
        return;
      }

      await updateDoc(doc(db, 'users', user.uid), {
        partnerId,
        partnerName: partnerData.name,
      });

      await updateDoc(doc(db, 'users', partnerId), {
        partnerId: user.uid,
        partnerName: profile.name,
      });

      showToast('Vinculação realizada com sucesso! 💕', 'success');
      await loadProfile(user.uid);
    } catch (error) {
      showToast('Erro ao vincular contas', 'error');
    }
  };

  const handleLogout = () => {
    setModal({
      isOpen: true,
      title: 'Sair da conta',
      message: 'Deseja realmente sair?',
      type: 'warning',
      showCancel: true,
      onConfirm: () => {
        signOut(auth);
        showToast('Até logo! 👋', 'success');
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4 animate-pulse" />
          <div className="text-pink-500 text-xl font-semibold">
            Carregando...
          </div>
        </div>
      </div>
    );
  }

  if (user && profile) {
    return (
      <>
        <Toast />
        <Modal
          isOpen={modal.isOpen}
          onClose={() => setModal({ ...modal, isOpen: false })}
          title={modal.title}
          message={modal.message}
          customContent={modal.customContent}
          type={modal.type}
          showCancel={modal.showCancel}
          confirmText={modal.confirmText}
          onConfirm={modal.onConfirm}
        />
        <Dashboard
          profile={profile}
          onLogout={handleLogout}
          userId={user.uid}
          setModal={setModal}
        />
      </>
    );
  }

  if (step === 'choice') {
    return (
      <>
        <Toast />
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4 animate-pulse" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              Noo.us
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Um espaço especial para deixar surpresas um para o outro 💝
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setStep('signup')}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg"
              >
                Criar Nova Conta
              </button>

              <button
                onClick={() => setStep('login')}
                className="w-full bg-gray-100 text-gray-800 py-4 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Já Tenho Conta
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl flex items-start gap-2">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                <strong>Seguro e privado:</strong> Suas informações são
                protegidas com criptografia e você mantém controle total da sua
                conta.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (step === 'signup') {
    return (
      <>
        <Toast />
        <div id="recaptcha-container"></div>
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <button
              onClick={() => {
                setStep('choice');
                setAuthMethod('email');
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setPhoneNumber('');
                setRelationshipStart('');
                setPhoneError('');
                setPasswordError('');
                setShowVerificationStep(false);
                setVerificationCode('');
                setConfirmationResult(null);
                if (recaptchaVerifier) {
                  try {
                    recaptchaVerifier.clear();
                  } catch (e) {}
                }
              }}
              className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>

            <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-center mb-6">Criar Conta</h2>

            {!showVerificationStep ? (
              <>
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => {
                      setAuthMethod('email');
                      setPhoneError('');
                      setPasswordError('');
                    }}
                    className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                      authMethod === 'email'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Mail className="w-5 h-5" />
                    Email
                  </button>
                  <button
                    onClick={() => {
                      setAuthMethod('phone');
                      setPhoneError('');
                      setPasswordError('');
                    }}
                    className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                      authMethod === 'phone'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    Telefone
                  </button>
                </div>

                {authMethod === 'email' && (
                  <form onSubmit={handleEmailSignup} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seu Nome
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="João Silva"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError('');
                          }}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Mínimo 6 caracteres"
                          minLength={PASSWORD_MIN_LENGTH}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setPasswordError('');
                          }}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Digite a senha novamente"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {passwordError && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {passwordError}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Início do Relacionamento
                      </label>
                      <input
                        type="date"
                        value={relationshipStart}
                        onChange={(e) => setRelationshipStart(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg"
                    >
                      Criar Conta
                    </button>
                  </form>
                )}

                {authMethod === 'phone' && (
                  <form onSubmit={handlePhoneSignup} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seu Nome
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="João Silva"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone (com DDD)
                      </label>
                      <input
                        type="tel"
                        value={formatPhoneDisplay(phoneNumber)}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                          phoneError ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="(11) 99999-9999"
                        required
                      />
                      {phoneError && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {phoneError}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError('');
                          }}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Mínimo 6 caracteres"
                          minLength={PASSWORD_MIN_LENGTH}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setPasswordError('');
                          }}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Digite a senha novamente"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {passwordError && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {passwordError}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Início do Relacionamento
                      </label>
                      <input
                        type="date"
                        value={relationshipStart}
                        onChange={(e) => setRelationshipStart(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg"
                    >
                      Enviar Código SMS
                    </button>

                    <div className="p-3 bg-blue-50 rounded-xl text-sm text-gray-600">
                      💡 Você receberá um SMS para confirmar seu telefone
                    </div>
                  </form>
                )}

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        Ou continue com
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => handleGoogleSignIn(true)}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium text-gray-700"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continuar com Google
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-pink-50 rounded-xl">
                  <p className="text-sm text-gray-600">
                    💡 <strong>Importante:</strong> Cada pessoa cria sua própria
                    conta. Depois, vocês vinculam as contas para compartilhar
                    surpresas!
                  </p>
                </div>
              </>
            ) : (
              <form
                onSubmit={handlePhoneSignupVerification}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-pink-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Código Enviado!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Digite o código de 6 dígitos enviado para{' '}
                    {formatPhoneDisplay(phoneNumber)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código de Verificação
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 6) {
                        setVerificationCode(value);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center text-2xl tracking-widest font-semibold"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={verificationCode.length !== 6}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verificar Código
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowVerificationStep(false);
                    setVerificationCode('');
                    setConfirmationResult(null);
                    delete window.tempSignupData;
                  }}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition font-medium"
                >
                  Voltar
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationCode('');
                      handlePhoneSignup({ preventDefault: () => {} });
                    }}
                    className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Reenviar código
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </>
    );
  }

  if (step === 'login') {
    return (
      <>
        <Toast />
        <Modal
          isOpen={modal.isOpen}
          onClose={() => setModal({ ...modal, isOpen: false })}
          title={modal.title}
          message={modal.message}
          type={modal.type}
        />
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <button
              onClick={() => {
                setStep('choice');
                setAuthMethod('email');
                setEmail('');
                setPassword('');
                setPhoneNumber('');
                setPhoneError('');
                setPasswordError('');
                setShowForgotPassword(false);
              }}
              className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>

            <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-center mb-6">Entrar</h2>

            {!showForgotPassword ? (
              <>
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => {
                      setAuthMethod('email');
                      setPhoneError('');
                      setPasswordError('');
                    }}
                    className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                      authMethod === 'email'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Mail className="w-5 h-5" />
                    Email
                  </button>
                  <button
                    onClick={() => {
                      setAuthMethod('phone');
                      setPhoneError('');
                      setPasswordError('');
                    }}
                    className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                      authMethod === 'phone'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    Telefone
                  </button>
                </div>

                {authMethod === 'email' && (
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Sua senha"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                        />
                        <span className="text-sm text-gray-600">
                          Lembrar-me
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                      >
                        Esqueci a senha
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg"
                    >
                      Entrar
                    </button>
                  </form>
                )}

                {authMethod === 'phone' && (
                  <form onSubmit={handlePhoneLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone (com DDD)
                      </label>
                      <input
                        type="tel"
                        value={formatPhoneDisplay(phoneNumber)}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                          phoneError ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="(11) 99999-9999"
                        required
                      />
                      {phoneError && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {phoneError}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError('');
                          }}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Sua senha"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {passwordError && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {passwordError}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                        />
                        <span className="text-sm text-gray-600">
                          Lembrar-me
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                      >
                        Esqueci a senha
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg"
                    >
                      Entrar
                    </button>
                  </form>
                )}

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        Ou entre com
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => handleGoogleSignIn(false)}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium text-gray-700"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Entrar com Google
                    </button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-gray-600 text-center">
                    <strong>Primeira vez?</strong> Crie uma conta para começar!
                    💝
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <KeyRound className="w-6 h-6 text-pink-500" />
                  <h3 className="text-lg font-semibold">Recuperar Senha</h3>
                </div>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setResetMethod('email')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition ${
                      resetMethod === 'email'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </button>
                  <button
                    onClick={() => setResetMethod('phone')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition ${
                      resetMethod === 'phone'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 inline mr-1" />
                    Telefone
                  </button>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {resetMethod === 'email' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Digite seu email cadastrado
                      </label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="seu@email.com"
                        required
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Enviaremos um link para redefinir sua senha
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Digite seu telefone cadastrado
                      </label>
                      <input
                        type="tel"
                        value={formatPhoneDisplay(resetPhone)}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D/g, '');
                          if (cleaned.length <= 11) {
                            setResetPhone(cleaned);
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="(11) 99999-9999"
                        required
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Entre em contato com o suporte para recuperar sua senha
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setResetEmail('');
                        setResetPhone('');
                      }}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition font-medium"
                    >
                      {resetMethod === 'email' ? 'Enviar Email' : 'Continuar'}
                    </button>
                  </div>
                </form>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Lock className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600">
                      <strong>Dica de segurança:</strong> Nunca compartilhe sua
                      senha com ninguém. Nossa equipe nunca pedirá sua senha.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return <Toast />;
}
