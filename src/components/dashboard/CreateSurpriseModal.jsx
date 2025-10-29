import { useState } from 'react';
import {
  X,
  Gift,
  MessageCircle,
  Image as ImageIcon,
  Music,
  Calendar,
} from 'lucide-react';
import CreateMessageModal from './CreateMessageModal';
import CreatePhotoModal from './CreatePhotoModal';
import CreateMusicModal from './CreateMusicModal';
import CreateDateModal from './CreateDateModal';

/**
 * CreateSurpriseModal - Modal para selecionar tipo de surpresa
 *
 * @param {Object} props
 * @param {Function} props.onClose - Callback ao fechar modal
 * @param {Function} props.onSubmit - Callback ao submeter surpresa (surpriseData)
 * @param {string} props.userId - ID do usuário atual
 * @param {string} props.recipientName - Nome do destinatário selecionado
 */
export default function CreateSurpriseModal({ onClose, onSubmit, userId, recipientName }) {
  const [selectedType, setSelectedType] = useState(null);

  const getSurpriseIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-6 h-6" />;
      case 'photo':
        return <ImageIcon className="w-6 h-6" />;
      case 'music':
        return <Music className="w-6 h-6" />;
      case 'date':
        return <Calendar className="w-6 h-6" />;
      default:
        return <Gift className="w-6 h-6" />;
    }
  };

  const getSurpriseColor = (type) => {
    switch (type) {
      case 'message':
        return 'bg-accent-500';
      case 'photo':
        return 'bg-primary-500';
      case 'music':
        return 'bg-secondary-500';
      case 'date':
        return 'bg-lime-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSurpriseLabel = (type) => {
    switch (type) {
      case 'message':
        return 'Mensagem';
      case 'photo':
        return 'Foto';
      case 'music':
        return 'Música';
      case 'date':
        return 'Encontro';
      default:
        return type;
    }
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  const handleTypeModalClose = () => {
    setSelectedType(null);
  };

  return (
    <>
      {/* Type Selection Modal */}
      {!selectedType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-theme-secondary rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary-500 p-2 rounded-xl">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Nova Surpresa
                  </h3>
                </div>
                {recipientName && (
                  <p className="text-sm text-gray-500 ml-14">
                    Para: <span className="font-semibold text-primary-600">{recipientName}</span>
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-all p-2 hover:bg-gray-100 rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-theme-secondary mb-4">
                Escolha o tipo de surpresa
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['message', 'photo', 'music', 'date'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeSelect(type)}
                    className="p-5 rounded-xl border-2 border-theme hover:border-gray-300 hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-3 group"
                  >
                    <div
                      className={`${getSurpriseColor(
                        type
                      )} p-3 rounded-xl group-hover:scale-110 transition-transform`}
                    >
                      <div className="text-white">{getSurpriseIcon(type)}</div>
                    </div>
                    <span className="text-sm font-bold text-theme-secondary">
                      {getSurpriseLabel(type)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Type-Specific Modals */}
      {selectedType === 'message' && (
        <CreateMessageModal
          onClose={() => {
            handleTypeModalClose();
            onClose();
          }}
          onSubmit={onSubmit}
        />
      )}

      {selectedType === 'photo' && (
        <CreatePhotoModal
          onClose={() => {
            handleTypeModalClose();
            onClose();
          }}
          onSubmit={onSubmit}
          userId={userId}
        />
      )}

      {selectedType === 'music' && (
        <CreateMusicModal
          onClose={() => {
            handleTypeModalClose();
            onClose();
          }}
          onSubmit={onSubmit}
        />
      )}

      {selectedType === 'date' && (
        <CreateDateModal
          onClose={() => {
            handleTypeModalClose();
            onClose();
          }}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
}
