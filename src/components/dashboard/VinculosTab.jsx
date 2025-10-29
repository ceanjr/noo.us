import { useState } from 'react';
import { Users, Link as LinkIcon, X, Shield, ShieldOff } from 'lucide-react';
import Modal from '../Modal';
import Avatar from '../Avatar';
import { useLinks } from '../../hooks/useLinks';
import { auth, db } from '../../lib/firebase';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { showToast } from '../Toast';
import { blockUser } from '../../services/blockService';
import BlockedUsersModal from './BlockedUsersModal';

const RELATIONSHIP_LABELS = {
  partner: 'Parceiro(a)',
  family: 'Família',
  friend: 'Amigo(a)',
};

/**
 * VinculosTab - Gerenciamento de vínculos com parceiros (multi)
 *
 * @param {Object} props
 * @param {Object} props.profile - Perfil do usuário atual
 * @param {Function} props.onLinkPartner - Abre modal para vincular parceiro
 */
export default function VinculosTab({ profile, onLinkPartner }) {
  const { links } = useLinks();
  const [confirm, setConfirm] = useState({ open: false, link: null });
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);

  const handleUnlink = async (link) => {
    const uid = auth.currentUser?.uid;
    if (!uid || !link) return;
    try {
      await deleteDoc(doc(db, 'users', uid, 'links', link.id));

      const partnerLinksRef = collection(db, 'users', link.partnerId, 'links');
      const mirrorQ = query(partnerLinksRef, where('partnerId', '==', uid));
      const mirrorSnap = await getDocs(mirrorQ);
      for (const d of mirrorSnap.docs) {
        await deleteDoc(d.ref);
      }

      showToast('Vínculo removido', 'success');
    } catch (e) {
      console.error('Erro ao remover vínculo:', e);
      showToast('Erro ao remover vínculo', 'error');
    }
  };

  const handleBlock = async (link) => {
    const uid = auth.currentUser?.uid;
    if (!uid || !link) return;
    
    // Primeiro remove o vínculo
    await handleUnlink(link);
    
    // Depois bloqueia o usuário
    await blockUser(uid, link.partnerId, link.partnerName);
  };

  return (
    <div className="space-y-4">
      <div className="bg-theme-secondary rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-500 p-2 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-theme-primary">Vínculos</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBlockedUsers(true)}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow transition flex items-center gap-2"
            >
              <ShieldOff className="w-4 h-4" />
              Bloqueados
            </button>
            <button
              onClick={onLinkPartner}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold shadow hover:from-primary-600 hover:to-secondary-600 transition"
            >
              Vincular parceiro
            </button>
          </div>
        </div>

        {links && links.length > 0 ? (
          <div className="space-y-3">
            {links.map((link) => {
              const relationshipLabel = RELATIONSHIP_LABELS[link.relationship] || 'Parceiro(a)';
              return (
                <div key={link.id} className="flex items-center justify-between p-4 border border-border-color rounded-xl">
                  <div className="flex items-center gap-3">
                    <Avatar name={link.partnerName} photoURL={link.partnerPhotoURL} avatarBg={link.partnerAvatarBg} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-theme-primary">{link.partnerName}</span>
                        {link.nickname && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                            "{link.nickname}"
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-medium text-theme-secondary mt-1">
                        Relação:{' '}
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-primary-50 text-primary-600 border border-primary-100">
                          {relationshipLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBlock(link)}
                      className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 transition text-xs font-semibold text-red-600 flex items-center gap-1"
                      title="Bloquear usuário"
                    >
                      <ShieldOff className="w-4 h-4" />
                      Bloquear
                    </button>
                    <button
                      onClick={() => setConfirm({ open: true, link })}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition font-semibold text-theme-secondary flex items-center gap-2"
                      title="Desvincular"
                    >
                      <X className="w-4 h-4" />
                      Desvincular
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <LinkIcon className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-500 mb-1">Nenhum vínculo ativo</h3>
            <p className="text-sm text-gray-500 mb-4">
              Vincule-se a alguém para compartilhar e receber surpresas.
            </p>
            <button
              onClick={onLinkPartner}
              className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition font-semibold text-theme-secondary"
            >
              Vincular agora
            </button>
          </div>
        )}
      </div>

      <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-theme-secondary">Seus vínculos são privados. Em breve você poderá gerenciar permissões e recursos compartilhados aqui.</p>
        </div>
      </div>

      <Modal
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false, link: null })}
        title="Desvincular contas?"
        message={confirm.link ? `Tem certeza que deseja desvincular de ${confirm.link.partnerName}?` : ''}
        type="warning"
        showCancel
        confirmText="Desvincular"
        onConfirm={() => handleUnlink(confirm.link)}
      />

      {showBlockedUsers && (
        <BlockedUsersModal
          userId={auth.currentUser?.uid}
          onClose={() => setShowBlockedUsers(false)}
        />
      )}
    </div>
  );
}
