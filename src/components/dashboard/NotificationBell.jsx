import { useState, useEffect, useRef } from 'react';
import { Bell, X, Heart, Check, Gift } from 'lucide-react';
import Avatar from '../Avatar';

/**
 * NotificationBell - Sino de notificações com dropdown (desktop) e modal (mobile)
 *
 * @param {Object} props
 * @param {Array} props.notifications - Lista de notificações
 * @param {Function} props.onNotificationClick - Callback ao clicar em notificação
 * @param {Function} props.onMarkAsRead - Callback ao marcar como lida
 * @param {Function} props.onClearAll - Callback ao limpar todas
 */
export default function NotificationBell({
  notifications = [],
  onNotificationClick,
  onMarkAsRead,
  onClearAll,
  onMarkOne,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, isMobile]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification) => {
    onNotificationClick?.(notification);
    if (!isMobile) {
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'link_invite':
        return <Heart className="w-6 h-6 text-primary-500" />;
      case 'link_accepted':
        return <Heart className="w-6 h-6 text-primary-500" />;
      case 'new_surprise':
        return <Gift className="w-6 h-6 text-secondary-500" />;
      default:
        return <Bell className="w-6 h-6 text-accent-500" />;
    }
  };

  const getTitle = (n) => {
    if (n.title) return n.title;
    switch (n.type) {
      case 'link_invite':
        return `Convite de ${n.senderName || 'alguém'}`;
      case 'date_proposal':
        return `Proposta de ${n.senderName || 'parceiro'}`;
      case 'date_change_request':
        return `Alteração de ${n.senderName || 'parceiro'}`;
      case 'new_surprise':
        return `Nova surpresa`;
      default:
        return 'Notificação';
    }
  };

  const getMessage = (n) => {
    if (n.message) return n.message;
    switch (n.type) {
      case 'link_invite':
        return `${n.senderName || 'Alguém'} quer vincular as contas`;
      case 'date_proposal':
      case 'date_change_request':
        return n.proposedDate
          ? `Data sugerida: ${new Date(n.proposedDate).toLocaleDateString('pt-BR')}`
          : 'Há uma sugestão de data';
      case 'new_surprise':
        return 'Você recebeu uma nova surpresa';
      default:
        return '';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const NotificationList = () => (
    <div className="space-y-1">
      {notifications.length === 0 ? (
        <div className="text-center py-8 px-4">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">
            Nenhuma notificação
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Você está em dia!
          </p>
        </div>
      ) : (
        <>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              role="button"
              tabIndex={0}
              onClick={() => handleNotificationClick(notification)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNotificationClick(notification); } }}
              className={`w-full text-left p-3 rounded-lg transition-all hover:bg-gray-50 cursor-pointer ${
                !notification.read ? 'bg-primary-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Avatar
                    photoURL={notification.senderPhotoURL || notification.senderPhoto || notification.photoURL}
                    name={notification.senderName}
                    avatarBg={notification.senderAvatarBg || notification.avatarBg}
                    ring={true}
                    fallbackIcon={getNotificationIcon(notification.type)}
                    className="bg-gray-100"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-theme-primary">
                      {getTitle(notification)}
                    </p>
                    {!notification.read && (
                      <span className="text-[10px] uppercase tracking-wide bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">Novo</span>
                    )}
                  </div>
                  <p className="text-xs text-theme-secondary mt-1 line-clamp-2">
                    {getMessage(notification)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onMarkOne?.(notification); }}
                    className="ml-2 px-2 py-1 text-[11px] text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-md"
                    title="Marcar como lida"
                  >
                    Lida
                  </button>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-all"
      >
        <Bell className="w-6 h-6 text-gray-600" />

        {/* Badge de contagem */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Desktop: Dropdown */}
      {!isMobile && isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-scale-in">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-theme-primary">Notificações</h3>
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  onClearAll?.();
                  setIsOpen(false);
                }}
                className="text-xs text-primary-500 hover:text-primary-600 font-medium"
              >
                Limpar tudo
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            <NotificationList />
          </div>

          {/* Footer */}
          {notifications.filter((n) => !n.read).length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={() => {
                  onMarkAsRead?.();
                  setIsOpen(false);
                }}
                className="w-full text-center text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" />
                Marcar todas como lidas
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile: Modal */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in">
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-lg text-theme-primary">
                Notificações
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4">
              <NotificationList />
            </div>

            {/* Footer Actions */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-200 space-y-2 flex-shrink-0">
                {notifications.filter((n) => !n.read).length > 0 && (
                  <button
                    onClick={() => {
                      onMarkAsRead?.();
                    }}
                    className="w-full py-3 bg-primary-100 text-primary-600 rounded-xl font-medium hover:bg-primary-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Marcar todas como lidas
                  </button>
                )}
                <button
                  onClick={() => {
                    onClearAll?.();
                    setIsOpen(false);
                  }}
                  className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                  Limpar todas
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
