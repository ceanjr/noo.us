import { Music, Image as ImageIcon, MessageCircle, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import ReactionBar from './ReactionBar';

export default function MomentCard({ moment, onReact, isPrivateMode, size = 'medium' }) {
  const [showReactions, setShowReactions] = useState(false);
  const [isBlurred, setIsBlurred] = useState(moment.isPrivate && isPrivateMode);

  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-40 h-40',
    large: 'w-48 h-48',
  };

  const getIcon = () => {
    switch (moment.type) {
      case 'music':
        return Music;
      case 'photo':
        return ImageIcon;
      case 'message':
        return MessageCircle;
      default:
        return MessageCircle;
    }
  };

  const getGradient = () => {
    switch (moment.type) {
      case 'music':
        return 'from-sunny-400 to-warm-500';
      case 'photo':
        return 'from-primary-500 to-secondary-500';
      case 'message':
        return 'from-accent-500 to-lime-500';
      default:
        return 'from-primary-500 to-secondary-500';
    }
  };

  const Icon = getIcon();

  return (
    <div
      className={`${sizeClasses[size]} group relative`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      <div
        className={`w-full h-full bg-theme-secondary rounded-xl border border-border-color shadow-sm
          transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer overflow-hidden
          ${isBlurred ? 'blur-md' : ''}`}
      >
        {/* Header */}
        <div className={`p-3 bg-gradient-to-r ${getGradient()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon className="w-4 h-4 text-white" />
              </div>
              {moment.isPrivate && (
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  {isBlurred ? (
                    <EyeOff className="w-3 h-3 text-white" />
                  ) : (
                    <Eye className="w-3 h-3 text-white" />
                  )}
                </div>
              )}
            </div>
            <span className="text-xs text-white/80 font-medium">{moment.time}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col h-[calc(100%-3.5rem)]">
          <h3 className="font-semibold text-sm text-theme-primary line-clamp-2 mb-1">
            {moment.title}
          </h3>
          <p className="text-xs text-theme-secondary line-clamp-2 mb-2">
            {moment.subtitle || moment.content}
          </p>

          {/* Author */}
          <div className="mt-auto">
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${moment.authorColor} flex items-center justify-center text-white text-xs font-bold`}>
                {moment.author[0]}
              </div>
              <span className="text-xs font-medium text-theme-secondary">{moment.author}</span>
            </div>
          </div>
        </div>

        {/* Music specific - link externo */}
        {moment.type === 'music' && moment.content && (
          <a
            href={moment.content}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5 text-white" />
          </a>
        )}
      </div>

      {/* Reaction Bar - aparece no hover */}
      {showReactions && !isBlurred && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-10">
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
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/30 transition-colors z-10"
        >
          {isBlurred ? (
            <EyeOff className="w-3.5 h-3.5 text-white" />
          ) : (
            <Eye className="w-3.5 h-3.5 text-white" />
          )}
        </button>
      )}
    </div>
  );
}
