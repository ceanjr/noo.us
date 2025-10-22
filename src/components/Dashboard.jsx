import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import {
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Music,
  Calendar,
  Gift,
  LogOut,
  Trash2,
  Clock,
  User,
} from 'lucide-react';

export default function Dashboard({ profile, onLogout, userId }) {
  const [surprises, setSurprises] = useState([]);
  const [showNewSurprise, setShowNewSurprise] = useState(false);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [newSurprise, setNewSurprise] = useState({
    type: 'message',
    content: '',
    title: '',
  });

  useEffect(() => {
    // Carregar perfil do parceiro
    const loadPartnerProfile = async () => {
      if (profile.partnerId) {
        try {
          const partnerDoc = await getDoc(doc(db, 'users', profile.partnerId));
          if (partnerDoc.exists()) {
            setPartnerProfile(partnerDoc.data());
          }
        } catch (error) {
          console.error('Erro ao carregar perfil do parceiro:', error);
        }
      }
    };

    loadPartnerProfile();
  }, [profile.partnerId]);

  useEffect(() => {
    if (!userId) return;

    // Carregar surpresas recebidas
    const q = query(
      collection(db, 'surprises'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const surprisesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSurprises(surprisesData);
    });

    return () => unsubscribe();
  }, [userId]);

  const daysTogetherCalculator = () => {
    if (!profile.relationshipStart) return 0;
    const start = new Date(profile.relationshipStart);
    const today = new Date();
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleCreateSurprise = async (e) => {
    e.preventDefault();

    if (!profile.partnerId) {
      alert('Você precisa vincular com seu parceiro primeiro!');
      return;
    }

    try {
      await addDoc(collection(db, 'surprises'), {
        senderId: userId,
        senderName: profile.name,
        recipientId: profile.partnerId,
        recipientName: profile.partnerName,
        type: newSurprise.type,
        title: newSurprise.title,
        content: newSurprise.content,
        createdAt: new Date().toISOString(),
        viewed: false,
      });

      setNewSurprise({ type: 'message', content: '', title: '' });
      setShowNewSurprise(false);
      alert('Surpresa criada com sucesso! 💝');
    } catch (error) {
      alert('Erro ao criar surpresa: ' + error.message);
    }
  };

  const handleDeleteSurprise = async (surpriseId) => {
    if (confirm('Deseja realmente apagar esta surpresa?')) {
      try {
        await deleteDoc(doc(db, 'surprises', surpriseId));
      } catch (error) {
        alert('Erro ao deletar: ' + error.message);
      }
    }
  };

  const getSurpriseIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-6 h-6" />;
      case 'photo':
        return <ImageIcon className="w-6 h-6" />;
      case 'music':
        return <Music className="w-6 h-6" />;
      case 'date':
        return <Calendar className="w-6 h-6" />;
      default:
        return <Gift className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Olá, {profile.name}! 💝
              </h1>
              <p className="text-gray-600">
                {profile.partnerName
                  ? `Veja se ${profile.partnerName} deixou algo especial para você`
                  : 'Vincule sua conta com seu parceiro para começar'}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-xl">
              <div className="text-3xl font-bold text-pink-600">
                {daysTogetherCalculator()}
              </div>
              <div className="text-sm text-gray-600">dias juntos ❤️</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">
                {surprises.length}
              </div>
              <div className="text-sm text-gray-600">
                surpresas recebidas 🎁
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                <div className="text-sm text-gray-600">
                  {profile.partnerName ? (
                    <span>
                      Vinculado com <strong>{profile.partnerName}</strong>
                    </span>
                  ) : (
                    <span className="text-orange-600">Não vinculado ainda</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info de contato */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-sm text-gray-600">
              <strong>Suas informações:</strong>
              <div className="mt-2 space-y-1">
                {profile.email && <div>📧 {profile.email}</div>}
                {profile.phoneNumber && <div>📱 {profile.phoneNumber}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Botão Nova Surpresa */}
        {profile.partnerId && (
          <button
            onClick={() => setShowNewSurprise(true)}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-2xl font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg mb-6 flex items-center justify-center gap-2"
          >
            <Gift className="w-5 h-5" />
            Deixar uma Surpresa para {profile.partnerName}
          </button>
        )}

        {/* Modal Nova Surpresa */}
        {showNewSurprise && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6">Nova Surpresa 💝</h3>

              <form onSubmit={handleCreateSurprise} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Surpresa
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['message', 'photo', 'music', 'date'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewSurprise({ ...newSurprise, type })}
                        className={`p-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                          newSurprise.type === type
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200'
                        }`}
                      >
                        {getSurpriseIcon(type)}
                        <span className="text-sm capitalize">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newSurprise.title}
                    onChange={(e) =>
                      setNewSurprise({ ...newSurprise, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    placeholder="Ex: Para você, com amor"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {newSurprise.type === 'music'
                      ? 'Link da Música (YouTube/Spotify)'
                      : newSurprise.type === 'photo'
                      ? 'URL da Imagem'
                      : 'Mensagem'}
                  </label>
                  <textarea
                    value={newSurprise.content}
                    onChange={(e) =>
                      setNewSurprise({
                        ...newSurprise,
                        content: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 min-h-[100px]"
                    placeholder={
                      newSurprise.type === 'music'
                        ? 'Cole o link aqui...'
                        : newSurprise.type === 'photo'
                        ? 'Cole o URL da imagem aqui...'
                        : 'Escreva sua mensagem aqui...'
                    }
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewSurprise(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition"
                  >
                    Criar Surpresa
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Surpresas */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Suas Surpresas Recebidas 🎁
          </h2>

          {surprises.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {profile.partnerName
                  ? `Ainda não há surpresas... mas em breve ${profile.partnerName} pode deixar algo especial! 💕`
                  : 'Vincule sua conta para receber surpresas!'}
              </p>
            </div>
          ) : (
            surprises.map((surprise) => (
              <div
                key={surprise.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-pink-100 p-3 rounded-full text-pink-600">
                      {getSurpriseIcon(surprise.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{surprise.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {new Date(surprise.createdAt).toLocaleDateString(
                          'pt-BR'
                        )}
                        {' • De '}
                        {surprise.senderName}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSurprise(surprise.id)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="pl-14">
                  {surprise.type === 'photo' && (
                    <img
                      src={surprise.content}
                      alt="Surpresa"
                      className="rounded-lg max-w-full h-auto mb-2"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML +=
                          '<p class="text-red-500 text-sm">Erro ao carregar imagem</p>';
                      }}
                    />
                  )}

                  {surprise.type === 'music' && (
                    <a
                      href={surprise.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium"
                    >
                      <Music className="w-4 h-4" />
                      Ouvir Música
                    </a>
                  )}

                  {(surprise.type === 'message' ||
                    surprise.type === 'date') && (
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {surprise.content}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
