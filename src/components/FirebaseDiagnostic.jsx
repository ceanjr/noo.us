import { useState } from 'react';
import { auth } from '../lib/firebase';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function FirebaseDiagnostic() {
  const [isOpen, setIsOpen] = useState(false);
  const [checks, setChecks] = useState(null);

  const runDiagnostics = () => {
    const results = {
      firebaseConfig: false,
      authInitialized: false,
      projectId: null,
      authDomain: null,
      recaptchaContainer: false,
      testNumbers: 'Desconhecido',
    };

    // Check 1: Firebase configurado
    try {
      if (auth && auth.app) {
        results.firebaseConfig = true;
        results.projectId = auth.app.options.projectId;
        results.authDomain = auth.app.options.authDomain;
      }
    } catch (error) {
      console.error('Erro ao verificar Firebase config:', error);
    }

    // Check 2: Auth inicializado
    results.authInitialized = !!auth;

    // Check 3: Container do reCAPTCHA
    const container = document.getElementById('recaptcha-container');
    results.recaptchaContainer = !!container;

    setChecks(results);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          runDiagnostics();
        }}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition text-sm font-semibold"
      >
        🔍 Diagnóstico
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Diagnóstico Firebase</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {checks && (
          <div className="space-y-4">
            {/* Check 1 */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                {checks.firebaseConfig ? (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">1. Firebase Configurado</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {checks.firebaseConfig ? (
                      <>
                        ✅ Firebase inicializado corretamente
                        <br />
                        <span className="font-mono text-xs">
                          Project ID: {checks.projectId}
                          <br />
                          Auth Domain: {checks.authDomain}
                        </span>
                      </>
                    ) : (
                      '❌ Firebase não está configurado. Verifique o arquivo .env'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Check 2 */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                {checks.authInitialized ? (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">2. Firebase Auth</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {checks.authInitialized
                      ? '✅ Auth inicializado'
                      : '❌ Auth não inicializado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Check 3 */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                {checks.recaptchaContainer ? (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">3. Container reCAPTCHA</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {checks.recaptchaContainer
                      ? '✅ Container encontrado no DOM'
                      : '❌ Container não encontrado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Instruções */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800">
                    ⚠️ SMS não chega? Verifique:
                  </h3>
                  <ol className="text-sm text-gray-700 mt-2 space-y-2 list-decimal list-inside">
                    <li>
                      <strong>Firebase Console</strong> → Authentication →
                      Sign-in method → Phone deve estar <strong>ENABLED</strong>
                    </li>
                    <li>
                      <strong>Authorized domains:</strong> Adicione{' '}
                      <code className="bg-gray-200 px-1 rounded">
                        localhost
                      </code>{' '}
                      em Authentication → Settings
                    </li>
                    <li>
                      <strong>Números de teste (RECOMENDADO):</strong> Configure
                      em Phone numbers for testing
                      <br />
                      <code className="bg-gray-200 px-1 rounded text-xs">
                        +5511999999999 → 123456
                      </code>
                    </li>
                    <li>
                      <strong>Quota de SMS:</strong> Plano Spark = 10 SMS/dia.
                      Use números de teste!
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Links úteis */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">
                🔗 Links Úteis
              </h3>
              <div className="space-y-1 text-sm">
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline"
                >
                  → Firebase Console
                </a>
                <a
                  href={`https://console.firebase.google.com/project/${checks.projectId}/authentication/providers`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline"
                >
                  → Configurar Phone Auth
                </a>
                <a
                  href="https://firebase.google.com/docs/auth/web/phone-auth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline"
                >
                  → Documentação Phone Auth
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => {
              runDiagnostics();
            }}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Verificar Novamente
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
