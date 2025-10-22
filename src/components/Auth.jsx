import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
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
} from 'lucide-react';

const MAX_ATTEMPTS = 3;
const COOLDOWN_TIME = 60000;
const ATTEMPT_STORAGE_KEY = 'phone_auth_attempts';

export default function Auth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const [step, setStep] = useState('choice');
  const [authMethod, setAuthMethod] = useState('email');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relationshipStart, setRelationshipStart] = useState('');
  const [partnerIdentifier, setPartnerIdentifier] = useState('');

  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

  const [phoneError, setPhoneError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const clearRecaptcha = () => {
    if (recaptchaVerifier) {
      try {
        const container = document.getElementById('recaptcha-container');
        if (container && container.children.length > 0) {
          recaptchaVerifier.clear();
        }
      } catch (error) {
        // Ignorar erros ao limpar
      } finally {
        setRecaptchaVerifier(null);
      }
    }
  };

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

  useEffect(() => {
    checkRateLimit();

    if (authMethod !== 'phone' || step !== 'signup') {
      clearRecaptcha();
      return;
    }

    if (
      authMethod === 'phone' &&
      step === 'signup' &&
      !recaptchaVerifier &&
      !isBlocked
    ) {
      const timer = setTimeout(() => {
        try {
          const container = document.getElementById('recaptcha-container');
          if (!container) return;

          container.innerHTML = '';
          auth.languageCode = 'pt-BR';

          const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'normal',
            callback: () => {
              setPhoneError('');
            },
            'expired-callback': () => {
              clearRecaptcha();
              setPhoneError('Verificação expirada. Tente novamente.');
            },
            'error-callback': () => {
              clearRecaptcha();
              setPhoneError('Erro na verificação. Recarregue a página.');
            },
          });

          verifier
            .render()
            .then(() => {
              setRecaptchaVerifier(verifier);
            })
            .catch(() => {
              setPhoneError('Erro ao inicializar verificação.');
            });
        } catch (error) {
          setPhoneError('Erro ao inicializar verificação.');
        }
      }, 100);

      return () => clearTimeout(timer);
    }

    return () => {
      if (authMethod !== 'phone' || step !== 'signup') {
        clearRecaptcha();
      }
    };
  }, [authMethod, step, isBlocked]);

  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime(remainingTime - 1000);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (remainingTime === 0 && isBlocked) {
      setIsBlocked(false);
    }
  }, [remainingTime, isBlocked]);

  const checkRateLimit = () => {
    const stored = localStorage.getItem(ATTEMPT_STORAGE_KEY);
    if (!stored) return;

    const { attempts, timestamp } = JSON.parse(stored);
    const now = Date.now();
    const timePassed = now - timestamp;

    if (attempts >= MAX_ATTEMPTS && timePassed < COOLDOWN_TIME) {
      setIsBlocked(true);
      setRemainingTime(COOLDOWN_TIME - timePassed);
    } else if (timePassed >= COOLDOWN_TIME) {
      localStorage.removeItem(ATTEMPT_STORAGE_KEY);
      setIsBlocked(false);
      setRemainingTime(0);
    }
  };

  const incrementAttempts = () => {
    const stored = localStorage.getItem(ATTEMPT_STORAGE_KEY);
    let attempts = 1;
    let timestamp = Date.now();

    if (stored) {
      const data = JSON.parse(stored);
      const timePassed = Date.now() - data.timestamp;

      if (timePassed < COOLDOWN_TIME) {
        attempts = data.attempts + 1;
        timestamp = data.timestamp;
      }
    }

    localStorage.setItem(
      ATTEMPT_STORAGE_KEY,
      JSON.stringify({ attempts, timestamp })
    );

    if (attempts >= MAX_ATTEMPTS) {
      setIsBlocked(true);
      setRemainingTime(COOLDOWN_TIME);
    }
  };

  const validateBrazilPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length !== 11) {
      return 'O telefone deve ter 11 dígitos (DDD + número)';
    }

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
    if (!validDDDs.includes(ddd)) {
      return 'DDD inválido';
    }

    if (cleaned[2] !== '9') {
      return 'Número de celular deve começar com 9';
    }

    return null;
  };

  const formatPhoneDisplay = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 7) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    }
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

  const handleEmailSignup = async (e) => {
    e.preventDefault();
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
        relationshipStart,
        partnerId: null,
        partnerName: null,
        authMethod: 'email',
        createdAt: new Date().toISOString(),
      });

      showToast('Conta criada com sucesso! 💝', 'success');
    } catch (error) {
      let errorMessage = 'Erro ao criar conta';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres';
      }
      showToast(errorMessage, 'error');
    }
  };

  const handlePhoneSignup = async (e) => {
    e.preventDefault();

    if (isBlocked) {
      showToast(
        `Aguarde ${Math.ceil(remainingTime / 1000)}s antes de tentar novamente`,
        'warning'
      );
      return;
    }

    if (!confirmationResult) {
      const validationError = validateBrazilPhone(phoneNumber);
      if (validationError) {
        setPhoneError(validationError);
        return;
      }

      if (!recaptchaVerifier) {
        setPhoneError('Aguarde a inicialização da verificação...');
        return;
      }

      try {
        setPhoneError('Enviando código SMS...');
        const formattedPhone = `+55${phoneNumber}`;

        setConfirmationResult(null);
        const confirmation = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          recaptchaVerifier
        );

        setConfirmationResult(confirmation);
        setPhoneError('');
        showToast('Código enviado para seu telefone! 📱', 'success');
        incrementAttempts();
      } catch (error) {
        let errorMessage = 'Erro ao enviar código';

        if (error.code === 'auth/quota-exceeded') {
          errorMessage =
            'Limite de SMS atingido. Tente novamente amanhã ou use email';
        } else if (error.code === 'auth/invalid-phone-number') {
          errorMessage = 'Formato de telefone inválido';
          setPhoneError('Formato de telefone inválido');
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos';
          setIsBlocked(true);
          setRemainingTime(COOLDOWN_TIME);
        } else if (error.code === 'auth/captcha-check-failed') {
          errorMessage =
            'Verificação reCAPTCHA falhou. Resolva o desafio e tente novamente';
          clearRecaptcha();
        }

        setPhoneError('Falha ao enviar SMS');
        showToast(errorMessage, 'error', 5000);
        incrementAttempts();
        clearRecaptcha();
      }
    } else {
      try {
        const result = await confirmationResult.confirm(verificationCode);

        // Criar email temporário para o Firebase Auth
        const tempEmail = `${phoneNumber.replace(/\D/g, '')}@noo.us.temp`;

        // Criar usuário no Auth com email temporário e senha
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          tempEmail,
          password
        );

        // Salvar dados no Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name,
          email: '',
          phoneNumber: result.user.phoneNumber,
          password: password,
          relationshipStart,
          partnerId: null,
          partnerName: null,
          authMethod: 'phone',
          createdAt: new Date().toISOString(),
        });

        localStorage.removeItem(ATTEMPT_STORAGE_KEY);
        showToast('Conta criada com sucesso! 💝', 'success');
      } catch (error) {
        let errorMessage = 'Código inválido';

        if (error.code === 'auth/invalid-verification-code') {
          errorMessage = 'Código inválido. Verifique e tente novamente';
        } else if (error.code === 'auth/code-expired') {
          errorMessage = 'Código expirado. Solicite um novo código';
          setConfirmationResult(null);
        } else if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Este telefone já está cadastrado. Faça login';
        }

        showToast(errorMessage, 'error');
      }
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast('Bem-vindo de volta! 💕', 'success');
    } catch (error) {
      let errorMessage = 'Erro ao fazer login';
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        errorMessage = 'Email ou senha incorretos';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Credenciais inválidas';
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

      if (!userData.password) {
        showToast(
          'Esta conta foi criada sem senha. Use a recuperação de senha',
          'error'
        );
        return;
      }

      if (userData.password !== password) {
        showToast('Senha incorreta', 'error');
        return;
      }

      // Criar email temporário se não existir
      const emailForAuth =
        userData.email || `${phoneNumber.replace(/\D/g, '')}@noo.us.temp`;

      // Tentar fazer login. Se não existir no Firebase Auth, criar
      try {
        await signInWithEmailAndPassword(auth, emailForAuth, password);
        showToast('Bem-vindo de volta! 💕', 'success');
      } catch (loginError) {
        if (loginError.code === 'auth/user-not-found') {
          // Usuário existe no Firestore mas não no Auth - criar no Auth
          try {
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              emailForAuth,
              password
            );
            // Atualizar o UID no Firestore se necessário
            await updateDoc(doc(db, 'users', userDoc.id), {
              authUid: userCredential.user.uid,
            });
            showToast('Bem-vindo de volta! 💕', 'success');
          } catch (createError) {
            showToast('Erro ao restaurar sessão. Contate o suporte', 'error');
          }
        } else {
          throw loginError;
        }
      }
    } catch (error) {
      showToast('Erro ao fazer login. Verifique suas credenciais', 'error');
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
          : `+55${partnerIdentifier}`;
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

  if (user && profile && !profile.partnerId) {
    return (
      <>
        <Toast />
        <Modal
          isOpen={modal.isOpen}
          onClose={() => setModal({ ...modal, isOpen: false })}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          showCancel={modal.showCancel}
          onConfirm={modal.onConfirm}
        />
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-center mb-4">
              Olá, {profile.name}! 💕
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Para começar a usar o Noo.us, você precisa vincular sua conta com
              a do seu parceiro(a).
            </p>

            <form onSubmit={handleLinkPartner} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email ou Telefone do(a) Parceiro(a)
                </label>
                <input
                  type="text"
                  value={partnerIdentifier}
                  onChange={(e) => setPartnerIdentifier(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="email@exemplo.com ou 11999999999"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg flex items-center justify-center gap-2"
              >
                <LinkIcon className="w-5 h-5" />
                Vincular Contas
              </button>
            </form>

            <button
              onClick={handleLogout}
              className="w-full mt-4 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition font-medium"
            >
              Sair
            </button>

            <div className="mt-6 p-4 bg-pink-50 rounded-xl">
              <p className="text-sm text-gray-600">
                💡 <strong>Dica:</strong> Seu parceiro(a) precisa criar uma
                conta primeiro. Depois, você pode vincular usando o email ou
                telefone cadastrado.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (user && profile && profile.partnerId) {
    return (
      <>
        <Toast />
        <Modal
          isOpen={modal.isOpen}
          onClose={() => setModal({ ...modal, isOpen: false })}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          showCancel={modal.showCancel}
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
          </div>
        </div>
      </>
    );
  }

  if (step === 'signup') {
    return (
      <>
        <Toast />
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <button
              onClick={() => {
                setStep('choice');
                setAuthMethod('email');
                setConfirmationResult(null);
                setPhoneError('');
                setVerificationCode('');
                setName('');
                setEmail('');
                setPassword('');
                setPhoneNumber('');
                setRelationshipStart('');
                clearRecaptcha();
              }}
              className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>

            <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-center mb-6">Criar Conta</h2>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  setAuthMethod('email');
                  setConfirmationResult(null);
                  setPhoneError('');
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
                  setConfirmationResult(null);
                  setPhoneError('');
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
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    minLength="6"
                    required
                  />
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
              <>
                {isBlocked && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700">
                      <strong>Muitas tentativas.</strong> Aguarde{' '}
                      {Math.ceil(remainingTime / 1000)}s antes de tentar
                      novamente.
                    </div>
                  </div>
                )}

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
                      required
                      disabled={!!confirmationResult}
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
                      disabled={!!confirmationResult}
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
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      minLength="6"
                      required
                      disabled={!!confirmationResult}
                      placeholder="Mínimo 6 caracteres"
                    />
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
                      disabled={!!confirmationResult}
                    />
                  </div>

                  {confirmationResult && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código de Verificação
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center text-2xl tracking-widest"
                        placeholder="000000"
                        required
                        maxLength="6"
                      />
                    </div>
                  )}

                  <div
                    id="recaptcha-container"
                    className="flex justify-center"
                  ></div>

                  <button
                    type="submit"
                    disabled={isBlocked}
                    className={`w-full py-3 rounded-xl font-semibold transition shadow-lg ${
                      isBlocked
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                    }`}
                  >
                    {confirmationResult
                      ? 'Verificar Código'
                      : 'Enviar Código SMS'}
                  </button>
                </form>
              </>
            )}

            <div className="mt-4 p-4 bg-pink-50 rounded-xl">
              <p className="text-sm text-gray-600">
                💡 <strong>Importante:</strong> Cada pessoa cria sua própria
                conta. Depois, vocês vinculam as contas para compartilhar
                surpresas!
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (step === 'login') {
    return (
      <>
        <Toast />
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <button
              onClick={() => {
                setStep('choice');
                setAuthMethod('email');
                setConfirmationResult(null);
                setPhoneError('');
                setVerificationCode('');
                setName('');
                setEmail('');
                setPassword('');
                setPhoneNumber('');
                clearRecaptcha();
              }}
              className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>

            <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-center mb-6">Entrar</h2>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  setAuthMethod('email');
                  setPhoneError('');
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
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
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
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg"
                >
                  Entrar
                </button>
              </form>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600 text-center">
                <strong>Primeira vez?</strong> Crie uma conta para começar! 💝
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return <Toast />;
}
