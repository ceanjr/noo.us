import { Eye, EyeOff, Gift } from 'lucide-react';
import HeroCounter from '../HeroCounter';
import MomentOfDay from '../MomentOfDay';
import TimelineSlider from '../TimelineSlider';
import MomentsGrid from '../MomentsGrid';
import CreateMomentFAB from '../CreateMomentFAB';

/**
 * SurprisesTab - Aba de Moments Grid
 *
 * @param {Object} props
 * @param {number} props.daysTogether - Dias de relacionamento
 * @param {number} props.musicCount - Total de músicas
 * @param {number} props.photoCount - Total de fotos
 * @param {number} props.streak - Streak de atividade
 * @param {Object} props.momentOfDay - Momento especial do dia
 * @param {Array} props.filteredMoments - Momentos filtrados
 * @param {boolean} props.isPrivateMode - Modo privado ativo
 * @param {boolean} props.hasPartner - Se usuário tem parceiro vinculado
 * @param {string} props.partnerName - Nome do parceiro
 * @param {Function} props.onPeriodChange - Callback mudança de período
 * @param {Function} props.onPrivateModeToggle - Callback toggle privado
 * @param {Function} props.onReact - Callback reação a momento
 * @param {Function} props.onCreateMoment - Callback criar momento
 */
export default function SurprisesTab({
  musicCount,
  photoCount,
  streak,
  momentOfDay,
  filteredMoments,
  isPrivateMode,
  hasPartner,
  partnerName,
  onPeriodChange,
  onPrivateModeToggle,
  onReact,
  onCreateMoment,
  revealedSurprises,
  onRevealSurprise,
  onOpenSurprise,
}) {
  return (
    <div className="space-y-4 pb-24">
      {/* Hero Counter */}
      <HeroCounter
        musicCount={musicCount}
        photoCount={photoCount}
        streak={streak}
      />

      {/* Moment of Day */}
      {momentOfDay && <MomentOfDay moment={momentOfDay} />}

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Timeline Slider */}
        <div className="flex-1 min-w-[200px]">
          <TimelineSlider onPeriodChange={onPeriodChange} />
        </div>

        {/* Private Mode Toggle */}
        <button
          onClick={onPrivateModeToggle}
          className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border shadow-sm ${
            isPrivateMode
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500'
              : 'bg-theme-secondary text-theme-secondary border-border-color hover:bg-purple-500/10'
          }`}
          title={isPrivateMode ? 'Modo Privado Ativo' : 'Ativar Modo Privado'}
        >
          {isPrivateMode ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Views */}
      {filteredMoments.length === 0 ? (
        <div className="bg-theme-secondary rounded-2xl shadow-lg p-8 text-center">
          <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-400 mb-2">
            Nenhum momento neste período...
          </h3>
          <p className="text-gray-500 text-sm">
            {hasPartner
              ? `Experimente outro período ou crie novos momentos com ${partnerName}!`
              : 'Vincule sua conta para começar a receber momentos especiais!'}
          </p>
        </div>
      ) : (
        <MomentsGrid
          moments={filteredMoments}
          onReact={onReact}
          isPrivateMode={isPrivateMode}
          revealedSurprises={revealedSurprises}
          onRevealSurprise={onRevealSurprise}
          onOpenSurprise={onOpenSurprise}
        />
      )}

      {/* FAB */}
      {hasPartner && <CreateMomentFAB onCreate={onCreateMoment} />}
    </div>
  );
}
