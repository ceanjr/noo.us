import { X, Mail, Smartphone } from 'lucide-react';

/**
 * ForgotPasswordModal - Modal para recuperação de senha
 * @param {Object} props
 * @param {Function} props.onClose - Callback ao fechar modal
 * @param {string} props.resetMethod - Método selecionado ('email' ou 'phone')
 * @param {Function} props.onMethodChange - Callback ao mudar método
 * @param {string} props.resetEmail - Email para recuperação
 * @param {Function} props.setResetEmail - Setter do email
 * @param {string} props.resetPhone - Telefone para recuperação
 * @param {Function} props.onPhoneChange - Handler de mudança de telefone
 * @param {Function} props.formatPhoneDisplay - Função para formatar telefone
 * @param {Function} props.onSubmit - Callback ao submeter formulário
 */
export default function ForgotPasswordModal({
  onClose,
  resetMethod,
  onMethodChange,
  resetEmail,
  setResetEmail,
  resetPhone,
  onPhoneChange,
  formatPhoneDisplay,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-theme-secondary rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-theme-primary">
            Recuperar Senha
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => onMethodChange('email')}
            className={`flex-1 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
              resetMethod === 'email'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button
            onClick={() => onMethodChange('phone')}
            className={`flex-1 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
              resetMethod === 'phone'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Telefone
          </button>
        </div>

        <form onSubmit={onSubmit}>
          {resetMethod === 'email' ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Digite o email cadastrado para receber as instruções de recuperação
              </p>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent mb-4"
                placeholder="seu@email.com"
                required
              />
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Digite o telefone cadastrado. Entraremos em contato pelo email de
                suporte.
              </p>
              <input
                type="tel"
                value={formatPhoneDisplay(resetPhone)}
                onChange={(e) => onPhoneChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent mb-4"
                placeholder="(11) 99999-9999"
                required
              />
            </>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
