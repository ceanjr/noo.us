import { Mail, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { showToast } from './Toast';

/**
 * Banner de alerta para verificação de email
 */
export default function EmailVerificationBanner({ user, onLogout }) {
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await sendEmailVerification(user, {
        url: window.location.origin,
        handleCodeInApp: true,
      });
      showToast('Email de verificação reenviado! 📧', 'success');
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      if (error.code === 'auth/too-many-requests') {
        showToast('Aguarde alguns minutos antes de solicitar novamente', 'warning');
      } else {
        showToast('Erro ao reenviar email', 'error');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Mail className="h-6 w-6 text-yellow-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Verifique seu email
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Enviamos um email de verificação para <strong>{user.email}</strong>.
              Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? 'Enviando...' : 'Reenviar email'}
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors"
            >
              Fazer logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
