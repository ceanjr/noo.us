import { X, Users } from 'lucide-react';
import Avatar from '../Avatar';

/**
 * SelectRecipientModal - Modal para selecionar o destinatário da surpresa
 * 
 * @param {Object} props
 * @param {Function} props.onClose - Callback ao fechar modal
 * @param {Function} props.onSelectRecipient - Callback ao selecionar destinatário (link)
 * @param {Array} props.links - Lista de vínculos do usuário
 */
export default function SelectRecipientModal({ onClose, onSelectRecipient, links }) {
  const handleSelectLink = (link) => {
    onSelectRecipient(link);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-theme-secondary rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary-500 p-2 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              Para quem é a surpresa?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-all p-2 hover:bg-gray-100 rounded-xl"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {links.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              Você ainda não tem vínculos cadastrados.
            </p>
            <p className="text-sm text-gray-400">
              Vincule-se a alguém primeiro para enviar surpresas!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">
              Selecione para quem você deseja enviar a surpresa:
            </p>
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleSelectLink(link)}
                className="w-full bg-white rounded-2xl p-4 border-2 border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all flex items-center gap-4 group"
              >
                <Avatar
                  photoURL={link.partnerPhotoURL}
                  name={link.partnerName}
                  avatarBg={link.partnerAvatarBg}
                  size="lg"
                />
                
                <div className="flex-1 text-left">
                  <h4 className="text-lg font-bold text-theme-primary group-hover:text-primary-500 transition-colors">
                    {link.partnerName}
                  </h4>
                  {link.relationshipType && (
                    <p className="text-sm text-gray-500 capitalize">
                      {link.relationshipType === 'partner' && 'Parceiro(a)'}
                      {link.relationshipType === 'family' && 'Família'}
                      {link.relationshipType === 'friend' && 'Amigo(a)'}
                    </p>
                  )}
                </div>

                <div className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
