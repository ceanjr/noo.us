import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { showToast } from './Toast';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import DashboardHeader from './dashboard/DashboardHeader';
import BottomNavigation from './dashboard/BottomNavigation';
import LinkPartnerModal from './dashboard/LinkPartnerModal';
import SelectRecipientModal from './dashboard/SelectRecipientModal';
import CreateSurpriseModal from './dashboard/CreateSurpriseModal';
import { useDashboardData } from '../hooks/useDashboardData';
import { useMoments } from '../hooks/useMoments';
import { usePartnerActions } from '../hooks/usePartnerActions';
import { useLinks } from '../hooks/useLinks';
import { useNotificationActions } from '../hooks/useNotificationActions';
import HomeTab from './dashboard/HomeTab';
import SurprisesTab from './dashboard/SurprisesTab';
import VinculosTab from './dashboard/VinculosTab';
import { Home, Gift, Users } from 'lucide-react';
import SurpriseDetailModal from './dashboard/SurpriseDetailModal';

// Lazy load de componentes pesados
const ProfileSettings = lazy(() => import('./ProfileSettings'));

export default function Dashboard({ profile, onLogout, userId, setModal }) {
  // UI State
  const [activeTab, setActiveTab] = useState('home');
  const [showSettings, setShowSettings] = useState(false);
  const [showLinkPartner, setShowLinkPartner] = useState(false);
  const [showSelectRecipient, setShowSelectRecipient] = useState(false);
  const [showNewSurprise, setShowNewSurprise] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [revealedSurprises, setRevealedSurprises] = useState(new Set());
  const [selectedSurprise, setSelectedSurprise] = useState(null);

  const handleRevealSurprise = useCallback(async (surpriseId) => {
    setRevealedSurprises((prev) => {
      const next = new Set(prev);
      next.add(surpriseId);
      return next;
    });

    try {
      await updateDoc(doc(db, 'surprises', surpriseId), {
        viewed: true,
      });
    } catch (error) {
      console.error('Erro ao marcar surpresa como vista:', error);
      showToast('Não foi possível marcar a surpresa como vista.', 'error');
    }
  }, []);

  const handleOpenSurpriseDetails = useCallback((moment) => {
    setSelectedSurprise(moment);
  }, []);

  const handleCloseSurpriseDetails = useCallback(() => {
    setSelectedSurprise(null);
  }, []);
  

  const { links } = useLinks(userId);
  const [activeLink, setActiveLink] = useState(null);
  // Persist and restore vínculo principal por usuário
  useEffect(() => {
    if (links && links.length > 0) {
      try {
        const key = `activeLink:${userId}`;
        const savedPartnerId = localStorage.getItem(key);
        const found = savedPartnerId ? links.find((l) => l.partnerId === savedPartnerId) : null;
        setActiveLink(found || links[0]);
      } catch {
        setActiveLink(links[0]);
      }
    } else {
      setActiveLink(null);
    }
  }, [links, userId]);

  const handleSetActiveLink = (link) => {
    setActiveLink(link);
    try {
      localStorage.setItem(`activeLink:${userId}`, link?.partnerId || '');
    } catch {}
  };

  // Custom Hooks
  const [modal, setModalLocal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const { surprises, notifications, partnerProfile, loading } = useDashboardData(
    userId,
    activeLink?.partnerId
  );

  useEffect(() => {
    if (!surprises || surprises.length === 0) return;
    const viewedIds = surprises.filter((s) => s.viewed).map((s) => s.id);
    if (viewedIds.length === 0) return;

    setRevealedSurprises((prev) => {
      const next = new Set(prev);
      viewedIds.forEach((id) => next.add(id));
      return next;
    });
  }, [surprises]);

  const {
    moments,
    filteredMoments,
    momentOfDay,
    selectedPeriod,
    setSelectedPeriod,
    musicCount,
    photoCount,
    streak,
  } = useMoments(surprises);

  const { handleSendLinkInvite, handleUnlinkPartner } = usePartnerActions(
    userId,
    profile,
    setModalLocal
  );

  const { acceptInvite, rejectInvite } = useNotificationActions(userId, profile);

  // Notification handlers with modal support
  const handleAcceptInvite = (notification) => {
    setModalLocal({
      isOpen: true,
      title: `Convite de ${notification.senderName}`,
      customContent: (
        <div className="space-y-4">
          <p className="text-gray-600">
            {notification.senderName} quer vincular as contas de vocês!
          </p>
          <div className="flex gap-2 pt-2">
            <button
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
              onClick={async () => { await acceptInvite(notification); setModalLocal((m) => ({ ...m, isOpen: false })); }}
            >
              Aceitar
            </button>
            <button
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg"
              onClick={async () => { await rejectInvite(notification.id); setModalLocal((m) => ({ ...m, isOpen: false })); }}
            >
              Rejeitar
            </button>
          </div>
        </div>
      ),
      type: 'info',
      confirmText: 'Fechar',
    });
  };

  const handleRejectInvite = (notificationId) => {
    setModalLocal({
      isOpen: true,
      title: 'Rejeitar convite?',
      message: 'Tem certeza que deseja rejeitar este convite?',
      type: 'warning',
      showCancel: true,
      confirmText: 'Rejeitar',
      onConfirm: async () => {
        await rejectInvite(notificationId);
      },
    });
  };

  const handleMarkNotificationRead = async (notification) => {
    try {
      if (!notification.read) {
        await updateDoc(doc(db, 'notifications', notification.id), { read: true });
      }
    } catch (e) {
      // noop
    }
  };

  // Notification bell handlers
  const handleNotificationClick = async (notification) => {
    // marcar como lida
    try {
      if (!notification.read) {
        await updateDoc(doc(db, 'notifications', notification.id), { read: true });
      }
    } catch (e) {
      // não bloqueia a ação
    }

    switch (notification.type) {
      case 'link_invite':
        handleAcceptInvite(notification);
        break;
      case 'new_surprise':
        setActiveTab('surprises');
        break;
      default:
        setActiveTab('surprises');
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      for (const notification of pendingNotifications) {
        if (!notification.read) {
          await updateDoc(doc(db, 'notifications', notification.id), {
            read: true,
          });
        }
      }
      showToast('Todas as notificações foram marcadas como lidas', 'success');
    } catch (error) {
      console.error('Erro ao marcar notificações:', error);
      showToast('Erro ao marcar notificações', 'error');
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      for (const notification of pendingNotifications) {
        await deleteDoc(doc(db, 'notifications', notification.id));
      }
      showToast('Todas as notificações foram removidas', 'success');
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
      showToast('Erro ao limpar notificações', 'error');
    }
  };

  const pendingNotifications = notifications.filter((n) => n.status === 'pending');

  // Handlers memoizados
  const handleCreateSurprise = useCallback(async (newSurprise) => {
    const recipient = selectedRecipient || activeLink;
    
    if (!recipient) {
      showToast('Selecione um destinatário para a surpresa!', 'error');
      return;
    }

    try {
      const surpriseDoc = await addDoc(collection(db, 'surprises'), {
        senderId: userId,
        senderName: profile.name,
        senderPhotoURL: profile.photoURL || '',
        senderAvatarBg: profile.avatarBg || '',
        recipientId: recipient.partnerId,
        recipientName: recipient.partnerName,
        type: newSurprise.type,
        title: newSurprise.title,
        content: newSurprise.content,
        createdAt: new Date().toISOString(),
        viewed: false,
      });

      // Criar notificação para o destinatário
      await addDoc(collection(db, 'notifications'), {
        userId: recipient.partnerId,
        type: 'new_surprise',
        title: `Nova surpresa de ${profile.name}!`,
        message: `Você recebeu uma nova ${newSurprise.type === 'message' ? 'mensagem' : newSurprise.type === 'photo' ? 'foto' : newSurprise.type === 'music' ? 'música' : 'surpresa'}!`,
        senderName: profile.name,
        senderPhotoURL: profile.photoURL || '',
        senderAvatarBg: profile.avatarBg || '',
        surpriseId: surpriseDoc.id,
        status: 'pending',
        read: false,
        createdAt: new Date().toISOString(),
      });

      showToast('Surpresa criada com sucesso!', 'success');
      handleCloseSurpriseModal();
    } catch (error) {
      console.error('Erro ao criar surpresa:', error);
      showToast('Erro ao criar surpresa', 'error');
    }
  }, [selectedRecipient, activeLink, userId, profile.name, profile.photoURL, profile.avatarBg]);

  const handleDeleteSurprise = async (surpriseId) => {
    setModalLocal({
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

  const handleCreateMoment = (type) => {
    // Abre modal de seleção de destinatário
    if (links.length === 0) {
      showToast('Vincule-se a alguém primeiro para enviar surpresas!', 'error');
      setShowLinkPartner(true);
      return;
    }
    setShowSelectRecipient(true);
  };

  const handleSelectRecipient = (link) => {
    setSelectedRecipient(link);
    setShowSelectRecipient(false);
    setShowNewSurprise(true);
  };

  const handleCloseSelectRecipient = () => {
    setShowSelectRecipient(false);
    setSelectedRecipient(null);
  };

  const handleCloseSurpriseModal = () => {
    setShowNewSurprise(false);
    setSelectedRecipient(null);
  };

  const handleReact = async (momentId, emoji) => {
    try {
      const surpriseRef = doc(db, 'surprises', momentId);
      const surpriseDoc = await getDoc(surpriseRef);

      if (surpriseDoc.exists()) {
        const currentReactions = surpriseDoc.data().reactions || [];
        const existingReactionIndex = currentReactions.findIndex(
          (r) => r.userId === userId && r.emoji === emoji
        );

        let updatedReactions;
        if (existingReactionIndex >= 0) {
          updatedReactions = currentReactions.filter((_, index) => index !== existingReactionIndex);
        } else {
          updatedReactions = [
            ...currentReactions,
            {
              userId,
              userName: profile.name,
              emoji,
              createdAt: new Date().toISOString(),
            },
          ];
        }

        await updateDoc(surpriseRef, {
          reactions: updatedReactions,
        });
      }
    } catch (error) {
      console.error('Erro ao reagir:', error);
      showToast('Erro ao reagir ao momento', 'error');
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Tabs configuration
  const tabs = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'surprises', label: 'Surpresas', icon: Gift },
  ];

  // Extend tabs shown in BottomNavigation with Vínculos
  const tabsNav = [
    ...tabs,
    { id: 'vinculos', label: 'Vínculos', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-bg-main pb-20 md:pb-8">
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModalLocal((m) => ({ ...m, isOpen: false }))}
        title={modal.title}
        message={modal.message}
        customContent={modal.customContent}
        type={modal.type}
        confirmText={modal.confirmText}
        showCancel={modal.showCancel}
        onConfirm={modal.onConfirm}
      />
      {/* Settings Modal com Lazy Loading */}
      {showSettings && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8">
              <LoadingSpinner size="lg" text="Carregando configurações..." />
            </div>
          </div>
        }>
          <ProfileSettings
            profile={profile}
            userId={userId}
            onClose={() => setShowSettings(false)}
            setModal={setModal}
          />
        </Suspense>
      )}

      {/* Header */}
      <DashboardHeader
        notifications={pendingNotifications}
        onNotificationClick={handleNotificationClick}
        onMarkAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAllNotifications}
        onMarkOne={handleMarkNotificationRead}
        onSettingsClick={() => setShowSettings(true)}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <HomeTab
            profile={profile}
            recentSurprises={surprises.slice().sort((a, b) =>
              new Date(b.createdAt) - new Date(a.createdAt)
            )}
            onLinkPartner={() => setShowLinkPartner(true)}
            onCreateSurprise={() => setShowSelectRecipient(true)}
            hasPartner={!!activeLink}
            partnerName={activeLink?.partnerName || ''}
            partnerAvatarBg={partnerProfile?.avatarBg || ''}
            revealedSurprises={revealedSurprises}
            onRevealSurprise={handleRevealSurprise}
          />
        )}

        {/* VÍNCULOS TAB */}
        {activeTab === 'vinculos' && (
          <VinculosTab
            profile={profile}
            onLinkPartner={() => setShowLinkPartner(true)}
            activePartnerId={activeLink?.partnerId}
            onSetActiveLink={handleSetActiveLink}
          />
        )}

        {/* SURPRISES TAB */}
        {activeTab === 'surprises' && (
          <SurprisesTab
            musicCount={musicCount}
            photoCount={photoCount}
            streak={streak}
            momentOfDay={momentOfDay}
            filteredMoments={filteredMoments}
            isPrivateMode={isPrivateMode}
            hasPartner={!!activeLink}
            partnerName={activeLink?.partnerName}
            onPeriodChange={handlePeriodChange}
            onPrivateModeToggle={() => setIsPrivateMode(!isPrivateMode)}
            onReact={handleReact}
            onCreateMoment={handleCreateMoment}
            revealedSurprises={revealedSurprises}
            onRevealSurprise={handleRevealSurprise}
            onOpenSurprise={handleOpenSurpriseDetails}
          />
        )}

      </div>

      {/* Bottom Navigation - Esconde quando settings está aberto */}
      {!showSettings && (
        <BottomNavigation
          tabs={tabsNav}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      {/* Modals */}
      {showLinkPartner && (
        <LinkPartnerModal
          onClose={() => setShowLinkPartner(false)}
          onSubmit={handleSendLinkInvite}
        />
      )}

      {showSelectRecipient && (
        <SelectRecipientModal
          onClose={handleCloseSelectRecipient}
          onSelectRecipient={handleSelectRecipient}
          links={links}
        />
      )}

      {showNewSurprise && (
        <CreateSurpriseModal
          onClose={handleCloseSurpriseModal}
          onSubmit={handleCreateSurprise}
          userId={userId}
          recipientName={selectedRecipient?.partnerName}
        />
      )}

      <SurpriseDetailModal
        surprise={selectedSurprise}
        onClose={handleCloseSurpriseDetails}
      />
    </div>
  );
}

























