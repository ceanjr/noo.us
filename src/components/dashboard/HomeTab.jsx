import { useState, useEffect } from 'react';
import {
  Heart,
  User,
  Music,
  MessageCircle,
  Image as ImageIcon,
  Calendar,
  Plus,
  LinkIcon,
} from 'lucide-react';
import trechos from '../../data/trechos.json';

/**
 * HomeTab - Aba inicial do Dashboard
 *
 * @param {Object} props
 * @param {Object} props.profile - Perfil do usuário atual
 * @param {number} props.daysTogether - Dias de relacionamento
 * @param {Array} props.recentSurprises - Surpresas recentes
 * @param {Function} props.onLinkPartner - Callback para vincular parceiro
 * @param {Function} props.onCreateSurprise - Callback para criar surpresa
 */
export default function HomeTab({
  profile,
  daysTogether,
  recentSurprises = [],
  onLinkPartner,
  onCreateSurprise,
}) {
  const [dailyQuote, setDailyQuote] = useState(null);

  // Seleciona um trecho aleatório por dia
  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('dailyQuoteDate');
    const savedQuote = localStorage.getItem('dailyQuote');

    if (savedDate === today && savedQuote) {
      setDailyQuote(JSON.parse(savedQuote));
    } else {
      const randomQuote = trechos[Math.floor(Math.random() * trechos.length)];
      setDailyQuote(randomQuote);
      localStorage.setItem('dailyQuoteDate', today);
      localStorage.setItem('dailyQuote', JSON.stringify(randomQuote));
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="bg-theme-secondary rounded-2xl border border-border-color shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg overflow-hidden">
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
            <h2 className="text-xl sm:text-2xl font-display font-bold text-theme-primary truncate">
              {profile.name}
            </h2>
            {profile.partnerName && (
              <p className="text-sm sm:text-base text-theme-secondary flex items-center gap-1 mt-1">
                <Heart
                  className="w-4 h-4 text-primary-500"
                  fill="currentColor"
                />
                <span className="truncate">Com {profile.partnerName}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Trecho Musical do Dia */}
      {dailyQuote && (
        <div className="bg-secondary-50 rounded-2xl border border-secondary-200 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="bg-secondary-500 p-3 rounded-xl shadow-md flex-shrink-0">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-secondary-600 mb-2">
                Trecho do Dia
              </h3>
              <p className="text-base sm:text-lg italic text-theme-primary mb-2 leading-relaxed">
                "{dailyQuote.trecho}"
              </p>
              <p className="text-sm text-theme-secondary font-medium">
                — {dailyQuote.artista}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Feed de Surpresas Recentes */}
      {recentSurprises.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-theme-secondary px-1">
            Surpresas Recentes
          </h3>
          <div className="space-y-2">
            {recentSurprises.slice(0, 5).map((surprise) => {
              const getSurpriseIcon = (type) => {
                const icons = {
                  message: MessageCircle,
                  photo: ImageIcon,
                  music: Music,
                  date: Calendar,
                };
                return icons[type] || MessageCircle;
              };

              const getSurpriseColor = (type) => {
                switch (type) {
                  case 'message':
                    return 'bg-accent-500';
                  case 'photo':
                    return 'bg-primary-500';
                  case 'music':
                    return 'bg-secondary-500';
                  case 'date':
                    return 'bg-lime-500';
                  default:
                    return 'bg-primary-500';
                }
              };

              const Icon = getSurpriseIcon(surprise.type);
              const colorClass = getSurpriseColor(surprise.type);

              return (
                <div
                  key={surprise.id}
                  className="bg-theme-secondary rounded-xl border border-border-color shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`${colorClass} p-2 rounded-lg flex-shrink-0 shadow-sm`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-bold text-theme-primary text-sm truncate">
                          {surprise.title}
                        </h4>
                        <span className="text-xs text-theme-secondary whitespace-nowrap">
                          {new Date(surprise.createdAt).toLocaleDateString(
                            'pt-BR',
                            {
                              day: '2-digit',
                              month: 'short',
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-theme-secondary line-clamp-2">
                        {surprise.content}
                      </p>
                      <p className="text-xs text-theme-secondary mt-1">
                        De: {surprise.senderName}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA Button */}
      {!profile.partnerId ? (
        <button
          onClick={onLinkPartner}
          className="w-full bg-accent-500 hover:bg-accent-600 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <LinkIcon className="w-5 h-5" />
          <span>Vincular Parceiro</span>
        </button>
      ) : (
        <button
          onClick={onCreateSurprise}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Criar Nova Surpresa</span>
        </button>
      )}
    </div>
  );
}
