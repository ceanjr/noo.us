import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

/**
 * ImageUpload - Componente para upload de imagens com preview
 *
 * @param {Object} props
 * @param {Function} props.onImageSelect - Callback quando imagem é selecionada (file)
 * @param {Function} props.onImageRemove - Callback quando imagem é removida
 * @param {string} props.currentImage - URL da imagem atual (se houver)
 * @param {boolean} props.loading - Estado de loading
 * @param {string} props.accept - Tipos de arquivo aceitos
 * @param {number} props.maxSizeMB - Tamanho máximo em MB
 */
export default function ImageUpload({
  onImageSelect,
  onImageRemove,
  currentImage = null,
  loading = false,
  accept = 'image/jpeg,image/png,image/webp,image/heic',
  maxSizeMB = 5,
}) {
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setError(`A imagem deve ter no máximo ${maxSizeMB}MB`);
      return;
    }

    setError(null);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Chamar callback
    onImageSelect(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove?.();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {/* Preview ou Upload Area */}
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-xl border-2 border-border-color"
          />

          {/* Overlay com botões */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleClick}
              disabled={loading}
              className="px-4 py-2 bg-white text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Trocar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Remover
            </button>
          </div>

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm font-medium">Enviando imagem...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-12 h-12 animate-spin" />
              <p className="font-medium">Enviando...</p>
            </>
          ) : (
            <>
              <ImageIcon className="w-12 h-12" />
              <div className="text-center">
                <p className="font-medium text-base">Clique para adicionar uma foto</p>
                <p className="text-sm text-gray-400 mt-1">
                  JPEG, PNG ou WebP • Máx {maxSizeMB}MB
                </p>
              </div>
            </>
          )}
        </button>
      )}

      {/* Input escondido */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
