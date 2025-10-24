import { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '../ImageUpload';
import { uploadSurprisePhoto } from '../../lib/storage';
import { showToast } from '../Toast';

/**
 * CreatePhotoModal - Modal específico para criar surpresa tipo foto
 *
 * @param {Object} props
 * @param {Function} props.onClose - Callback ao fechar modal
 * @param {Function} props.onSubmit - Callback ao submeter (surpriseData)
 * @param {string} props.userId - ID do usuário atual
 */
export default function CreatePhotoModal({ onClose, onSubmit, userId }) {
  const [formData, setFormData] = useState({
    title: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedImage) {
      showToast('Por favor, selecione uma foto', 'error');
      return;
    }

    try {
      setUploading(true);
      showToast('Enviando imagem...', 'info');

      const imageUrl = await uploadSurprisePhoto(selectedImage, userId);

      await onSubmit({
        type: 'photo',
        title: formData.title,
        content: imageUrl,
      });

      onClose();
    } catch (error) {
      console.error('Erro ao criar foto:', error);
      showToast(error.message || 'Erro ao enviar foto', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (file) => {
    setSelectedImage(file);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-theme-secondary rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary-500 p-2 rounded-xl">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              Nova Foto
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
              className="w-full px-4 py-3 border-2 border-theme rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              placeholder="Ex: Nosso momento especial"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-theme-secondary mb-2">
              Foto
            </label>
            <ImageUpload
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              loading={uploading}
              maxSizeMB={5}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all font-bold text-theme-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedImage}
              className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
