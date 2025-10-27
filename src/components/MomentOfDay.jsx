import { Sparkles, Clock } from 'lucide-react';

export default function MomentOfDay({ moment }) {
  if (!moment) return null;

  const authorInitial = (moment.author || '?').charAt(0).toUpperCase();
  const authorImage = moment.authorPhotoURL || '';
  const hasAuthorPhoto = Boolean(authorImage) && !authorImage.includes('/images/icons/');
  const hasAuthorIcon = Boolean(authorImage) && authorImage.includes('/images/icons/');
  const avatarBgStyle =
    !hasAuthorPhoto && moment.authorAvatarBg
      ? { backgroundColor: moment.authorAvatarBg }
      : undefined;

  return (
    <div className="bg-gradient-to-r from-primary-500 via-secondary-400 to-accent-500 rounded-2xl p-[2px] shadow-lg animate-slide-down">
      <div className="bg-theme-main rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-theme-primary">
              Momento do Dia
            </h3>
            <p className="text-xs text-theme-secondary flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Memória de {moment.daysAgo} dias atrás
            </p>
          </div>
        </div>

        <div className="bg-theme-secondary rounded-xl p-4 border border-border-color">
          <div className="flex items-start gap-3">
            <div
              className={[
                'w-12',
                'h-12',
                'rounded-xl',
                'flex',
                'items-center',
                'justify-center',
                'flex-shrink-0',
                'shadow-md',
                hasAuthorPhoto ? 'overflow-hidden' : 'text-white text-xl font-bold',
                !hasAuthorPhoto && !moment.authorAvatarBg ? `bg-gradient-to-r ${moment.authorColor}` : '',
                !hasAuthorPhoto && hasAuthorIcon ? 'p-2' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={avatarBgStyle}
            >
              {hasAuthorPhoto ? (
                <img
                  src={authorImage}
                  alt={moment.author}
                  className="w-full h-full object-cover"
                />
              ) : hasAuthorIcon ? (
                <img
                  src={authorImage}
                  alt={moment.author}
                  className="w-full h-full object-contain"
                />
              ) : (
                authorInitial
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-theme-primary mb-1">{moment.title}</h4>
              <p className="text-sm text-theme-secondary line-clamp-3 mb-2">
                {moment.content}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-theme-secondary">
                  Por {moment.author}
                </span>
                <span className="text-xs text-primary-600 font-medium">
                  {moment.date}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
