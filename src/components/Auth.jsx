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
import FirebaseDiagnostic from './FirebaseDiagnostic';
import {
  Heart,
  Smartphone,
  Mail,
  Link as LinkIcon,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

// Constantes de Rate Limiting
const MAX_ATTEMPTS = 3;
const COOLDOWN_TIME = 60000; // 1 minuto
const ATTEMPT_STORAGE_KEY = 'phone_auth_attempts';

export default function Auth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Estados da UI
  const [step, setStep] = useState('choice');
  const [authMethod, setAuthMethod] = useState('email');

  // Dados do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relationshipStart, setRelationshipStart] = useState('');
  const [partnerIdentifier, setPartnerIdentifier] = useState('');

  // Estados para autenticação por telefone
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  const [recaptchaWidgetId, setRecaptchaWidgetId] = useState(null);

  // Estados para Rate Limiting e Validação
  const [phoneError, setPhoneError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const clearRecaptcha = () => {
    if (recaptchaVerifier) {
      try {
        // Verificar se o widget ainda existe no DOM
        const container = document.getElementById('recaptcha-container');
        if (container && container.children.length > 0) {
          recaptchaVerifier.clear();
        }
      } catch (error) {
        // Ignorar erros ao limpar, apenas registrar
        console.warn(
          'Aviso ao limpar reCAPTCHA (pode ser ignorado):',
          error.code
        );
      } finally {
        setRecaptchaVerifier(null);
        setRecaptchaWidgetId(null);
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
    // Verificar se está bloqueado por rate limiting
    checkRateLimit();

    // Limpar reCAPTCHA antigo ao mudar de tela/método
    if (authMethod !== 'phone' || (step !== 'signup' && step !== 'login')) {
      clearRecaptcha();
      return;
    }

    // Inicializar reCAPTCHA quando necessário
    if (
      authMethod === 'phone' &&
      (step === 'signup' || step === 'login') &&
      !recaptchaVerifier &&
      !isBlocked
    ) {
      // Aguardar um pouco para garantir que o DOM está pronto
      const timer = setTimeout(() => {
        try {
          const container = document.getElementById('recaptcha-container');
          if (!container) {
            console.error('Container do reCAPTCHA não encontrado');
            return;
          }

          // Limpar container antes de inicializar
          container.innerHTML = '';

          auth.languageCode = 'pt-BR';

          const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'normal', // Mudado de 'invisible' para 'normal' - mais confiável
            callback: (response) => {
              console.log('reCAPTCHA resolvido:', response);
            },
            'expired-callback': () => {
              console.log('reCAPTCHA expirado - limpando');
              clearRecaptcha();
              setPhoneError('reCAPTCHA expirado. Tente novamente.');
            },
            'error-callback': (error) => {
              console.error('Erro no reCAPTCHA:', error);
              clearRecaptcha();
              setPhoneError('Erro no reCAPTCHA. Recarregue a página.');
            },
          });

          verifier
            .render()
            .then((widgetId) => {
              console.log('reCAPTCHA renderizado com ID:', widgetId);
              setRecaptchaVerifier(verifier);
              setRecaptchaWidgetId(widgetId);
            })
            .catch((error) => {
              console.error('Erro ao renderizar reCAPTCHA:', error);
              setPhoneError(
                'Erro ao inicializar verificação. Recarregue a página.'
              );
            });
        } catch (error) {
          console.error('Erro ao inicializar reCAPTCHA:', error);
          setPhoneError('Erro ao inicializar verificação. Tente novamente.');
        }
      }, 100);

      return () => {
        clearTimeout(timer);
      };
    }

    return () => {
      if (authMethod !== 'phone' || (step !== 'signup' && step !== 'login')) {
        clearRecaptcha();
      }
    };
  }, [authMethod, step, isBlocked]);

  // Timer para countdown do bloqueio
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
      '19', // SP
      '21',
      '22',
      '24', // RJ
      '27',
      '28', // ES
      '31',
      '32',
      '33',
      '34',
      '35',
      '37',
      '38', // MG
      '41',
      '42',
      '43',
      '44',
      '45',
      '46', // PR
      '47',
      '48',
      '49', // SC
      '51',
      '53',
      '54',
      '55', // RS
      '61', // DF
      '62',
      '64', // GO
      '63', // TO
      '65',
      '66', // MT
      '67', // MS
      '68', // AC
      '69', // RO
      '71',
      '73',
      '74',
      '75',
      '77', // BA
      '79', // SE
      '81',
      '87', // PE
      '82', // AL
      '83', // PB
      '84', // RN
      '85',
      '88', // CE
      '86',
      '89', // PI
      '91',
      '93',
      '94', // PA
      '92',
      '97', // AM
      '95', // RR
      '96', // AP
      '98',
      '99', // MA
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
      console.error('Erro ao carregar perfil:', error);
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

      alert('Conta criada! Agora você pode vincular com seu parceiro.');
    } catch (error) {
      alert('Erro ao criar conta: ' + error.message);
    }
  };

  const handlePhoneSignup = async (e) => {
    e.preventDefault();

    if (isBlocked) {
      alert(
        `Aguarde ${Math.ceil(remainingTime / 1000)}s antes de tentar novamente.`
      );
      return;
    }

    if (!confirmationResult) {
      // Validar telefone
      const validationError = validateBrazilPhone(phoneNumber);
      if (validationError) {
        setPhoneError(validationError);
        return;
      }

      // Verificar se reCAPTCHA está pronto
      if (!recaptchaVerifier) {
        setPhoneError('Aguarde a inicialização da verificação...');
        return;
      }

      try {
        setPhoneError('Enviando código SMS...');
        const formattedPhone = `+55${phoneNumber}`;

        console.log('=== TENTATIVA DE ENVIO DE SMS ===');
        console.log('Telefone formatado:', formattedPhone);
        console.log('reCAPTCHA verificador existe:', !!recaptchaVerifier);
        console.log('Firebase Auth configurado:', !!auth);
        console.log('Project ID:', auth.app.options.projectId);

        setConfirmationResult(null);
        const confirmation = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          recaptchaVerifier
        );

        console.log('✅ SMS enviado com sucesso!');
        console.log('Confirmation result:', confirmation);

        setConfirmationResult(confirmation);
        setPhoneError('');
        alert(
          '✅ Código enviado para seu telefone! Verifique suas mensagens SMS.'
        );
        incrementAttempts();
      } catch (error) {
        console.error('Erro completo:', error);
        console.error('Código do erro:', error.code);
        console.error('Mensagem:', error.message);

        let errorMessage = 'Erro ao enviar código. ';

        if (error.code === 'auth/quota-exceeded') {
          errorMessage =
            '❌ Limite de SMS atingido para hoje. Tente novamente amanhã ou use autenticação por email.';
        } else if (error.code === 'auth/invalid-phone-number') {
          errorMessage =
            'Formato de telefone inválido. Use apenas números com DDD.';
          setPhoneError('Formato de telefone inválido');
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos.';
          setIsBlocked(true);
          setRemainingTime(COOLDOWN_TIME);
        } else if (error.code === 'auth/internal-error') {
          errorMessage = '❌ Erro interno do Firebase. Possíveis causas:\n\n';
          errorMessage +=
            '1. Phone Authentication não está habilitado no Firebase Console\n';
          errorMessage += '2. Domínio não autorizado (adicione localhost)\n';
          errorMessage += '3. Credenciais do Firebase incorretas\n\n';
          errorMessage += 'Use autenticação por email enquanto isso.';
        } else if (error.code === 'auth/captcha-check-failed') {
          errorMessage =
            '❌ Verificação reCAPTCHA falhou. Por favor, resolva o reCAPTCHA e tente novamente.';
          clearRecaptcha();
        } else if (error.message.includes('Timeout')) {
          errorMessage = '⏱️ Timeout ao enviar SMS. Possíveis causas:\n\n';
          errorMessage += '1. O número pode estar incorreto\n';
          errorMessage += '2. O serviço de SMS do Firebase pode estar lento\n';
          errorMessage += '3. Problemas de conectividade\n\n';
          errorMessage += 'Tente novamente ou use autenticação por email.';
        } else {
          errorMessage += error.message;
        }

        setPhoneError('Falha ao enviar SMS. Veja os detalhes.');
        alert(errorMessage);
        incrementAttempts();

        // Limpar e reinicializar reCAPTCHA
        clearRecaptcha();
      }
    } else {
      try {
        const result = await confirmationResult.confirm(verificationCode);

        await setDoc(doc(db, 'users', result.user.uid), {
          name,
          email: '',
          phoneNumber: result.user.phoneNumber,
          relationshipStart,
          partnerId: null,
          partnerName: null,
          authMethod: 'phone',
          createdAt: new Date().toISOString(),
        });

        localStorage.removeItem(ATTEMPT_STORAGE_KEY);
        alert('Conta criada! Agora você pode vincular com seu parceiro.');
      } catch (error) {
        console.error('Erro ao verificar código:', error);
        let errorMessage = 'Código inválido. ';

        if (error.code === 'auth/invalid-verification-code') {
          errorMessage = 'Código inválido. Verifique e tente novamente.';
        } else if (error.code === 'auth/code-expired') {
          errorMessage = 'Código expirado. Solicite um novo código.';
          setConfirmationResult(null);
        } else {
          errorMessage += error.message;
        }

        alert(errorMessage);
      }
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert('Erro ao fazer login: ' + error.message);
    }
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();

    if (isBlocked) {
      alert(
        `Aguarde ${Math.ceil(remainingTime / 1000)}s antes de tentar novamente.`
      );
      return;
    }

    if (!confirmationResult) {
      const validationError = validateBrazilPhone(phoneNumber);
      if (validationError) {
        setPhoneError(validationError);
        return;
      }

      // Verificar se reCAPTCHA está pronto
      if (!recaptchaVerifier) {
        setPhoneError('Aguarde a inicialização da verificação...');
        return;
      }

      try {
        const formattedPhone = `+55${phoneNumber}`;
        setConfirmationResult(null);
        const confirmation = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          recaptchaVerifier
        );
        setConfirmationResult(confirmation);
        alert('Código enviado para seu telefone!');
        incrementAttempts();
      } catch (error) {
        console.error('Erro completo:', error);

        let errorMessage = 'Erro ao enviar código. ';

        if (error.code === 'auth/quota-exceeded') {
          errorMessage =
            '❌ Limite de SMS atingido. Tente novamente amanhã ou use email.';
        } else if (error.code === 'auth/invalid-phone-number') {
          errorMessage = 'Formato de telefone inválido.';
          setPhoneError('Formato de telefone inválido');
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos.';
          setIsBlocked(true);
          setRemainingTime(COOLDOWN_TIME);
        } else if (error.code === 'auth/internal-error') {
          errorMessage = 'Erro interno. Tente usar autenticação por email.';
        } else {
          errorMessage += error.message;
        }

        alert(errorMessage);
        incrementAttempts();

        // Limpar e reinicializar reCAPTCHA
        clearRecaptcha();
      }
    } else {
      try {
        await confirmationResult.confirm(verificationCode);
        localStorage.removeItem(ATTEMPT_STORAGE_KEY);
      } catch (error) {
        console.error('Erro ao verificar código:', error);
        let errorMessage = 'Código inválido. ';

        if (error.code === 'auth/invalid-verification-code') {
          errorMessage = 'Código inválido. Verifique e tente novamente.';
        } else if (error.code === 'auth/code-expired') {
          errorMessage = 'Código expirado. Solicite um novo código.';
          setConfirmationResult(null);
        } else {
          errorMessage += error.message;
        }

        alert(errorMessage);
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
          : `+55${partnerIdentifier}`;
        q = query(usersRef, where('phoneNumber', '==', formattedPhone));
      }

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('Parceiro(a) não encontrado(a). Verifique o email ou telefone.');
        return;
      }

      const partnerDoc = querySnapshot.docs[0];
      const partnerId = partnerDoc.id;
      const partnerData = partnerDoc.data();

      if (partnerData.partnerId && partnerData.partnerId !== user.uid) {
        alert('Este usuário já está vinculado a outra pessoa.');
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

      alert('Vinculação realizada com sucesso! 💕');
      await loadProfile(user.uid);
    } catch (error) {
      alert('Erro ao vincular: ' + error.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-pink-500 text-2xl">
          Carregando...
        </div>
      </div>
    );
  }

  if (user && profile && !profile.partnerId) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center mb-4">
            Olá, {profile.name}! 💕
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Para começar a usar o Noo.us, você precisa vincular sua conta com a
            do seu parceiro(a).
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="email@exemplo.com ou 11999999999"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg flex items-center justify-center gap-2"
            >
              <LinkIcon className="w-5 h-5" />
              Vincular Contas
            </button>
          </form>

          <button
            onClick={handleLogout}
            className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Sair
          </button>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">
              💡 <strong>Dica:</strong> Seu parceiro(a) precisa criar uma conta
              primeiro. Depois, você pode vincular usando o email ou telefone
              cadastrado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (user && profile && profile.partnerId) {
    return (
      <Dashboard profile={profile} onLogout={handleLogout} userId={user.uid} />
    );
  }

  if (step === 'choice') {
    return (
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
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg"
            >
              Criar Nova Conta
            </button>

            <button
              onClick={() => setStep('login')}
              className="w-full bg-gray-100 text-gray-800 py-4 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Já Tenho Conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'signup') {
    return (
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
            className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
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
              className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
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
              className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg"
              >
                Criar Conta
              </button>
            </form>
          )}

          {authMethod === 'phone' && (
            <>
              {isBlocked && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
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
                    Início do Relacionamento
                  </label>
                  <input
                    type="date"
                    value={relationshipStart}
                    onChange={(e) => setRelationshipStart(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="123456"
                      required
                      maxLength="6"
                    />
                  </div>
                )}

                <div id="recaptcha-container"></div>

                <button
                  type="submit"
                  disabled={isBlocked}
                  className={`w-full py-3 rounded-lg font-semibold transition shadow-lg ${
                    isBlocked
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                  }`}
                >
                  {confirmationResult ? 'Verificar Código' : 'Enviar Código'}
                </button>
              </form>
            </>
          )}

          <div className="mt-4 p-4 bg-pink-50 rounded-lg">
            <p className="text-sm text-gray-600">
              💡 <strong>Importante:</strong> Cada pessoa cria sua própria
              conta. Depois, vocês vinculam as contas para compartilhar
              surpresas!
            </p>
          </div>

          {authMethod === 'phone' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700 font-semibold mb-2">
                📱 Problemas com SMS?
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Resolva o reCAPTCHA antes de enviar</li>
                <li>• Aguarde alguns segundos após enviar</li>
                <li>• Verifique se o número está correto</li>
                <li>• Use autenticação por email como alternativa</li>
              </ul>

              <details className="mt-3">
                <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                  🧪 Desenvolvedores: Números de teste
                </summary>
                <div className="mt-2 p-2 bg-white rounded text-xs">
                  <p className="font-mono text-gray-700">
                    Configure no Firebase Console:
                    <br />
                    Authentication → Sign-in method → Phone
                    <br />
                    → Phone numbers for testing
                    <br />
                    <br />
                    Exemplo: +55 11 99999-9999 → Código: 123456
                  </p>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'login') {
    return (
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
              if (recaptchaVerifier) {
                recaptchaVerifier.clear();
                setRecaptchaVerifier(null);
              }
            }}
            className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
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
                setConfirmationResult(null);
                setPhoneError('');
              }}
              className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
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
              className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg"
              >
                Entrar
              </button>
            </form>
          )}

          {authMethod === 'phone' && (
            <>
              {isBlocked && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <strong>Muitas tentativas.</strong> Aguarde{' '}
                    {Math.ceil(remainingTime / 1000)}s antes de tentar
                    novamente.
                  </div>
                </div>
              )}

              <form onSubmit={handlePhoneLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone (com DDD)
                  </label>
                  <input
                    type="tel"
                    value={formatPhoneDisplay(phoneNumber)}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
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

                {confirmationResult && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código de Verificação
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="123456"
                      required
                      maxLength="6"
                    />
                  </div>
                )}

                <div id="recaptcha-container"></div>

                <button
                  type="submit"
                  disabled={isBlocked}
                  className={`w-full py-3 rounded-lg font-semibold transition shadow-lg ${
                    isBlocked
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                  }`}
                >
                  {confirmationResult ? 'Verificar Código' : 'Enviar Código'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {process.env.NODE_ENV === 'development' && <FirebaseDiagnostic />}
      {null}
    </>
  );
}
