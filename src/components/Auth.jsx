import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Dashboard from './Dashboard';
import { Heart } from 'lucide-react';

export default function Auth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState(null);

  // Form de criação de perfil
  const [myName, setMyName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [relationshipStart, setRelationshipStart] = useState('');
  const [myPassword, setMyPassword] = useState('');
  const [partnerPassword, setPartnerPassword] = useState('');

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

  const loadProfile = async (userId) => {
    try {
      const coupleDoc = await getDoc(doc(db, 'couples', userId));
      if (coupleDoc.exists()) {
        setProfile(coupleDoc.data());
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // Criar documento do casal no Firestore
        await setDoc(doc(db, 'couples', userCredential.user.uid), {
          person1: {
            name: myName,
            password: myPassword,
            email: email,
          },
          person2: {
            name: partnerName,
            password: partnerPassword,
          },
          relationshipStart: relationshipStart,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      alert('Erro: ' + error.message);
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

  if (user && profile) {
    return (
      <Dashboard
        profile={profile}
        onLogout={handleLogout}
        coupleId={user.uid}
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Noo.us</h1>
          <p className="text-gray-600">
            Um espaço especial para deixar surpresas um para o outro 💝
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              isLogin ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              !isLogin ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Criar Conta
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seu Nome
                </label>
                <input
                  type="text"
                  value={myName}
                  onChange={(e) => setMyName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do(a) Parceiro(a)
                </label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sua Senha de Acesso
                </label>
                <input
                  type="password"
                  value={myPassword}
                  onChange={(e) => setMyPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Senha só sua"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha do(a) Parceiro(a)
                </label>
                <input
                  type="password"
                  value={partnerPassword}
                  onChange={(e) => setPartnerPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Senha do(a) parceiro(a)"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (Conta Principal)
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
              {isLogin ? 'Sua Senha' : 'Senha da Conta'}
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
            {isLogin ? 'Entrar no Nosso Cantinho' : 'Criar Nosso Cantinho'}
          </button>
        </form>

        {!isLogin && (
          <div className="mt-4 p-4 bg-pink-50 rounded-lg">
            <p className="text-sm text-gray-600">
              💡 <strong>Dica:</strong> Vocês compartilharão a mesma conta, mas
              cada um terá sua senha pessoal para acessar seu perfil individual!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
