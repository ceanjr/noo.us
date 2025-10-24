import { useState } from 'react';
import { Plus, Music, Image, MessageCircle, X } from 'lucide-react';

export default function CreateMomentFAB({ onCreate }) {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { type: 'music', icon: Music, label: 'Música', gradient: 'from-primary-500 to-primary-600', angle: -60 },
    { type: 'photo', icon: Image, label: 'Foto', gradient: 'from-accent-500 to-accent-600', angle: 0 },
    { type: 'message', icon: MessageCircle, label: 'Mensagem', gradient: 'from-secondary-400 to-secondary-500', angle: 60 },
  ];

  const handleOptionClick = (type) => {
    onCreate(type);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Options - Menu Radial */}
      {isOpen && (
        <div className="absolute bottom-16 right-0">
          {options.map((option, index) => {
            const Icon = option.icon;
            const radius = 80;
            const angleRad = (option.angle * Math.PI) / 180;
            const x = radius * Math.cos(angleRad);
            const y = radius * Math.sin(angleRad);

            return (
              <button
                key={option.type}
                onClick={() => handleOptionClick(option.type)}
                className={`absolute w-12 h-12 rounded-full bg-gradient-to-r ${option.gradient}
                  shadow-lg flex items-center justify-center text-white
                  transition-all duration-300 hover:scale-110`}
                style={{
                  bottom: `${-y}px`,
                  right: `${x}px`,
                  animation: `fadeIn 300ms ease-out ${index * 50}ms both`,
                }}
                title={option.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-primary-600
          shadow-lg flex items-center justify-center text-white
          transition-all duration-300 hover:scale-110 hover:shadow-xl
          ${isOpen ? 'rotate-45' : 'rotate-0'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
