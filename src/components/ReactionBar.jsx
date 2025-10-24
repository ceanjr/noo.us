import { useState } from 'react';

const defaultEmojis = ['❤️', '😍', '😂', '🔥', '🥺', '💜'];

export default function ReactionBar({ reactions = [], onReact }) {
  const [hoveredEmoji, setHoveredEmoji] = useState(null);

  return (
    <div className="bg-theme-secondary rounded-full px-2 py-1.5 shadow-lg border border-border-color flex items-center gap-1 animate-scale-in">
      {defaultEmojis.map((emoji, index) => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          onMouseEnter={() => setHoveredEmoji(emoji)}
          onMouseLeave={() => setHoveredEmoji(null)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
            ${hoveredEmoji === emoji ? 'scale-125 bg-primary-500/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
          `}
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          <span className="text-base">{emoji}</span>
        </button>
      ))}
    </div>
  );
}
