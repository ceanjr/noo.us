import { db } from '../lib/firebase';
import { collection, writeBatch, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { showToast } from '../components/Toast';

/**
 * Custom hook para ações relacionadas a notificações
 *
 * @param {string} userId - ID do usuário atual
 * @param {Object} profile - Perfil do usuário atual
 * @returns {Object} Handlers de notificações (sem setModal)
 */
export function useNotificationActions(userId, profile) {
  /**
   * Aceitar convite de vinculação (lógica pura)
   */
  const acceptInvite = async (notification) => {
    const batch = writeBatch(db);

    try {
      const relationship = notification.relationship || 'partner';

      // Criar link para o usuário atual (receptor)
      const currentUserLinkRef = doc(collection(db, 'users', userId, 'links'));
      batch.set(currentUserLinkRef, {
        partnerId: notification.senderId,
        partnerName: notification.senderName,
        relationship,
        createdAt: new Date().toISOString(),
      });

      // Criar link espelho para o remetente
      const senderLinkRef = doc(collection(db, 'users', notification.senderId, 'links'));
      batch.set(senderLinkRef, {
        partnerId: userId,
        partnerName: profile.name,
        relationship,
        createdAt: new Date().toISOString(),
      });

      // Marcar notificação como aceita
      const notificationRef = doc(db, 'notifications', notification.id);
      batch.update(notificationRef, { status: 'accepted' });

      // Commit do batch
      await batch.commit();

      showToast('Vinculação realizada com sucesso!', 'success');

      // UI reativa via useLinks; sem reload
      return true;
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      showToast('Erro ao aceitar convite', 'error');
      return false;
    }
  };

  /**
   * Rejeitar convite de vinculação
   */
  const rejectInvite = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        status: 'rejected',
      });
      showToast('Convite rejeitado', 'success');
      return true;
    } catch (error) {
      showToast('Erro ao rejeitar convite', 'error');
      return false;
    }
  };

  return {
    acceptInvite,
    rejectInvite,
  };
}