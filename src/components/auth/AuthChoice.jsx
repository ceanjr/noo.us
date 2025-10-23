import { Heart, Shield } from 'lucide-react';

/**
 * AuthChoice - Tela inicial de escolha entre Login e Signup
 * @param {Object} props
 * @param {Function} props.onSignupClick - Callback ao clicar em "Criar Conta"
 * @param {Function} props.onLoginClick - Callback ao clicar em "Já Tenho Conta"
 */
export default function AuthChoice({ onSignupClick, onLoginClick }) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-theme-secondary rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4 animate-pulse" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Noo.us
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Um espaço especial para deixar surpresas um para o outro 💝
        </p>

        <div className="space-y-3">
          <button
            onClick={onSignupClick}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg"
          >
            Criar Nova Conta
          </button>

          <button
            onClick={onLoginClick}
            className="w-full bg-gray-100 text-gray-800 py-4 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            Já Tenho Conta
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl flex items-start gap-2">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-theme-secondary">
            <strong>Seguro e privado:</strong> Suas informações são protegidas com
            criptografia e você mantém controle total da sua conta.
          </p>
        </div>
      </div>
    </div>
  );
}
