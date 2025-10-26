export default function NewSurprisesPanel({ recentSurprises = [], profile, partnerAvatarBg = '' }) {
  const newOnes = (recentSurprises || []).filter((s) => !s.viewed);
  const total = newOnes.length;
  const byType = newOnes.reduce((acc, s) => {
    const t = s.type || 'outros';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const sender = newOnes[0];
  const photo = sender ? (sender.senderPhotoURL || sender.senderPhoto || sender.photoURL) : '';
  const name = sender ? (sender.senderName || '') : '';
  const bg = sender ? (sender.senderAvatarBg || sender.avatarBg || '') : '';
  const isIcon = photo && photo.includes('/images/icons/');

  return (
    <div className="bg-theme-secondary rounded-2xl border border-border-color shadow-sm p-4 sm:p-5">
      {total > 0 ? (
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div
              className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center ring-2 ring-white"
              style={{ backgroundColor: bg || partnerAvatarBg || profile?.avatarBg || undefined }}
            >
              <img
                src={photo || '/images/icons/neutral.png'}
                alt={name || 'Remetente'}
                className={`w-full h-full ${isIcon ? 'object-contain p-0.5' : 'object-cover'}`}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-theme-primary mb-1">
              Você tem {total} nova{total > 1 ? 's' : ''} surpresa{total > 1 ? 's' : ''}
            </h3>
            <p className="text-xs text-theme-secondary">
              {Object.entries(byType).map(([t, c], i, arr) => (
                <span key={t}>
                  {c} {t}
                  {c > 1 ? 's' : ''}
                  {i < arr.length - 1 ? ' · ' : ''}
                </span>
              ))}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-sm text-theme-secondary">Sem novas surpresas no momento.</div>
      )}
    </div>
  );
}

