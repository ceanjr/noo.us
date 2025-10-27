/**
 * Componente de Loading Spinner reutilizável
 * Para uso em lazy loading e estados de carregamento
 */

export default function LoadingSpinner({ size = 'md', color = 'primary', text = 'Carregando...' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const colors = {
    primary: 'border-primary-500',
    secondary: 'border-secondary-500',
    white: 'border-white',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`animate-spin rounded-full border-b-2 ${sizes[size]} ${colors[color]}`}
        role="status"
        aria-label="Carregando conteúdo"
      >
        <span className="sr-only">Carregando...</span>
      </div>
      {text && (
        <p className="text-gray-600 text-sm font-medium">{text}</p>
      )}
    </div>
  );
}
