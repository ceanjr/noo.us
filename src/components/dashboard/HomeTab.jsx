import { useState, useEffect } from 'react';
import {
  Heart,
  User,
  Music,
  Plus,
  LinkIcon,
} from 'lucide-react';
import trechos from '../../data/trechos.json';
import MomentCard from '../MomentCard';
import DailyQuotePanel from './DailyQuotePanel';
import NewSurprisesPanel from './NewSurprisesPanel';

/**
 * HomeTab - Aba inicial do Dashboard
 *
 * @param {Object} props
 * @param {Object} props.profile - Perfil do usuário atual
 * @param {Array} props.recentSurprises - Surpresas recentes
 * @param {Function} props.onLinkPartner - Callback para vincular parceiro
 * @param {Function} props.onCreateSurprise - Callback para criar surpresa
 * @param {Set} props.revealedSurprises - Set of revealed surprise IDs
 * @param {Function} props.onRevealSurprise - Handler to reveal a surprise
 * @param {string} [props.partnerAvatarBg] - Cor de fundo do avatar do parceiro
 */
export default function HomeTab({
  profile,
  recentSurprises = [],
  onLinkPartner,
  onCreateSurprise,
  hasPartner = false,
  partnerName = '',
  partnerAvatarBg = '',
  revealedSurprises,
  onRevealSurprise,
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
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden" style={{ backgroundColor: profile.avatarBg || undefined }}>
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.name}
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <img
                  src="/images/icons/neutral.png"
                  alt="Avatar"
                  className="w-full h-full object-contain p-1"
                />
              )}
            </div>
            {hasPartner && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 p-1 rounded-full">
                <Heart className="w-3 h-3 text-white" fill="white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-theme-primary truncate">
              {profile.name}
            </h2>
            {partnerName && (
              <p className="text-sm sm:text-base text-theme-secondary flex items-center gap-1 mt-1">
                <Heart
                  className="w-4 h-4 text-primary-500"
                  fill="currentColor"
                />
                <span className="truncate">Com {partnerName}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Trecho Musical do Dia */}
      <DailyQuotePanel dailyQuote={dailyQuote} />

      {/* Painel de Novas Surpresas */}
      <NewSurprisesPanel
        recentSurprises={recentSurprises}
        profile={profile}
        partnerAvatarBg={partnerAvatarBg}
      />

      {/* CTA Button */}
      {!hasPartner ? (
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



