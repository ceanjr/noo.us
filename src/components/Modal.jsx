import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  customContent,
  type = 'info',
  confirmText = 'OK',
  showCancel = false,
  onConfirm,
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-12 h-12 text-yellow-500" />;
      default:
        return <Info className="w-12 h-12 text-blue-500" />;
    }
  };

  const handleConfirm = async () => {
    try {
      if (onConfirm) {
        const result = onConfirm();
        if (result && typeof result.then === 'function') {
          await result;
        }
      }
    } finally {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[90] animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-6">
          <div className="flex justify-center mb-4">{getIcon()}</div>

          {title && (
            <h3 className="text-xl font-bold text-gray-800 text-center mb-3">
              {title}
            </h3>
          )}

          {customContent ? (
            <div>{customContent}</div>
          ) : (
            <p className="text-gray-600 text-center whitespace-pre-wrap">
              {message}
            </p>
          )}
        </div>

        <div className="flex gap-2 p-6 pt-0">
          {showCancel && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              aria-label="Cancelar ação"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
            aria-label={confirmText}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
