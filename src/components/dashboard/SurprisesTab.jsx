import { Eye, EyeOff, Sparkles, Search, Gift } from 'lucide-react';
import HeroCounter from '../HeroCounter';
import MomentOfDay from '../MomentOfDay';
import TimelineSlider from '../TimelineSlider';
import ConstellationView from '../ConstellationView';
import ImmersiveView from '../ImmersiveView';
import CreateMomentFAB from '../CreateMomentFAB';

/**
 * SurprisesTab - Aba de Constellation Feed
 *
 * @param {Object} props
 * @param {number} props.daysTogether - Dias de relacionamento
 * @param {number} props.musicCount - Total de músicas
 * @param {number} props.photoCount - Total de fotos
 * @param {number} props.streak - Streak de atividade
 * @param {Object} props.momentOfDay - Momento especial do dia
 * @param {Array} props.filteredMoments - Momentos filtrados
 * @param {string} props.viewMode - 'constellation' ou 'immersive'
 * @param {boolean} props.isPrivateMode - Modo privado ativo
 * @param {boolean} props.hasPartner - Se usuário tem parceiro vinculado
 * @param {string} props.partnerName - Nome do parceiro
 * @param {Function} props.onPeriodChange - Callback mudança de período
 * @param {Function} props.onViewModeChange - Callback mudança de modo
 * @param {Function} props.onPrivateModeToggle - Callback toggle privado
 * @param {Function} props.onReact - Callback reação a momento
 * @param {Function} props.onCreateMoment - Callback criar momento
 */
export default function SurprisesTab({
  daysTogether,
  musicCount,
  photoCount,
  streak,
  momentOfDay,
  filteredMoments,
  viewMode,
  isPrivateMode,
  hasPartner,
  partnerName,
  onPeriodChange,
  onViewModeChange,
  onPrivateModeToggle,
  onReact,
  onCreateMoment,
}) {
  return (
    <div className="space-y-4">
      {/* Hero Counter */}
      <HeroCounter
        daysTogether={daysTogether}
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

        <div className="flex items-center gap-2">
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

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-theme-secondary rounded-xl p-1 border border-border-color shadow-sm">
            <button
              onClick={() => onViewModeChange('constellation')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'constellation'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : 'text-theme-secondary hover:bg-primary-500/10'
              }`}
              title="Modo Constelação"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('immersive')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'immersive'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : 'text-theme-secondary hover:bg-primary-500/10'
              }`}
              title="Modo Imersivo"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
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
      ) : viewMode === 'constellation' ? (
        <ConstellationView
          moments={filteredMoments}
          onReact={onReact}
          isPrivateMode={isPrivateMode}
        />
      ) : (
        <ImmersiveView
          moments={filteredMoments}
          onReact={onReact}
          isPrivateMode={isPrivateMode}
          onClose={() => onViewModeChange('constellation')}
        />
      )}

      {/* FAB */}
      {hasPartner && <CreateMomentFAB onCreate={onCreateMoment} />}
    </div>
  );
}
