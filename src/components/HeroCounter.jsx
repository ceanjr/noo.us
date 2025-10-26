import { useState, useEffect } from 'react';
import { Music, Image, Flame } from 'lucide-react';

export default function HeroCounter({ musicCount, photoCount, streak }) {
  const [animatedMusic, setAnimatedMusic] = useState(0);
  const [animatedPhotos, setAnimatedPhotos] = useState(0);
  const [animatedStreak, setAnimatedStreak] = useState(0);

  // Animação de contagem
  useEffect(() => {
    const duration = 1500; // 1.5 segundos
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuad = 1 - Math.pow(1 - progress, 3);

      setAnimatedMusic(Math.floor(musicCount * easeOutQuad));
      setAnimatedPhotos(Math.floor(photoCount * easeOutQuad));
      setAnimatedStreak(Math.floor(streak * easeOutQuad));

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedMusic(musicCount);
        setAnimatedPhotos(photoCount);
        setAnimatedStreak(streak);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [musicCount, photoCount, streak]);

  const stats = [
    {
      label: 'Músicas',
      value: animatedMusic,
      icon: Music,
      color: 'text-secondary-600',
      iconBg: 'bg-secondary-500/10',
      iconColor: 'text-secondary-600',
    },
    {
      label: 'Fotos',
      value: animatedPhotos,
      icon: Image,
      color: 'text-accent-600',
      iconBg: 'bg-accent-500/10',
      iconColor: 'text-accent-600',
    },
    {
      label: 'Streak Atual',
      value: animatedStreak,
      icon: Flame,
      color: 'text-warm-600',
      iconBg: 'bg-warm-500/10',
      iconColor: 'text-warm-600',
    },
  ];

  return (
    <div className="bg-theme-secondary rounded-2xl p-6 border border-border-color shadow-sm">
      <div className="grid grid-cols-3 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="text-center animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.iconBg} mb-3`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className={`text-3xl lg:text-4xl font-display font-bold ${stat.color} mb-1`}>
                {stat.value.toLocaleString()}
              </div>
              <div className="text-xs text-theme-secondary font-medium">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
