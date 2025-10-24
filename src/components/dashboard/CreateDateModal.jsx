import { useState } from 'react';
import { X, Calendar } from 'lucide-react';

/**
 * CreateDateModal - Modal específico para criar surpresa tipo encontro
 *
 * @param {Object} props
 * @param {Function} props.onClose - Callback ao fechar modal
 * @param {Function} props.onSubmit - Callback ao submeter (surpriseData)
 */
export default function CreateDateModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Combinar informações em um objeto de conteúdo
      const content = JSON.stringify({
        date: formData.date,
        time: formData.time,
        location: formData.location,
        description: formData.description,
      });

      await onSubmit({
        type: 'date',
        title: formData.title,
        content: content,
      });

      onClose();
    } catch (error) {
      console.error('Erro ao criar encontro:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-theme-secondary rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-lime-500 p-2 rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              Novo Encontro
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
            <label className="block text-sm font-bold text-theme-secondary mb-2">
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-theme rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all"
              placeholder="Ex: Jantar romântico"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-theme-secondary mb-2">
                Data
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-theme rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-theme-secondary mb-2">
                Horário
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-3 border-2 border-theme rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-theme-secondary mb-2">
              Local
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 border-2 border-theme rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all"
              placeholder="Ex: Restaurante Italiano"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-theme-secondary mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-theme rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-lime-500 min-h-[100px] transition-all"
              placeholder="Detalhes sobre o encontro..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all font-bold text-theme-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-lime-500 hover:bg-lime-600 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
