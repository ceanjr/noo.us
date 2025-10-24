import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import MomentCard from './MomentCard';

export default function ImmersiveView({ moments, onReact, isPrivateMode, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Mínima distância de swipe (em px)
  const minSwipeDistance = 50;

  const currentMoment = moments[currentIndex];

  // Navegação
  const goToNext = () => {
    if (currentIndex < moments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Touch handlers para swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, moments.length]);

  if (!currentMoment) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center animate-fade-in">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
        <span className="text-white font-bold">
          {currentIndex + 1} / {moments.length}
        </span>
      </div>

      {/* Navigation Buttons - Desktop */}
      <div className="hidden md:block">
        {currentIndex > 0 && (
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all z-50"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}

        {currentIndex < moments.length - 1 && (
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all z-50"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        )}
      </div>

      {/* Moment Content - Swipeable */}
      <div
        className="w-full h-full flex items-center justify-center p-4"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="max-w-2xl w-full animate-scale-in">
          {/* Moment Card - Large Size */}
          <div className="flex justify-center mb-6">
            <MomentCard
              moment={{ ...currentMoment, size: 'large' }}
              onReact={onReact}
              isPrivateMode={isPrivateMode}
              size="large"
            />
          </div>

          {/* Moment Details */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{currentMoment.title}</h2>
            <p className="text-sm text-white/70 mb-4">
              Por {currentMoment.author} • {currentMoment.date}
            </p>

            {/* Content */}
            {currentMoment.type === 'message' && (
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {currentMoment.content}
              </p>
            )}

            {currentMoment.type === 'photo' && (
              <img
                src={currentMoment.content}
                alt={currentMoment.title}
                className="rounded-xl w-full max-h-96 object-cover"
              />
            )}

            {currentMoment.type === 'music' && (
              <div>
                <p className="mb-4">Link da música:</p>
                <a
                  href={currentMoment.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all"
                >
                  Ouvir Música →
                </a>
              </div>
            )}

            {/* Reactions */}
            {currentMoment.reactions && currentMoment.reactions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm text-white/70 mb-3">Reações:</p>
                <div className="flex flex-wrap gap-2">
                  {currentMoment.reactions.map((reaction, index) => (
                    <div
                      key={index}
                      className="bg-white/10 px-3 py-1.5 rounded-full text-sm"
                    >
                      <span className="mr-1">{reaction.emoji}</span>
                      <span className="text-white/70">{reaction.userName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {moments.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Swipe Hint - Show on first load */}
      {currentIndex === 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full animate-bounce-slow md:hidden">
          <span className="text-white text-sm">← Deslize para navegar →</span>
        </div>
      )}
    </div>
  );
}
