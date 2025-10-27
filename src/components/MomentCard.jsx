import {
  Music,
  Image as ImageIcon,
  MessageCircle,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState, memo } from "react";
import ReactionBar from "./ReactionBar";

const typeVisuals = {
  photo: {
    gradient: "from-primary-400 to-primary-600",
    shadow: "shadow-[0_22px_42px_-28px_rgba(247,184,59,0.55)]",
  },
  music: {
    gradient: "from-secondary-400 to-secondary-600",
    shadow: "shadow-[0_24px_44px_-28px_rgba(232,100,133,0.55)]",
  },
  message: {
    gradient: "from-accent-400 to-accent-500",
    shadow: "shadow-[0_22px_42px_-28px_rgba(238,119,108,0.5)]",
  },
  default: {
    gradient: "from-neutral-400 to-neutral-600",
    shadow: "shadow-[0_20px_40px_-26px_rgba(124,58,237,0.45)]",
  },
};

export default function MomentCard({
  moment,
  onReact,
  isPrivateMode,
  size = "medium",
  isRevealed,
  onReveal,
  onOpen,
}) {
  const [showReactions, setShowReactions] = useState(false);
  const [isBlurred, setIsBlurred] = useState(moment.isPrivate && isPrivateMode);

  const sizeClasses = {
    small: "w-40 h-48",
    medium: "w-48 h-56",
    large: "w-56 h-64",
  };

  const getIcon = () => {
    switch (moment.type) {
      case "music":
        return Music;
      case "photo":
        return ImageIcon;
      case "message":
        return MessageCircle;
      default:
        return MessageCircle;
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case "music":
        return "Música";
      case "photo":
        return "Foto";
      case "message":
        return "Mensagem";
      default:
        return "Surpresa";
    }
  };

  const visuals = typeVisuals[moment.type] || typeVisuals.default;
  const Icon = getIcon();
  const authorInitial = (moment.author || "?").charAt(0).toUpperCase();
  const authorImage = moment.authorPhotoURL || "";
  const hasAuthorPhoto = Boolean(authorImage) && !authorImage.includes("/images/icons/");
  const hasAuthorIcon = Boolean(authorImage) && authorImage.includes("/images/icons/");
  const avatarBgStyle =
    !hasAuthorPhoto && moment.authorAvatarBg
      ? { backgroundColor: moment.authorAvatarBg }
      : undefined;
  const description = moment.subtitle || moment.content;

  if (!isRevealed) {
    return (
      <div className={`${sizeClasses[size]} group relative`} onClick={onReveal}>
        <div
          className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-100 px-6 text-center transition-all duration-300
            ${visuals.shadow} hover:scale-105 hover:border-primary-500/30 hover:shadow-2xl cursor-pointer`}
        >
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${visuals.gradient} opacity-10 transition-opacity duration-300 group-hover:opacity-20`}
          />
          <div className="relative flex flex-col items-center gap-4">
            <div className="rounded-2xl border border-neutral-200/50 bg-white/50 p-4 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <Icon className={`h-7 w-7 text-neutral-700`} />
            </div>
            <div className="w-8 h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent"></div>
            <div>
              <p className="font-semibold text-neutral-800">
                {getTypeName(moment.type)}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Clique para revelar
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} group relative`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      <div
        className={`relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-neutral-50 transition-all duration-300
          ${visuals.shadow} hover:scale-[1.02] hover:shadow-2xl`}
        onClick={() => onOpen?.(moment)}
      >
        <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200">
          {/* Header */}
          <div className="relative p-4 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${visuals.gradient}`} />
            <div className="absolute inset-0 bg-white/10" />
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex max-w-[75%] items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/25 p-2 shadow-md backdrop-blur-sm">
                  <Icon className="h-full w-full text-white" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-base font-semibold leading-tight text-white line-clamp-2">
                    {moment.title}
                  </h3>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-medium text-white/80">
                  {moment.time}
                </span>
                {moment.isPrivate && (
                  <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70">
                    Privado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative flex flex-1 flex-col gap-4 p-4">
            {description && (
              <p className="text-sm leading-relaxed text-neutral-500 line-clamp-3">
                {description}
              </p>
            )}

            {/* Author */}
            <div className="mt-auto border-t border-neutral-200 pt-3">
              <div className="flex items-center gap-3">
                <div
                  className={[
                    'h-10',
                    'w-10',
                    'rounded-full',
                    'shadow-md ring-2 ring-white/50',
                    hasAuthorPhoto
                      ? 'overflow-hidden'
                      : 'flex items-center justify-center text-white text-sm font-bold',
                    !hasAuthorPhoto && !moment.authorAvatarBg
                      ? `bg-gradient-to-r ${moment.authorColor}`
                      : '',
                    !hasAuthorPhoto && hasAuthorIcon ? 'p-1.5' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={avatarBgStyle}
                >
                  {hasAuthorPhoto ? (
                    <img
                      src={authorImage}
                      alt={moment.author}
                      className="h-full w-full object-cover"
                    />
                  ) : hasAuthorIcon ? (
                    <img
                      src={authorImage}
                      alt={moment.author}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    authorInitial
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-neutral-700">
                    {moment.author}
                  </span>
                  {moment.location && (
                    <span className="text-xs text-neutral-500">
                      {moment.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Music specific - link externo */}
          {moment.type === "music" && moment.content && (
            <a
              href={moment.content}
              target="_blank"
              rel="noopener noreferrer"
              className={`absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${visuals.gradient} text-white shadow-lg ring-2 ring-white/50 transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}

          {isBlurred && (
            <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-neutral-900/70 px-6 text-center backdrop-blur-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/25 backdrop-blur-sm">
                <EyeOff className="h-5 w-5 text-white" />
              </div>
              <p className="font-semibold text-white">
                Conteúdo privado
              </p>
              <p className="text-sm text-white/80">
                Use o botão no canto para revelar temporariamente.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reaction Bar - aparece no hover */}
      {showReactions && !isBlurred && (
        <div
          className="absolute -bottom-12 left-1/2 z-10 -translate-x-1/2"
          onClick={(e) => e.stopPropagation()}
        >
          <ReactionBar
            reactions={moment.reactions || []}
            onReact={(emoji) => onReact(moment.id, emoji)}
          />
        </div>
      )}

      {/* Toggle blur para cards privados */}
      {moment.isPrivate && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsBlurred(!isBlurred);
          }}
          className="absolute top-3 right-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-md ring-1 ring-white/20 transition-transform hover:scale-110"
        >
          {isBlurred ? (
            <EyeOff className="h-4 w-4 text-white" />
          ) : (
            <Eye className="h-4 w-4 text-white" />
          )}
        </button>
      )}
    </div>
  );
}

export default memo(MomentCard, (prevProps, nextProps) => {
  // Comparação personalizada para evitar re-renders desnecessários
  return (
    prevProps.moment.id === nextProps.moment.id &&
    prevProps.isRevealed === nextProps.isRevealed &&
    prevProps.isPrivateMode === nextProps.isPrivateMode &&
    prevProps.moment.reactions?.length === nextProps.moment.reactions?.length
  );
});
