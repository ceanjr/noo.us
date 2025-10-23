import { useState } from 'react';
import { X, Gift, MessageCircle, Image as ImageIcon, Music, Calendar } from 'lucide-react';

/**
 * CreateSurpriseModal - Modal para criar surpresa
 *
 * @param {Object} props
 * @param {Function} props.onClose - Callback ao fechar modal
 * @param {Function} props.onSubmit - Callback ao submeter surpresa (surpriseData)
 */
export default function CreateSurpriseModal({ onClose, onSubmit }) {
  const [newSurprise, setNewSurprise] = useState({
    type: 'message',
    content: '',
    title: '',
  });

  const getSurpriseIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-5 h-5" />;
      case 'photo':
        return <ImageIcon className="w-5 h-5" />;
      case 'music':
        return <Music className="w-5 h-5" />;
      case 'date':
        return <Calendar className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(newSurprise);
    setNewSurprise({ type: 'message', content: '', title: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-theme-secondary rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              Nova Surpresa
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-all p-2 hover:bg-gray-100 rounded-xl"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-theme-secondary mb-3">
              Tipo de Surpresa
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['message', 'photo', 'music', 'date'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNewSurprise({ ...newSurprise, type })}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                    newSurprise.type === type
                      ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-secondary-50 shadow-md scale-105'
                      : 'border-theme hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`${
                      newSurprise.type === type
                        ? 'text-primary-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {getSurpriseIcon(type)}
                  </div>
                  <span className="text-xs font-medium capitalize">
                    {type}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-theme-secondary mb-2">
              Título
            </label>
            <input
              type="text"
              value={newSurprise.title}
              onChange={(e) =>
                setNewSurprise({ ...newSurprise, title: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-theme rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              placeholder="Ex: Para você, com amor"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-theme-secondary mb-2">
              {newSurprise.type === 'music'
                ? 'Link da Música'
                : newSurprise.type === 'photo'
                ? 'URL da Imagem'
                : 'Mensagem'}
            </label>
            <textarea
              value={newSurprise.content}
              onChange={(e) =>
                setNewSurprise({
                  ...newSurprise,
                  content: e.target.value,
                })
              }
              className="w-full px-4 py-3 border-2 border-theme rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[120px] transition-all"
              placeholder={
                newSurprise.type === 'music'
                  ? 'Cole o link aqui...'
                  : newSurprise.type === 'photo'
                  ? 'Cole o URL da imagem aqui...'
                  : 'Escreva sua mensagem aqui...'
              }
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all font-bold text-theme-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-bold shadow-lg hover:shadow-xl"
            >
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
