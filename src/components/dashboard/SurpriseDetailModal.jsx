import { X, Music, Image as ImageIcon, MessageCircle } from 'lucide-react';

const TYPE_LABEL = {
  music: 'Música',
  photo: 'Foto',
  message: 'Mensagem',
};

const TYPE_ICON = {
  music: Music,
  photo: ImageIcon,
  message: MessageCircle,
};

export default function SurpriseDetailModal({ surprise, onClose }) {
  if (!surprise) return null;

  const {
    type,
    title,
    content,
    author,
    date,
    reactions = [],
    subtitle,
    authorColor,
    original,
  } = surprise;

  const Icon = TYPE_ICON[type] || MessageCircle;
  const typeLabel = TYPE_LABEL[type] || 'Surpresa';
  const senderName = original?.senderName || author;
  const senderPhoto = original?.senderPhotoURL || original?.senderPhoto || null;
  const senderAvatarBg = original?.senderAvatarBg || original?.avatarBg || null;
  const hasSolidBg =
    typeof senderAvatarBg === 'string' && senderAvatarBg.trim().startsWith('#');
  const avatarFallbackClass = senderPhoto || hasSolidBg
    ? ''
    : `bg-gradient-to-r ${authorColor || 'from-primary-500 to-secondary-500'}`;

  const renderContent = () => {
    if (type === 'photo') {
      if (!content) {
        return (
          <p className="text-sm text-theme-secondary">
            Nenhuma imagem disponível para esta surpresa.
          </p>
        );
      }
      return (
        <img
          src={content}
          alt={title}
          className="w-full max-h-[420px] object-cover rounded-2xl shadow-lg"
        />
      );
    }

    if (type === 'music') {
      if (!content) {
        return (
          <p className="text-sm text-theme-secondary">
            Link da música não disponível.
          </p>
        );
      }
      return (
        <a
          href={content}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg hover:from-green-600 hover:to-emerald-600 transition"
        >
          <Music className="w-5 h-5" />
          Ouvir música
        </a>
      );
    }

    return (
      <p className="text-base leading-relaxed text-theme-primary whitespace-pre-wrap">
        {content}
      </p>
    );
  };

  const renderSubtitle = () => {
    if (!subtitle && !original?.subtitle) return null;
    return (
      <p className="text-sm text-theme-secondary">
        {subtitle || original?.subtitle}
      </p>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center px-4 py-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-theme-main rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/5 text-theme-secondary flex items-center justify-center hover:bg-black/10 transition"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0 ${avatarFallbackClass}`}
              style={hasSolidBg ? { backgroundColor: senderAvatarBg } : undefined}
            >
              {senderPhoto ? (
                <img
                  src={senderPhoto}
                  alt={senderName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-xl font-bold">
                  {senderName?.[0] || '??'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-600">
                <Icon className="w-4 h-4" />
                {typeLabel}
              </div>
              <h2 className="text-2xl font-display font-bold text-theme-primary mt-1 mb-1 leading-tight">
                {title}
              </h2>
              {renderSubtitle()}
              <p className="text-sm text-theme-secondary mt-2">
                Enviado por <span className="font-semibold">{senderName}</span>
                {date ? ` em ${date}` : ''}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-theme-secondary rounded-2xl p-6 border border-border-color space-y-4">
            {renderContent()}
          </div>

          {/* Reactions */}
          {reactions.length > 0 && (
            <div className="border-t border-border-color pt-4">
              <p className="text-sm font-semibold text-theme-secondary mb-2">
                Reações
              </p>
              <div className="flex flex-wrap gap-2">
                {reactions.map((reaction, index) => (
                  <span
                    key={`${reaction.userId || index}-${reaction.emoji}-${index}`}
                    className="px-3 py-1.5 bg-theme-secondary rounded-full border border-border-color text-sm text-theme-primary"
                  >
                    <span className="mr-1">{reaction.emoji}</span>
                    <span className="text-theme-secondary font-medium">
                      {reaction.userName}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}