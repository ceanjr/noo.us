import { useState, useEffect } from 'react';
import { ShieldOff, X, AlertCircle } from 'lucide-react';
import Avatar from '../Avatar';
import { getBlockedUsers, unblockUser } from '../../services/blockService';

/**
 * Modal para gerenciar usuários bloqueados
 */
export default function BlockedUsersModal({ userId, onClose }) {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlockedUsers();
  }, [userId]);

  const loadBlockedUsers = async () => {
    setLoading(true);
    const users = await getBlockedUsers(userId);
    setBlockedUsers(users);
    setLoading(false);
  };

  const handleUnblock = async (blockedUserId) => {
    const success = await unblockUser(userId, blockedUserId);
    if (success) {
      setBlockedUsers(blockedUsers.filter(u => u.id !== blockedUserId));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-theme-secondary rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-in max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 p-2 rounded-xl">
              <ShieldOff className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-theme-primary">
              Usuários Bloqueados
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-all p-2 hover:bg-gray-100 rounded-xl"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto" />
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="text-center py-8">
            <ShieldOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              Nenhum usuário bloqueado
            </p>
            <p className="text-sm text-gray-400">
              Você pode bloquear usuários indesejados na aba Vínculos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800">
                  Usuários bloqueados não podem enviar convites de vínculo para você
                </p>
              </div>
            </div>

            {blockedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-red-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    name={user.blockedUserName}
                    size="md"
                  />
                  <div>
                    <h4 className="font-semibold text-theme-primary">
                      {user.blockedUserName}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Bloqueado em {new Date(user.blockedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnblock(user.id)}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-semibold text-sm transition-colors"
                >
                  Desbloquear
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
