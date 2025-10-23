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
  updateDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { showToast } from './Toast';
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
  X,
  Mail,
  Phone,
  Send,
  Check,
  AlertCircle,
  UserX,
  Users,
  Bell,
  Link as LinkIcon,
} from 'lucide-react';

export default function Dashboard({ profile, onLogout, userId, setModal }) {
  const [surprises, setSurprises] = useState([]);
  const [showNewSurprise, setShowNewSurprise] = useState(false);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [dateConflict, setDateConflict] = useState(null);
  const [showLinkPartner, setShowLinkPartner] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [partnerIdentifier, setPartnerIdentifier] = useState('');
  const [relationshipStartDate, setRelationshipStartDate] = useState('');
  const [newSurprise, setNewSurprise] = useState({
    type: 'message',
    content: '',
    title: '',
  });

  // Carregar perfil do parceiro
  useEffect(() => {
    const loadPartnerProfile = async () => {
      if (profile.partnerId) {
        try {
          const partnerDoc = await getDoc(doc(db, 'users', profile.partnerId));
          if (partnerDoc.exists()) {
            setPartnerProfile(partnerDoc.data());
          }
        } catch (error) {
          showToast('Erro ao carregar perfil do parceiro', 'error');
        }
      }
    };

    loadPartnerProfile();
  }, [profile.partnerId]);

  // Carregar surpresas
  useEffect(() => {
    if (!userId) return;

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

  // Carregar notificações
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notificationsData);
    });

    return () => unsubscribe();
  }, [userId]);

  // Carregar conflito de data
  useEffect(() => {
    if (!userId || !profile.partnerId) return;

    const q = query(
      collection(db, 'dateConflicts'),
      where('user1Id', '==', userId)
    );

    const q2 = query(
      collection(db, 'dateConflicts'),
      where('user2Id', '==', userId)
    );

    const unsubscribe1 = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setDateConflict({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
    });

    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      if (!snapshot.empty) {
        setDateConflict({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [userId, profile.partnerId]);

  const daysTogetherCalculator = () => {
    if (!profile.relationshipStart) return 0;
    const start = new Date(profile.relationshipStart);
    const today = new Date();
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleSendLinkInvite = async (e) => {
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
        showToast('Usuário não encontrado', 'error');
        return;
      }

      const partnerDoc = querySnapshot.docs[0];
      const partnerId = partnerDoc.id;
      const partnerData = partnerDoc.data();

      if (partnerId === userId) {
        showToast('Você não pode vincular com você mesmo!', 'error');
        return;
      }

      if (partnerData.partnerId) {
        showToast('Este usuário já está vinculado a outra pessoa', 'error');
        return;
      }

      // Verificar se já existe um convite pendente
      const existingInvites = query(
        collection(db, 'notifications'),
        where('senderId', '==', userId),
        where('recipientId', '==', partnerId),
        where('type', '==', 'link_invite'),
        where('status', '==', 'pending')
      );
      const existingSnapshot = await getDocs(existingInvites);

      if (!existingSnapshot.empty) {
        showToast('Você já enviou um convite para este usuário!', 'warning');
        return;
      }

      // Criar convite
      await addDoc(collection(db, 'notifications'), {
        type: 'link_invite',
        senderId: userId,
        senderName: profile.name,
        recipientId: partnerId,
        recipientName: partnerData.name,
        senderDate: relationshipStartDate,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      showToast('Convite enviado com sucesso!', 'success');
      setShowLinkPartner(false);
      setPartnerIdentifier('');
      setRelationshipStartDate('');
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      showToast('Erro ao enviar convite', 'error');
    }
  };

  const handleAcceptInvite = async (notification) => {
    setModal({
      isOpen: true,
      title: `Aceitar convite de ${notification.senderName}?`,
      customContent: (
        <div className="space-y-4">
          <p className="text-gray-600">
            {notification.senderName} quer vincular as contas de vocês!
          </p>
          <p className="text-sm text-gray-500">
            {notification.senderName} informou que o relacionamento começou em:{' '}
            <strong>
              {new Date(notification.senderDate).toLocaleDateString('pt-BR')}
            </strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quando você acha que o namoro começou?
            </label>
            <input
              type="date"
              id="recipient-date-input"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      ),
      type: 'info',
      showCancel: true,
      confirmText: 'Aceitar',
      onConfirm: async () => {
        const recipientDate = document.getElementById('recipient-date-input').value;
        if (!recipientDate) {
          showToast('Por favor, escolha a data!', 'warning');
          return;
        }

        try {
          const senderDate = notification.senderDate;
          const areDatesEqual = senderDate === recipientDate;

          // Vincular usuários
          await updateDoc(doc(db, 'users', userId), {
            partnerId: notification.senderId,
            partnerName: notification.senderName,
            relationshipStart: recipientDate,
          });

          await updateDoc(doc(db, 'users', notification.senderId), {
            partnerId: userId,
            partnerName: profile.name,
            relationshipStart: senderDate,
          });

          // Marcar notificação como aceita
          await updateDoc(doc(db, 'notifications', notification.id), {
            status: 'accepted',
            recipientDate: recipientDate,
          });

          // Se as datas forem diferentes, criar conflito
          if (!areDatesEqual) {
            await addDoc(collection(db, 'dateConflicts'), {
              user1Id: notification.senderId,
              user1Name: notification.senderName,
              user1Date: senderDate,
              user2Id: userId,
              user2Name: profile.name,
              user2Date: recipientDate,
              status: 'pending',
              createdAt: new Date().toISOString(),
            });

            showToast(
              'Vinculação realizada! Mas há uma surpresinha para vocês...',
              'success'
            );
          } else {
            showToast('Vinculação realizada com sucesso!', 'success');
          }

          // Recarregar página para atualizar perfil
          window.location.reload();
        } catch (error) {
          console.error('Erro ao aceitar convite:', error);
          showToast('Erro ao aceitar convite', 'error');
        }
      },
    });
  };

  const handleRejectInvite = async (notificationId) => {
    setModal({
      isOpen: true,
      title: 'Rejeitar convite?',
      message: 'Tem certeza que deseja rejeitar este convite?',
      type: 'warning',
      showCancel: true,
      confirmText: 'Rejeitar',
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, 'notifications', notificationId), {
            status: 'rejected',
          });
          showToast('Convite rejeitado', 'success');
        } catch (error) {
          showToast('Erro ao rejeitar convite', 'error');
        }
      },
    });
  };

  const handleProposeNewDate = async (newDate) => {
    if (!dateConflict) return;

    try {
      const isUser1 = dateConflict.user1Id === userId;
      const updateData = isUser1
        ? {
            user1ProposedDate: newDate,
            user1HasProposed: true,
            lastProposedBy: userId,
            lastProposedAt: new Date().toISOString(),
          }
        : {
            user2ProposedDate: newDate,
            user2HasProposed: true,
            lastProposedBy: userId,
            lastProposedAt: new Date().toISOString(),
          };

      await updateDoc(doc(db, 'dateConflicts', dateConflict.id), updateData);

      // Criar notificação para o parceiro
      const partnerId = isUser1 ? dateConflict.user2Id : dateConflict.user1Id;
      const partnerName = isUser1 ? dateConflict.user2Name : dateConflict.user1Name;

      await addDoc(collection(db, 'notifications'), {
        type: 'date_proposal',
        senderId: userId,
        senderName: profile.name,
        recipientId: partnerId,
        recipientName: partnerName,
        proposedDate: newDate,
        conflictId: dateConflict.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      showToast('Proposta enviada! Aguarde a resposta do seu parceiro.', 'success');
    } catch (error) {
      console.error('Erro ao propor nova data:', error);
      showToast('Erro ao propor nova data', 'error');
    }
  };

  const handleRespondToProposal = async (notification, accept) => {
    try {
      if (accept) {
        // Atualizar ambos os usuários com a nova data
        await updateDoc(doc(db, 'users', userId), {
          relationshipStart: notification.proposedDate,
        });
        await updateDoc(doc(db, 'users', notification.senderId), {
          relationshipStart: notification.proposedDate,
        });

        // Deletar conflito
        await deleteDoc(doc(db, 'dateConflicts', notification.conflictId));

        showToast('Data acordada com sucesso!', 'success');
      } else {
        // Apenas marcar notificação como rejeitada
        await updateDoc(doc(db, 'notifications', notification.id), {
          status: 'rejected',
        });
        showToast('Proposta rejeitada', 'success');
      }

      // Marcar notificação como resolvida
      await updateDoc(doc(db, 'notifications', notification.id), {
        status: accept ? 'accepted' : 'rejected',
      });

      window.location.reload();
    } catch (error) {
      console.error('Erro ao responder proposta:', error);
      showToast('Erro ao responder proposta', 'error');
    }
  };

  const handleUnlinkPartner = async () => {
    if (!profile.partnerId) return;

    setModal({
      isOpen: true,
      title: 'Desvincular contas?',
      message: `Tem certeza que deseja desvincular sua conta de ${profile.partnerName}? Todas as surpresas serão mantidas, mas vocês não estarão mais vinculados.`,
      type: 'warning',
      showCancel: true,
      confirmText: 'Desvincular',
      onConfirm: async () => {
        try {
          // Desvincular ambos os usuários
          await updateDoc(doc(db, 'users', userId), {
            partnerId: null,
            partnerName: null,
          });

          await updateDoc(doc(db, 'users', profile.partnerId), {
            partnerId: null,
            partnerName: null,
          });

          // Deletar conflitos pendentes
          const conflictsQuery = query(
            collection(db, 'dateConflicts'),
            where('user1Id', '==', userId)
          );
          const conflictsQuery2 = query(
            collection(db, 'dateConflicts'),
            where('user2Id', '==', userId)
          );

          const [snapshot1, snapshot2] = await Promise.all([
            getDocs(conflictsQuery),
            getDocs(conflictsQuery2),
          ]);

          const deletePromises = [
            ...snapshot1.docs.map((doc) => deleteDoc(doc.ref)),
            ...snapshot2.docs.map((doc) => deleteDoc(doc.ref)),
          ];

          await Promise.all(deletePromises);

          showToast('Contas desvinculadas com sucesso', 'success');
          window.location.reload();
        } catch (error) {
          console.error('Erro ao desvincular:', error);
          showToast('Erro ao desvincular contas', 'error');
        }
      },
    });
  };

  const handleCreateSurprise = async (e) => {
    e.preventDefault();

    if (!profile.partnerId) {
      showToast('Você precisa vincular com seu parceiro primeiro!', 'error');
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
      showToast('Surpresa criada com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao criar surpresa', 'error');
    }
  };

  const handleDeleteSurprise = async (surpriseId) => {
    setModal({
      isOpen: true,
      title: 'Excluir surpresa',
      message: 'Deseja realmente apagar esta surpresa?',
      type: 'warning',
      showCancel: true,
      confirmText: 'Excluir',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'surprises', surpriseId));
          showToast('Surpresa excluída', 'success');
        } catch (error) {
          showToast('Erro ao deletar surpresa', 'error');
        }
      },
    });
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

  const pendingNotifications = notifications.filter((n) => n.status === 'pending');

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Olá, {profile.name}!
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                {profile.partnerName
                  ? `Veja se ${profile.partnerName} deixou algo especial para você`
                  : 'Vincule sua conta com seu parceiro para começar'}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-6">
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-xl">
              <div className="text-2xl md:text-3xl font-bold text-pink-600">
                {daysTogetherCalculator()}
              </div>
              <div className="text-xs md:text-sm text-gray-600">dias juntos</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
              <div className="text-2xl md:text-3xl font-bold text-blue-600">
                {surprises.length}
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                surpresas recebidas
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                <div className="text-xs md:text-sm text-gray-600">
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

          {/* Botões de ação */}
          <div className="mt-4 flex flex-wrap gap-2">
            {!profile.partnerId && (
              <button
                onClick={() => setShowLinkPartner(true)}
                className="flex-1 min-w-[200px] bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg flex items-center justify-center gap-2"
              >
                <LinkIcon className="w-5 h-5" />
                Vincular com Parceiro
              </button>
            )}
            {profile.partnerId && (
              <button
                onClick={handleUnlinkPartner}
                className="flex-1 min-w-[200px] bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                <UserX className="w-5 h-5" />
                Desvincular
              </button>
            )}
          </div>
        </div>

        {/* Notificações pendentes */}
        {pendingNotifications.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-6 h-6 text-pink-500" />
              <h2 className="text-xl font-bold text-gray-800">
                Notificações ({pendingNotifications.length})
              </h2>
            </div>

            <div className="space-y-3">
              {pendingNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border-2 border-pink-200"
                >
                  {notification.type === 'link_invite' && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-pink-600" />
                        <h3 className="font-bold text-gray-800">
                          Convite de {notification.senderName}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {notification.senderName} quer vincular as contas de vocês!
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptInvite(notification)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          Aceitar
                        </button>
                        <button
                          onClick={() => handleRejectInvite(notification.id)}
                          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Rejeitar
                        </button>
                      </div>
                    </div>
                  )}

                  {notification.type === 'date_proposal' && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <h3 className="font-bold text-gray-800">
                          Proposta de data de {notification.senderName}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.senderName} propôs:{' '}
                        <strong>
                          {new Date(notification.proposedDate).toLocaleDateString(
                            'pt-BR'
                          )}
                        </strong>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespondToProposal(notification, true)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition"
                        >
                          Concordar
                        </button>
                        <button
                          onClick={() => handleRespondToProposal(notification, false)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition"
                        >
                          Discordar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conflito de data - "Surpresinha" */}
        {dateConflict && dateConflict.status === 'pending' && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border-4 border-pink-300">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">😮</div>
              <h2 className="text-2xl font-bold text-pink-600 mb-2">
                Ops! Temos uma surpresinha aqui...
              </h2>
              <p className="text-gray-600">
                Parece que vocês têm memórias diferentes sobre quando o namoro começou!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-pink-50 p-4 rounded-xl">
                <div className="font-semibold text-gray-800 mb-1">
                  {dateConflict.user1Name} disse:
                </div>
                <div className="text-2xl font-bold text-pink-600">
                  {new Date(dateConflict.user1Date).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <div className="font-semibold text-gray-800 mb-1">
                  {dateConflict.user2Name} disse:
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {new Date(dateConflict.user2Date).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-xl mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <strong>Que tal conversarem sobre isso?</strong> Vocês podem escolher
                  uma data juntos ou cada um pode propor uma nova data. Quando um de
                  vocês propor, o outro poderá aceitar ou propor outra.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setModal({
                  isOpen: true,
                  title: 'Propor nova data',
                  customContent: (
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Escolha a data que você quer propor:
                      </p>
                      <input
                        type="date"
                        id="new-date-input"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  ),
                  type: 'info',
                  showCancel: true,
                  confirmText: 'Propor',
                  onConfirm: () => {
                    const newDate = document.getElementById('new-date-input').value;
                    if (newDate) {
                      handleProposeNewDate(newDate);
                    }
                  },
                });
              }}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg"
            >
              Propor Nova Data
            </button>
          </div>
        )}

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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold">Nova Surpresa</h3>
                <button
                  onClick={() => setShowNewSurprise(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

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
                        className={`p-3 rounded-xl border-2 transition flex items-center justify-center gap-2 ${
                          newSurprise.type === type
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent min-h-[100px]"
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
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition font-medium"
                  >
                    Criar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Vincular Parceiro */}
        {showLinkPartner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold">Vincular Parceiro</h3>
                <button
                  onClick={() => setShowLinkPartner(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSendLinkInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email ou Telefone do(a) Parceiro(a)
                  </label>
                  <input
                    type="text"
                    value={partnerIdentifier}
                    onChange={(e) => setPartnerIdentifier(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="email@exemplo.com ou (11) 99999-9999"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quando começou o namoro?
                  </label>
                  <input
                    type="date"
                    value={relationshipStartDate}
                    onChange={(e) => setRelationshipStartDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">
                    Seu parceiro receberá um convite e também informará a data que
                    lembra. Se as datas forem diferentes, vocês poderão resolver juntos!
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLinkPartner(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition font-medium flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Convite
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Surpresas */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
            Suas Surpresas Recebidas
          </h2>

          {surprises.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 md:p-12 text-center">
              <Heart className="w-12 md:w-16 h-12 md:h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-sm md:text-base text-gray-500">
                {profile.partnerName
                  ? `Ainda não há surpresas... mas em breve ${profile.partnerName} pode deixar algo especial!`
                  : 'Vincule sua conta para receber surpresas!'}
              </p>
            </div>
          ) : (
            surprises.map((surprise) => (
              <div
                key={surprise.id}
                className="bg-white rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="bg-pink-100 p-3 rounded-full text-pink-600 flex-shrink-0">
                      {getSurpriseIcon(surprise.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base md:text-lg truncate">
                        {surprise.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 md:w-4 md:h-4" />
                          {new Date(surprise.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <span>•</span>
                        <span>De {surprise.senderName}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSurprise(surprise.id)}
                    className="text-gray-400 hover:text-red-500 transition flex-shrink-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="pl-0 md:pl-14">
                  {surprise.type === 'photo' && (
                    <img
                      src={surprise.content}
                      alt="Surpresa"
                      className="rounded-xl max-w-full h-auto mb-2"
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

                  {(surprise.type === 'message' || surprise.type === 'date') && (
                    <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap break-words">
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
