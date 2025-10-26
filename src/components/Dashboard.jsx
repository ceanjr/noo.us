import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { showToast } from './Toast';
import Modal from './Modal';
import ProfileSettings from './ProfileSettings';
import DashboardHeader from './dashboard/DashboardHeader';
import BottomNavigation from './dashboard/BottomNavigation';
import LinkPartnerModal from './dashboard/LinkPartnerModal';
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

export default function Dashboard({ profile, onLogout, userId, setModal }) {
  // UI State
  const [activeTab, setActiveTab] = useState('home');
  const [showSettings, setShowSettings] = useState(false);
  const [showLinkPartner, setShowLinkPartner] = useState(false);
  const [showNewSurprise, setShowNewSurprise] = useState(false);
  const [viewMode, setViewMode] = useState('constellation');
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [revealedSurprises, setRevealedSurprises] = useState(new Set());

  const handleRevealSurprise = (surpriseId) => {
    setRevealedSurprises((prev) => new Set(prev).add(surpriseId));
  };
  

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
  const { surprises, notifications, partnerProfile, loading } = useDashboardData(userId);

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

  // Handlers
  const handleCreateSurprise = async (newSurprise) => {
    if (!activeLink) {
      showToast('Vincule-se a alguém e selecione um vínculo principal!', 'error');
      return;
    }

    try {
      await addDoc(collection(db, 'surprises'), {
        senderId: userId,
        senderName: profile.name,
        senderPhotoURL: profile.photoURL || '',
        senderAvatarBg: profile.avatarBg || '',
        recipientId: activeLink.partnerId,
        recipientName: activeLink.partnerName,
        type: newSurprise.type,
        title: newSurprise.title,
        content: newSurprise.content,
        createdAt: new Date().toISOString(),
        viewed: false,
      });

      showToast('Surpresa criada com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao criar surpresa', 'error');
    }
  };

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
    setShowNewSurprise(true);
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
      {/* Settings Modal */}
      {showSettings && (
        <ProfileSettings
          profile={profile}
          userId={userId}
          onClose={() => setShowSettings(false)}
          setModal={setModal}
        />
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
            onCreateSurprise={() => setShowNewSurprise(true)}
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
            viewMode={viewMode}
            isPrivateMode={isPrivateMode}
            hasPartner={!!activeLink}
            partnerName={activeLink?.partnerName}
            onPeriodChange={handlePeriodChange}
            onViewModeChange={setViewMode}
            onPrivateModeToggle={() => setIsPrivateMode(!isPrivateMode)}
            onReact={handleReact}
            onCreateMoment={handleCreateMoment}
            revealedSurprises={revealedSurprises}
            onRevealSurprise={handleRevealSurprise}
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

      {showNewSurprise && (
        <CreateSurpriseModal
          onClose={() => setShowNewSurprise(false)}
          onSubmit={handleCreateSurprise}
          userId={userId}
        />
      )}
    </div>
  );
}




























