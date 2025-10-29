import { User } from 'lucide-react';

/**
 * Avatar - Componente reutilizável para exibir avatares de usuários
 * 
 * @param {Object} props
 * @param {string} props.photoURL - URL da foto do usuário
 * @param {string} props.name - Nome do usuário (usado para fallback com inicial)
 * @param {string} props.avatarBg - Cor de fundo do avatar
 * @param {string|number} props.size - Tamanho do avatar ('sm', 'md', 'lg', 'xl' ou número em pixels)
 * @param {string} props.className - Classes CSS adicionais
 * @param {boolean} props.ring - Se deve ter anel branco ao redor
 * @param {string} props.shape - Forma do avatar ('circle' ou 'rounded')
 * @param {React.ReactNode} props.fallbackIcon - Ícone customizado para fallback
 * @param {Function} props.onClick - Callback ao clicar no avatar
 * @param {boolean} props.disabled - Se o avatar está desabilitado (para botões)
 */
export default function Avatar({
  photoURL,
  name,
  avatarBg,
  size = 'md',
  className = '',
  ring = false,
  shape = 'circle',
  fallbackIcon,
  onClick,
  disabled = false,
}) {
  // Determina se é um ícone do sistema (vs foto real)
  const isIcon = photoURL && photoURL.includes('/images/icons/');
  
  // Determina se deve usar fundo transparente ou colorido
  const shouldUseTransparentBg = photoURL && !isIcon;
  
  // Mapeamento de tamanhos predefinidos
  const sizeMap = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-3xl',
    '2xl': 'w-32 h-32 text-4xl',
  };
  
  // Classes de tamanho
  const sizeClasses = typeof size === 'number' 
    ? `w-[${size}px] h-[${size}px]`
    : sizeMap[size] || sizeMap.md;
  
  // Classes de forma
  const shapeClasses = shape === 'rounded' 
    ? (photoURL ? 'rounded-2xl' : 'rounded-full')
    : 'rounded-full';
  
  // Classes de anel
  const ringClasses = ring ? 'ring-2 ring-white' : '';
  
  // Classes de interação
  const interactionClasses = onClick 
    ? `cursor-pointer hover:opacity-90 transition-opacity ${disabled ? 'cursor-not-allowed opacity-50' : ''}`
    : '';
  
  // Estilo de fundo
  const backgroundStyle = shouldUseTransparentBg 
    ? { backgroundColor: 'transparent' }
    : { backgroundColor: avatarBg || undefined };
  
  // Classes de imagem
  const imageClasses = isIcon 
    ? 'object-contain p-2'
    : 'object-cover';
  
  // Determina o conteúdo do avatar
  const renderContent = () => {
    if (photoURL) {
      return (
        <img
          src={photoURL}
          alt={name || 'Avatar'}
          className={`w-full h-full ${imageClasses} ${shape === 'rounded' && !isIcon ? 'rounded-2xl' : ''}`}
        />
      );
    }
    
    if (fallbackIcon) {
      return fallbackIcon;
    }
    
    if (name) {
      return (
        <span className="text-white font-bold select-none">
          {name[0]?.toUpperCase() || '?'}
        </span>
      );
    }
    
    return <User className="w-1/2 h-1/2 text-white" />;
  };
  
  const Element = onClick ? 'button' : 'div';
  
  return (
    <Element
      onClick={onClick}
      disabled={disabled}
      type={onClick ? 'button' : undefined}
      className={`${sizeClasses} ${shapeClasses} ${ringClasses} ${interactionClasses} flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0 ${className}`}
      style={backgroundStyle}
    >
      {renderContent()}
    </Element>
  );
}
