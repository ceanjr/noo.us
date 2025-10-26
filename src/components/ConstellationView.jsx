import { useEffect, useState } from "react";
import MomentCard from "./MomentCard";

// A simple pseudo-random generator to create stable layouts
const seededRandom = (seedStr) => {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762;
  for (let i = 0, k; i < seedStr.length; i++) {
    k = seedStr.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return (h1 ^ h2 ^ h3 ^ h4) >>> 0;
};

export default function ConstellationView({
  moments,
  onReact,
  isPrivateMode,
  revealedSurprises,
  onRevealSurprise,
}) {
  const [positionedMoments, setPositionedMoments] = useState([]);

  // Gerar posiÃ§Ãµes orgÃ¢nicas para os cards
  useEffect(() => {
    if (!moments || moments.length === 0) return;

    const positions = [];
    const gridSize = 200;
    const minDistance = 180;
    const topOffset = 50; // Add 50px offset from the top

    moments.forEach((moment, index) => {
      let position;
      let attempts = 0;
      const maxAttempts = 50;

      do {
        const seed = moment.id + index + attempts;
        const random1 = (seededRandom(seed + "top") % 1000) / 1000;
        const random2 = (seededRandom(seed + "left") % 1000) / 1000;

        const row = Math.floor(index / 3);
        const col = index % 3;

        position = {
          top: topOffset + row * gridSize + random1 * 100 - 50,
          left: col * gridSize + random2 * 100 - 50,
        };
        // Clamp to avoid negative offsets spilling outside container padding
        position.top = Math.max(0, position.top);
        position.left = Math.max(0, position.left);

        attempts++;

        const tooClose = positions.some((pos) => {
          const distance = Math.sqrt(
            Math.pow(position.top - pos.top, 2) +
              Math.pow(position.left - pos.left, 2)
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

  // Calcular conexÃµes entre cards prÃ³ximos
  const connections = [];
  const connectionDistance = 250;

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
            opacity: 1 - distance / connectionDistance,
          });
        }
      }
    });
  });

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ minHeight: "800px" }}
    >
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0, width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient
            id="connectionGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#fb923c" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
          </linearGradient>
        </defs>
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
            size={moment.size || "medium"}
            isRevealed={revealedSurprises.has(moment.id)}
            onReveal={() => onRevealSurprise(moment.id)}
          />
        </div>
      ))}
    </div>
  );
}


