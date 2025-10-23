import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { showToast } from './Toast';
import ProfileSettings from './ProfileSettings';
import DashboardHeader from './dashboard/DashboardHeader';
import BottomNavigation from './dashboard/BottomNavigation';
import LinkPartnerModal from './dashboard/LinkPartnerModal';
import CreateSurpriseModal from './dashboard/CreateSurpriseModal';
import HeroCounter from './HeroCounter';
import ConstellationView from './ConstellationView';
import CreateMomentFAB from './CreateMomentFAB';
import TimelineSlider from './TimelineSlider';
import MomentOfDay from './MomentOfDay';
import ImmersiveView from './ImmersiveView';
import { useDashboardData } from '../hooks/useDashboardData';
import { useMoments } from '../hooks/useMoments';
import { usePartnerActions } from '../hooks/usePartnerActions';
import { useNotificationActions } from '../hooks/useNotificationActions';
import HomeTab from './dashboard/HomeTab';
import SurprisesTab from './dashboard/SurprisesTab';
import InboxTab from './dashboard/InboxTab';
import { Home, Gift, Inbox, Eye, EyeOff, Sparkles, Search, Heart, User, Flame, Plus, LinkIcon, Calendar, X, Check, Users, Clock, Trash2, Music, MessageCircle, Image as ImageIcon } from 'lucide-react';

export default function Dashboard({ profile, onLogout, userId, setModal }) {
  // UI State
  const [activeTab, setActiveTab] = useState('home');
  const [showSettings, setShowSettings] = useState(false);
  const [showLinkPartner, setShowLinkPartner] = useState(false);
  const [showNewSurprise, setShowNewSurprise] = useState(false);
  const [viewMode, setViewMode] = useState('constellation');
  const [isPrivateMode, setIsPrivateMode] = useState(false);

  // Custom Hooks
  const { surprises, notifications, dateConflict, partnerProfile, loading } = useDashboardData(
    userId,
    profile.partnerId
  );

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
    setModal
  );

  const {
    acceptInvite,
    rejectInvite,
    respondToProposal,
    dateChangeResponse,
  } = useNotificationActions(userId, profile);

  // Notification handlers with modal support
  const handleAcceptInvite = (notification) => {
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
            <label className="block text-sm font-medium text-theme-secondary mb-2">
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
        await acceptInvite(notification, recipientDate);
      },
    });
  };

  const handleRejectInvite = (notificationId) => {
    setModal({
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

  const handleRespondToProposal = async (notification, accept) => {
    await respondToProposal(notification, accept);
  };

  const handleDateChangeResponse = async (notification, accept) => {
    await dateChangeResponse(notification, accept);
  };

  // Helpers
  const daysTogetherCalculator = () => {
    if (!profile.relationshipStart) return 0;
    const start = new Date(profile.relationshipStart);
    const today = new Date();
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysTogether = daysTogetherCalculator();
  const pendingNotifications = notifications.filter((n) => n.status === 'pending');

  // Handlers
  const handleCreateSurprise = async (newSurprise) => {
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
    { id: 'inbox', label: 'Caixa', icon: Inbox, badge: pendingNotifications.length },
  ];

  const getSurpriseIcon = (type) => {
    const icons = {
      message: <MessageCircle className="w-5 h-5" />,
      photo: <ImageIcon className="w-5 h-5" />,
      music: <Music className="w-5 h-5" />,
      date: <Calendar className="w-5 h-5" />,
    };
    return icons[type] || <Gift className="w-5 h-5" />;
  };

  const getSurpriseGradient = (type) => {
    const gradients = {
      message: 'from-blue-400 to-cyan-400',
      photo: 'from-purple-400 to-pink-400',
      music: 'from-green-400 to-emerald-400',
      date: 'from-orange-400 to-red-400',
    };
    return gradients[type] || 'from-pink-400 to-rose-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-20 md:pb-8">
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
        pendingNotificationsCount={pendingNotifications.length}
        onNotificationsClick={() => setActiveTab('inbox')}
        onSettingsClick={() => setShowSettings(true)}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <HomeTab
            profile={profile}
            daysTogether={daysTogether}
            surprisesCount={surprises.length}
            onLinkPartner={() => setShowLinkPartner(true)}
            onCreateSurprise={() => setShowNewSurprise(true)}
            onNavigateToSurprises={() => setActiveTab('surprises')}
            onNavigateToInbox={() => setActiveTab('inbox')}
          />
        )}

        {/* SURPRISES TAB */}
        {activeTab === 'surprises' && (
          <SurprisesTab
            daysTogether={daysTogether}
            musicCount={musicCount}
            photoCount={photoCount}
            streak={streak}
            momentOfDay={momentOfDay}
            filteredMoments={filteredMoments}
            viewMode={viewMode}
            isPrivateMode={isPrivateMode}
            hasPartner={!!profile.partnerId}
            partnerName={profile.partnerName}
            onPeriodChange={handlePeriodChange}
            onViewModeChange={setViewMode}
            onPrivateModeToggle={() => setIsPrivateMode(!isPrivateMode)}
            onReact={handleReact}
            onCreateMoment={handleCreateMoment}
          />
        )}

        {/* INBOX TAB */}
        {activeTab === 'inbox' && (
          <InboxTab
            notifications={pendingNotifications}
            onAcceptInvite={handleAcceptInvite}
            onRejectInvite={handleRejectInvite}
            onRespondToProposal={handleRespondToProposal}
            onDateChangeResponse={handleDateChangeResponse}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

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
        />
      )}
    </div>
  );
}
