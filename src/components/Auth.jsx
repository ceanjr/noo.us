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
import {
  Heart,
  Smartphone,
  Mail,
  Link as LinkIcon,
  ArrowLeft,
  Check,
} from 'lucide-react';

export default function Auth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Estados da UI
  const [step, setStep] = useState('choice'); // choice, signup, login, link
  const [authMethod, setAuthMethod] = useState('email'); // email ou phone

  // Dados do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relationshipStart, setRelationshipStart] = useState('');
  const [partnerIdentifier, setPartnerIdentifier] = useState(''); // email ou phone do parceiro

  // Estados para autenticação por telefone
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

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
    // Inicializar reCAPTCHA quando necessário
    if (
      authMethod === 'phone' &&
      (step === 'signup' || step === 'login') &&
      !recaptchaVerifier
    ) {
      try {
        // Configurar idioma (opcional - português do Brasil)
        auth.languageCode = 'pt-BR'; // ou 'pt' para português de Portugal

        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible', // 'invisible' é melhor para UX, 'normal' mostra o checkbox
          callback: () => {
            console.log('reCAPTCHA resolvido');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expirado');
          },
        });
        setRecaptchaVerifier(verifier);
        verifier.render();
      } catch (error) {
        console.error('Erro ao inicializar reCAPTCHA:', error);
      }
    }

    // Cleanup quando mudar de método ou step
    return () => {
      if (
        recaptchaVerifier &&
        (authMethod !== 'phone' || (step !== 'signup' && step !== 'login'))
      ) {
        recaptchaVerifier.clear();
        setRecaptchaVerifier(null);
      }
    };
  }, [authMethod, step, recaptchaVerifier]);

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

    if (!confirmationResult) {
      // Enviar código
      try {
        const formattedPhone = phoneNumber.startsWith('+')
          ? phoneNumber
          : `+55${phoneNumber}`;
        const confirmation = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          recaptchaVerifier
        );
        setConfirmationResult(confirmation);
        alert('Código enviado para seu telefone!');
      } catch (error) {
        alert('Erro ao enviar código: ' + error.message);
        if (recaptchaVerifier) {
          recaptchaVerifier.clear();
          setRecaptchaVerifier(null);
        }
      }
    } else {
      // Verificar código
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

        alert('Conta criada! Agora você pode vincular com seu parceiro.');
      } catch (error) {
        alert('Código inválido: ' + error.message);
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

    if (!confirmationResult) {
      try {
        const formattedPhone = phoneNumber.startsWith('+')
          ? phoneNumber
          : `+55${phoneNumber}`;
        const confirmation = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          recaptchaVerifier
        );
        setConfirmationResult(confirmation);
        alert('Código enviado para seu telefone!');
      } catch (error) {
        alert('Erro ao enviar código: ' + error.message);
        if (recaptchaVerifier) {
          recaptchaVerifier.clear();
          setRecaptchaVerifier(null);
        }
      }
    } else {
      try {
        await confirmationResult.confirm(verificationCode);
      } catch (error) {
        alert('Código inválido: ' + error.message);
      }
    }
  };

  const handleLinkPartner = async (e) => {
    e.preventDefault();

    try {
      // Buscar parceiro pelo email ou telefone
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

      // Verificar se o parceiro já está vinculado a outra pessoa
      if (partnerData.partnerId && partnerData.partnerId !== user.uid) {
        alert('Este usuário já está vinculado a outra pessoa.');
        return;
      }

      // Atualizar ambos os perfis
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

  // Se está logado mas não tem parceiro vinculado
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
                placeholder="email@exemplo.com ou +5511999999999"
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

  // Se está logado e tem parceiro vinculado
  if (user && profile && profile.partnerId) {
    return (
      <Dashboard profile={profile} onLogout={handleLogout} userId={user.uid} />
    );
  }

  // Tela de escolha inicial
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

  // Tela de cadastro
  if (step === 'signup') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <button
            onClick={() => {
              setStep('choice');
              setConfirmationResult(null);
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
          <h2 className="text-2xl font-bold text-center mb-6">Criar Conta</h2>

          {/* Escolher método de autenticação */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setAuthMethod('email');
                setConfirmationResult(null);
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

          {/* Formulário de cadastro com email */}
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

          {/* Formulário de cadastro com telefone */}
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
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="11999999999"
                  required
                  disabled={!!confirmationResult}
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
                  />
                </div>
              )}

              <div id="recaptcha-container"></div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg"
              >
                {confirmationResult ? 'Verificar Código' : 'Enviar Código'}
              </button>
            </form>
          )}

          <div className="mt-4 p-4 bg-pink-50 rounded-lg">
            <p className="text-sm text-gray-600">
              💡 <strong>Importante:</strong> Cada pessoa cria sua própria
              conta. Depois, vocês vinculam as contas para compartilhar
              surpresas!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Tela de login
  if (step === 'login') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <button
            onClick={() => {
              setStep('choice');
              setConfirmationResult(null);
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

          {/* Escolher método de autenticação */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setAuthMethod('email');
                setConfirmationResult(null);
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

          {/* Login com email */}
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

          {/* Login com telefone */}
          {authMethod === 'phone' && (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone (com DDD)
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="11999999999"
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
                  />
                </div>
              )}

              <div id="recaptcha-container"></div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg"
              >
                {confirmationResult ? 'Verificar Código' : 'Enviar Código'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return null;
}
