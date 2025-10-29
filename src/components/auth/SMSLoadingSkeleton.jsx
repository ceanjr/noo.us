import { Smartphone } from 'lucide-react';

/**
 * Loading skeleton exibido durante envio de SMS
 */
export default function SMSLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
          <Smartphone className="w-8 h-8 text-pink-500 animate-bounce" />
          <div className="absolute inset-0 rounded-full border-4 border-pink-300 border-t-transparent animate-spin"></div>
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Enviando código...
        </h3>
        <p className="text-sm text-gray-600">
          Aguarde enquanto enviamos o código de verificação via SMS
        </p>
      </div>

      {/* Skeleton do input de código */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Skeleton dos botões */}
      <div className="space-y-2">
        <div className="h-12 bg-gray-200 rounded-xl"></div>
        <div className="h-10 bg-gray-100 rounded-xl"></div>
      </div>

      {/* Mensagem de espera */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-blue-300 rounded-full animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-blue-200 rounded w-3/4"></div>
            <div className="h-3 bg-blue-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
