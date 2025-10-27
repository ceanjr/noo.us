/**
 * Button Component - Botão reutilizável com variantes
 * 
 * @param {Object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} props.variant - Estilo do botão
 * @param {'sm'|'md'|'lg'} props.size - Tamanho do botão
 * @param {boolean} props.loading - Estado de carregamento
 * @param {boolean} props.disabled - Botão desabilitado
 * @param {boolean} props.fullWidth - Largura total
 * @param {React.ReactNode} props.icon - Ícone (componente Lucide)
 * @param {string} props.ariaLabel - Label para acessibilidade
 * @param {Function} props.onClick - Handler de clique
 * @param {React.ReactNode} props.children - Conteúdo do botão
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  ariaLabel,
  onClick,
  children,
  className = '',
  type = 'button',
}) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-lg focus:ring-purple-400',
    secondary:
      'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 shadow-lg focus:ring-primary-400',
    outline:
      'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-400',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg focus:ring-red-400',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          <span>Carregando...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5" />}
          {children}
        </>
      )}
    </button>
  );
}
