import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
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
  const acceptInvite = async (notification, recipientDate) => {
    if (!recipientDate) {
      showToast('Por favor, escolha a data!', 'warning');
      return false;
    }

    try {
      const senderDate = notification.senderDate;
      const areDatesEqual = senderDate === recipientDate;

      // Atualizar usuário atual
      await updateDoc(doc(db, 'users', userId), {
        partnerId: notification.senderId,
        partnerName: notification.senderName,
        relationshipStart: recipientDate,
      });

      // Atualizar parceiro
      await updateDoc(doc(db, 'users', notification.senderId), {
        partnerId: userId,
        partnerName: profile.name,
        relationshipStart: senderDate,
      });

      // Marcar notificação como aceita
      await updateDoc(doc(db, 'notifications', notification.id), {
        status: 'accepted',
        recipientDate: recipientDate,
      });

      // Se datas diferentes, criar conflito
      if (!areDatesEqual) {
        await addDoc(collection(db, 'dateConflicts'), {
          user1Id: notification.senderId,
          user1Name: notification.senderName,
          user1Date: senderDate,
          user2Id: userId,
          user2Name: profile.name,
          user2Date: recipientDate,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });

        showToast(
          'Vinculação realizada! Mas há uma surpresinha para vocês...',
          'success'
        );
      } else {
        showToast('Vinculação realizada com sucesso!', 'success');
      }

      window.location.reload();
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

  /**
   * Responder proposta de nova data
   */
  const respondToProposal = async (notification, accept) => {
    try {
      if (accept) {
        // Atualizar data em ambos os usuários
        await updateDoc(doc(db, 'users', userId), {
          relationshipStart: notification.proposedDate,
        });
        await updateDoc(doc(db, 'users', notification.senderId), {
          relationshipStart: notification.proposedDate,
        });

        // Deletar conflito de data
        await deleteDoc(doc(db, 'dateConflicts', notification.conflictId));

        showToast('Data acordada com sucesso!', 'success');
      } else {
        showToast('Proposta rejeitada', 'success');
      }

      // Atualizar status da notificação
      await updateDoc(doc(db, 'notifications', notification.id), {
        status: accept ? 'accepted' : 'rejected',
      });

      window.location.reload();
      return true;
    } catch (error) {
      console.error('Erro ao responder proposta:', error);
      showToast('Erro ao responder proposta', 'error');
      return false;
    }
  };

  /**
   * Responder solicitação de mudança de data
   */
  const dateChangeResponse = async (notification, accept) => {
    try {
      if (accept) {
        // Atualizar data em ambos os usuários
        await updateDoc(doc(db, 'users', userId), {
          relationshipStart: notification.proposedDate,
        });
        await updateDoc(doc(db, 'users', notification.senderId), {
          relationshipStart: notification.proposedDate,
        });

        showToast('Data atualizada com sucesso!', 'success');
      } else {
        showToast('Solicitação rejeitada', 'success');
      }

      // Atualizar status da notificação
      await updateDoc(doc(db, 'notifications', notification.id), {
        status: accept ? 'accepted' : 'rejected',
      });

      window.location.reload();
      return true;
    } catch (error) {
      console.error('Erro ao responder solicitação:', error);
      showToast('Erro ao responder solicitação', 'error');
      return false;
    }
  };

  return {
    acceptInvite,
    rejectInvite,
    respondToProposal,
    dateChangeResponse,
  };
}
