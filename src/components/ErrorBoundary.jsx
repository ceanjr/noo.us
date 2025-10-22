import { Component } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Ops! Algo deu errado
              </h2>
              <p className="text-gray-600 mb-6">
                Ocorreu um erro inesperado. Por favor, recarregue a página ou
                tente novamente.
              </p>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Recarregar Página
              </button>

              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg w-full text-left">
                  <p className="text-xs font-mono text-red-800 break-all">
                    {this.state.error?.toString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
