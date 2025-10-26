import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
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
    try {
      // Criar vínculos nas subcoleções de ambos
      await addDoc(collection(db, 'users', userId, 'links'), {
        partnerId: notification.senderId,
        partnerName: notification.senderName,
        createdAt: new Date().toISOString(),
      });

      await addDoc(collection(db, 'users', notification.senderId, 'links'), {
        partnerId: userId,
        partnerName: profile.name,
        createdAt: new Date().toISOString(),
      });

      // Marcar notificação como aceita
      await updateDoc(doc(db, 'notifications', notification.id), {
        status: 'accepted',
      });

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

