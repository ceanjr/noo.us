import { useState } from 'react';
import { X, Send, Link as LinkIcon, Sparkles, ChevronDown } from 'lucide-react';

/**
 * LinkPartnerModal - Modal para vincular parceiro
 *
 * @param {Object} props
 * @param {Function} props.onClose - Callback ao fechar modal
 * @param {Function} props.onSubmit - Callback ao enviar (identifier)
 */
const RELATIONSHIP_OPTIONS = [
  { value: 'partner', label: 'Parceiro(a)' },
  { value: 'family', label: 'Família' },
  { value: 'friend', label: 'Amigo(a)' },
];

export default function LinkPartnerModal({ onClose, onSubmit }) {
  const [partnerIdentifier, setPartnerIdentifier] = useState('');
  const [relationship, setRelationship] = useState('partner');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(partnerIdentifier, relationship);
    if (success) {
      setPartnerIdentifier('');
      setRelationship('partner');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-theme-secondary rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-2 rounded-xl">
              <LinkIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              Vincular Parceiro
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
              Email ou Telefone
            </label>
            <input
              type="text"
              value={partnerIdentifier}
              onChange={(e) => setPartnerIdentifier(e.target.value)}
              className="w-full px-4 py-3 border-2 border-theme rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              placeholder="email@exemplo.com ou (11) 99999-9999"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-theme-secondary mb-2">
              Qual a relação com essa pessoa?
            </label>
            <div className="relative">
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full appearance-none px-4 py-3 border-2 border-theme rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white text-theme-primary"
                required
              >
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary" />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-theme-secondary">
                Essa pessoa receberá um convite para se conectar a você.
              </p>
            </div>
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
