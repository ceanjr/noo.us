import { Smartphone, Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * Phone login form component for user authentication with phone number
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.phoneNumber - Phone number value
 * @param {Function} props.onPhoneChange - Handler for phone number changes
 * @param {string} props.password - Password value
 * @param {Function} props.setPassword - Setter for password state
 * @param {boolean} props.showPassword - Whether to show password field
 * @param {Function} props.setShowPassword - Setter for show password state
 * @param {boolean} props.rememberMe - Remember me checkbox value
 * @param {Function} props.setRememberMe - Setter for remember me state
 * @param {string} props.phoneError - Phone validation error message
 * @param {string} props.passwordError - Password validation error message
 * @param {Function} props.formatPhoneDisplay - Function to format phone number for display
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Function} props.onForgotPassword - Forgot password handler
 * @param {Function} props.onGoogleSignIn - Google sign-in handler
 * @returns {JSX.Element} Phone login form component
 */
export default function PhoneLoginForm({
  phoneNumber,
  onPhoneChange,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  phoneError,
  passwordError,
  formatPhoneDisplay,
  onSubmit,
  onForgotPassword,
  onGoogleSignIn,
}) {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-1">
            Telefone (com DDD)
          </label>
          <input
            type="tel"
            value={formatPhoneDisplay(phoneNumber)}
            onChange={(e) => onPhoneChange(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
              phoneError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="(11) 99999-9999"
            required
          />
          {phoneError && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {phoneError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-1">
            Senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Sua senha"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {passwordError && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {passwordError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
            />
            <span className="text-sm text-gray-600">
              Lembrar-me
            </span>
          </label>

          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-pink-600 hover:text-pink-700 font-medium"
          >
            Esqueci a senha
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg"
        >
          Entrar
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-theme-secondary text-gray-500">
              Ou entre com
            </span>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => onGoogleSignIn(false)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium text-theme-secondary"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Entrar com Google
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-gray-600 text-center">
          <strong>Primeira vez?</strong> Crie uma conta para começar!
          💝
        </p>
      </div>
    </>
  );
}
