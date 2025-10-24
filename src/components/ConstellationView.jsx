import { useEffect, useState } from 'react';
import MomentCard from './MomentCard';

export default function ConstellationView({ moments, onReact, isPrivateMode }) {
  const [positionedMoments, setPositionedMoments] = useState([]);

  // Gerar posições orgânicas para os cards
  useEffect(() => {
    if (!moments || moments.length === 0) return;

    // Algoritmo para distribuir cards de forma orgânica
    const positions = [];
    const gridSize = 200; // Espaço entre possíveis posições
    const minDistance = 180; // Distância mínima entre cards

    moments.forEach((moment, index) => {
      let position;
      let attempts = 0;
      const maxAttempts = 50;

      do {
        // Gerar posição aleatória
        const row = Math.floor(index / 3);
        const col = index % 3;

        position = {
          top: row * gridSize + Math.random() * 100 - 50,
          left: col * gridSize + Math.random() * 100 - 50,
        };

        attempts++;

        // Verificar se está muito perto de outros cards
        const tooClose = positions.some((pos) => {
          const distance = Math.sqrt(
            Math.pow(position.top - pos.top, 2) + Math.pow(position.left - pos.left, 2)
          );
          return distance < minDistance;
        });

        if (!tooClose || attempts >= maxAttempts) {
          break;
        }
      } while (true);

      positions.push(position);
    });

    const positioned = moments.map((moment, index) => ({
      ...moment,
      position: positions[index],
    }));

    setPositionedMoments(positioned);
  }, [moments]);

  // Calcular conexões entre cards próximos
  const connections = [];
  const connectionDistance = 250; // Distância máxima para criar conexão

  positionedMoments.forEach((moment1, index1) => {
    positionedMoments.forEach((moment2, index2) => {
      if (index1 < index2) {
        const distance = Math.sqrt(
          Math.pow(moment1.position.left - moment2.position.left, 2) +
          Math.pow(moment1.position.top - moment2.position.top, 2)
        );

        if (distance < connectionDistance) {
          connections.push({
            x1: moment1.position.left + 80, // Centro do card (width/2)
            y1: moment1.position.top + 80,
            x2: moment2.position.left + 80,
            y2: moment2.position.top + 80,
            opacity: 1 - (distance / connectionDistance), // Mais transparente quanto mais longe
          });
        }
      }
    });
  });

  return (
    <div className="relative w-full" style={{ minHeight: '800px' }}>
      {/* SVG para conexões */}
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#fb923c" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {/* Linhas conectando cards próximos */}
        {connections.map((conn, index) => (
          <line
            key={index}
            x1={conn.x1}
            y1={conn.y1}
            x2={conn.x2}
            y2={conn.y2}
            stroke="url(#connectionGradient)"
            strokeWidth="2"
            strokeOpacity={conn.opacity * 0.4}
            strokeDasharray="5,5"
            className="animate-pulse-slow"
          />
        ))}
      </svg>

      {/* Cards posicionados */}
      {positionedMoments.map((moment, index) => (
        <div
          key={moment.id}
          className="absolute transition-all duration-300 animate-slide-up"
          style={{
            top: `${moment.position.top}px`,
            left: `${moment.position.left}px`,
            animationDelay: `${index * 100}ms`,
            zIndex: 1,
          }}
        >
          <MomentCard
            moment={moment}
            onReact={onReact}
            isPrivateMode={isPrivateMode}
            size={moment.size || 'medium'}
          />
        </div>
      ))}
    </div>
  );
}
