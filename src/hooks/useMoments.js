import { useState, useEffect } from 'react';

export function useMoments(surprises) {
  const [moments, setMoments] = useState([]);
  const [filteredMoments, setFilteredMoments] = useState([]);
  const [momentOfDay, setMomentOfDay] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // Converter surpresas em momentos
  useEffect(() => {
    const convertedMoments = surprises.map((surprise) => {
      const createdDate = new Date(surprise.createdAt);
      const now = new Date();
      const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

      // Determinar o tamanho baseado no tipo e idade
      let size = 'medium';
      if (diffDays === 0) size = 'large';
      else if (diffDays > 30) size = 'small';

      // Determinar a cor do autor
      const authorColors = [
        'from-pink-500 to-rose-500',
        'from-purple-500 to-indigo-500',
        'from-blue-500 to-cyan-500',
        'from-green-500 to-emerald-500',
      ];
      const colorIndex = surprise.senderName
        ? surprise.senderName.length % 4
        : 0;

      return {
        id: surprise.id,
        type: surprise.type,
        title: surprise.title,
        content: surprise.content,
        author: surprise.senderName || 'Anônimo',
        authorColor: authorColors[colorIndex],
        date: createdDate.toLocaleDateString('pt-BR'),
        reactions: surprise.reactions || [],
        isPrivate: surprise.isPrivate || false,
        size,
        createdAt: surprise.createdAt,
        daysAgo: diffDays,
      };
    });

    setMoments(convertedMoments);

    // Selecionar momento do dia (memória aleatória de mais de 7 dias atrás)
    const oldMoments = convertedMoments.filter((m) => m.daysAgo >= 7);
    if (oldMoments.length > 0) {
      const randomIndex = Math.floor(Math.random() * oldMoments.length);
      setMomentOfDay(oldMoments[randomIndex]);
    }
  }, [surprises]);

  // Filtrar momentos por período
  useEffect(() => {
    const filterByPeriod = () => {
      let filtered = moments;

      if (selectedPeriod === 'today') {
        filtered = moments.filter((m) => m.daysAgo === 0);
      } else if (selectedPeriod === 'week') {
        filtered = moments.filter((m) => m.daysAgo <= 7);
      } else if (selectedPeriod === 'month') {
        filtered = moments.filter((m) => m.daysAgo <= 30);
      } else if (selectedPeriod === 'year') {
        filtered = moments.filter((m) => m.daysAgo <= 365);
      }

      setFilteredMoments(filtered);
    };

    filterByPeriod();
  }, [moments, selectedPeriod]);

  // Calcular estatísticas
  const musicCount = moments.filter((m) => m.type === 'music').length;
  const photoCount = moments.filter((m) => m.type === 'photo').length;

  // Calcular streak real baseado em atividade diária
  const calculateStreak = () => {
    if (moments.length === 0) return 0;

    const sortedMoments = [...moments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() - i);

      const hasActivity = sortedMoments.some((moment) => {
        const momentDate = new Date(moment.createdAt);
        momentDate.setHours(0, 0, 0, 0);
        return momentDate.getTime() === checkDate.getTime();
      });

      if (hasActivity) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  };

  const streak = calculateStreak();

  return {
    moments,
    filteredMoments,
    momentOfDay,
    selectedPeriod,
    setSelectedPeriod,
    musicCount,
    photoCount,
    streak,
  };
}
