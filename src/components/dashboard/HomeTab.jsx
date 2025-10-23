import { Heart, User, Flame, Gift, Plus, LinkIcon, Inbox } from 'lucide-react';

/**
 * HomeTab - Aba inicial do Dashboard
 *
 * @param {Object} props
 * @param {Object} props.profile - Perfil do usuário atual
 * @param {number} props.daysTogether - Dias de relacionamento
 * @param {number} props.surprisesCount - Total de surpresas
 * @param {Function} props.onLinkPartner - Callback para vincular parceiro
 * @param {Function} props.onCreateSurprise - Callback para criar surpresa
 * @param {Function} props.onNavigateToSurprises - Callback para ir à aba surpresas
 * @param {Function} props.onNavigateToInbox - Callback para ir à caixa de entrada
 */
export default function HomeTab({
  profile,
  daysTogether,
  surprisesCount,
  onLinkPartner,
  onCreateSurprise,
  onNavigateToSurprises,
  onNavigateToInbox,
}) {
  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="bg-theme-secondary rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-400 via-secondary-400 to-accent-400 flex items-center justify-center shadow-lg overflow-hidden">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              )}
            </div>
            {profile.partnerId && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 p-1 rounded-full">
                <Heart className="w-3 h-3 text-white" fill="white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
              {profile.name}
            </h2>
            {profile.partnerName && (
              <p className="text-sm sm:text-base text-gray-600 flex items-center gap-1 mt-1">
                <Heart className="w-4 h-4 text-primary-500" fill="currentColor" />
                <span className="truncate">Com {profile.partnerName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-theme-secondary p-4 rounded-xl border-2 border-pink-300 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-1.5 rounded-lg">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-bold text-theme-secondary">
                Dias Juntos
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-pink-600">
              {daysTogether}
            </div>
          </div>

          <div className="bg-theme-secondary p-4 rounded-xl border-2 border-purple-300 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-1.5 rounded-lg">
                <Gift className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-bold text-theme-secondary">
                Surpresas
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-purple-600">
              {surprisesCount}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          {!profile.partnerId ? (
            <button
              onClick={onLinkPartner}
              className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <LinkIcon className="w-5 h-5" />
              <span>Vincular Parceiro</span>
            </button>
          ) : (
            <button
              onClick={onCreateSurprise}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Surpresa</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {profile.partnerId && (
        <div className="bg-theme-secondary rounded-2xl shadow-lg p-4">
          <h3 className="font-bold text-theme-primary mb-3 text-sm">
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onNavigateToSurprises}
              className="p-3 bg-theme-secondary hover:bg-purple-50 rounded-xl transition-all border-2 border-purple-300 hover:border-purple-400 flex flex-col items-center gap-1.5 shadow-sm hover:shadow-md"
            >
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold text-theme-primary">
                Ver Surpresas
              </span>
            </button>
            <button
              onClick={onNavigateToInbox}
              className="p-3 bg-theme-secondary hover:bg-blue-50 rounded-xl transition-all border-2 border-blue-300 hover:border-blue-400 flex flex-col items-center gap-1.5 shadow-sm hover:shadow-md"
            >
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-lg">
                <Inbox className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold text-theme-primary">
                Caixa de Entrada
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
