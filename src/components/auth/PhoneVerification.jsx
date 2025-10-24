import { Smartphone } from 'lucide-react';

/**
 * Phone verification component for SMS code verification
 * Handles 6-digit verification code input for phone number verification
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.verificationCode - 6-digit verification code value
 * @param {Function} props.setVerificationCode - Setter for verification code state
 * @param {Function} props.onSubmit - Form submission handler for code verification
 * @param {Function} props.onResendCode - Handler for resending verification code
 * @param {string} props.phoneNumber - Phone number being verified
 * @param {Function} props.formatPhoneDisplay - Function to format phone number for display
 * @returns {JSX.Element} Phone verification form component
 */
export default function PhoneVerification({
  verificationCode,
  setVerificationCode,
  onSubmit,
  onResendCode,
  phoneNumber,
  formatPhoneDisplay,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-8 h-8 text-pink-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Código Enviado!
        </h3>
        <p className="text-sm text-gray-600">
          Digite o código de 6 dígitos enviado para{' '}
          {formatPhoneDisplay(phoneNumber)}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-1">
          Código de Verificação
        </label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            if (value.length <= 6) {
              setVerificationCode(value);
            }
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center text-2xl tracking-widest font-semibold"
          placeholder="000000"
          maxLength={6}
          autoFocus
          required
        />
      </div>

      <button
        type="submit"
        disabled={verificationCode.length !== 6}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Verificar Código
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onResendCode}
          className="text-sm text-pink-600 hover:text-pink-700 font-medium"
        >
          Reenviar código
        </button>
      </div>
    </form>
  );
}
