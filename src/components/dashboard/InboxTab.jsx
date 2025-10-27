import { Inbox, Users, Calendar, Check, X } from 'lucide-react';

/**
 * InboxTab - Aba de caixa de entrada do Dashboard
 *
 * @param {Object} props
 * @param {Array} props.notifications - Lista de notificações pendentes
 * @param {Function} props.onAcceptInvite - Callback para aceitar convite de vinculação
 * @param {Function} props.onRejectInvite - Callback para rejeitar convite
 * @param {Function} props.onRespondToProposal - Callback para responder proposta de data
 * @param {Function} props.onDateChangeResponse - Callback para responder mudança de data
 */
export default function InboxTab({
  notifications,
  onAcceptInvite,
  onRejectInvite,
  onRespondToProposal,
  onDateChangeResponse,
}) {
  const getAvatar = (n) => {
    const photo = n.senderPhotoURL || n.senderPhoto || n.photoURL || '';
    const bg = n.senderAvatarBg || n.avatarBg || '';
    const isIcon = photo && photo.includes('/images/icons/');
    const FallbackIcon = n.type === 'link_invite' ? Users : Calendar;
    if (photo) {
      return (
        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center ring-2 ring-white" style={{ backgroundColor: bg || undefined }}>
          <img src={photo} alt={n.senderName || 'Remetente'} className={`w-full h-full ${isIcon ? 'object-contain p-1' : 'object-cover'}`} />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-white">
        <FallbackIcon className="w-6 h-6 text-gray-500" />
      </div>
    );
  };
  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
        Caixa de Entrada
      </h2>

      {notifications.length === 0 ? (
        <div className="bg-theme-secondary rounded-2xl shadow-lg p-8 text-center">
          <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-400 mb-2">
            Nenhuma notificação pendente
          </h3>
          <p className="text-gray-500 text-sm">Você está em dia com tudo!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-theme-secondary rounded-2xl shadow-lg p-4 border-2 border-pink-300"
            >
              {/* Link Invite Notification */}
              {notification.type === 'link_invite' && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0">
                      {getAvatar(notification)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-theme-primary mb-0.5">
                        Convite de {notification.senderName}
                      </h3>
                      <p className="text-sm font-medium text-theme-secondary">
                        Quer conectar com você!
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onAcceptInvite(notification)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Aceitar
                    </button>
                    <button
                      onClick={() => onRejectInvite(notification.id)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Rejeitar
                    </button>
                  </div>
                </div>
              )}

              {/* Date Proposal Notification */}
              {notification.type === 'date_proposal' && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0">
                      {getAvatar(notification)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-theme-primary mb-0.5">
                        Proposta de {notification.senderName}
                      </h3>
                      <p className="text-sm font-medium text-theme-secondary">
                        Nova data:{' '}
                        <strong className="text-purple-600">
                          {new Date(notification.proposedDate).toLocaleDateString('pt-BR')}
                        </strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onRespondToProposal(notification, true)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                    >
                      Concordar
                    </button>
                    <button
                      onClick={() => onRespondToProposal(notification, false)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                    >
                      Discordar
                    </button>
                  </div>
                </div>
              )}

              {/* Date Change Request Notification */}
              {notification.type === 'date_change_request' && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0">
                      {getAvatar(notification)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-theme-primary mb-0.5">
                        Solicitação de {notification.senderName}
                      </h3>
                      <p className="text-sm font-medium text-theme-secondary">
                        Quer mudar a data do relacionamento para:{' '}
                        <strong className="text-orange-600">
                          {new Date(notification.proposedDate).toLocaleDateString('pt-BR')}
                        </strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onDateChangeResponse(notification, true)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                    >
                      Aceitar
                    </button>
                    <button
                      onClick={() => onDateChangeResponse(notification, false)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
