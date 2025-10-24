import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { showToast } from '../components/Toast';

export function usePartnerActions(userId, profile, setModal) {
  const handleSendLinkInvite = async (partnerIdentifier, relationshipStartDate) => {
    try {
      const usersRef = collection(db, 'users');
      let q;

      if (partnerIdentifier.includes('@')) {
        q = query(usersRef, where('email', '==', partnerIdentifier));
      } else {
        const formattedPhone = partnerIdentifier.startsWith('+')
          ? partnerIdentifier
          : `+55${partnerIdentifier.replace(/\D/g, '')}`;
        q = query(usersRef, where('phoneNumber', '==', formattedPhone));
      }

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        showToast('Usuário não encontrado', 'error');
        return false;
      }

      const partnerDoc = querySnapshot.docs[0];
      const partnerId = partnerDoc.id;
      const partnerData = partnerDoc.data();

      if (partnerId === userId) {
        showToast('Você não pode vincular com você mesmo!', 'error');
        return false;
      }

      if (partnerData.partnerId) {
        showToast('Este usuário já está vinculado a outra pessoa', 'error');
        return false;
      }

      const existingInvites = query(
        collection(db, 'notifications'),
        where('senderId', '==', userId),
        where('recipientId', '==', partnerId),
        where('type', '==', 'link_invite'),
        where('status', '==', 'pending')
      );
      const existingSnapshot = await getDocs(existingInvites);

      if (!existingSnapshot.empty) {
        showToast('Você já enviou um convite para este usuário!', 'warning');
        return false;
      }

      const notificationData = {
        type: 'link_invite',
        senderId: userId,
        senderName: profile.name,
        recipientId: partnerId,
        recipientName: partnerData.name,
        senderDate: relationshipStartDate,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'notifications'), notificationData);

      showToast('Convite enviado com sucesso!', 'success');
      return true;
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      showToast(`Erro ao enviar convite: ${error.message}`, 'error');
      return false;
    }
  };

  const handleUnlinkPartner = async () => {
    if (!profile.partnerId) return;

    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        title: 'Desvincular contas?',
        message: `Tem certeza que deseja desvincular sua conta de ${profile.partnerName}? Todas as surpresas serão mantidas, mas vocês não estarão mais vinculados.`,
        type: 'warning',
        showCancel: true,
        confirmText: 'Desvincular',
        onConfirm: async () => {
          try {
            await updateDoc(doc(db, 'users', userId), {
              partnerId: null,
              partnerName: null,
            });

            await updateDoc(doc(db, 'users', profile.partnerId), {
              partnerId: null,
              partnerName: null,
            });

            const conflictsQuery = query(
              collection(db, 'dateConflicts'),
              where('user1Id', '==', userId)
            );
            const conflictsQuery2 = query(
              collection(db, 'dateConflicts'),
              where('user2Id', '==', userId)
            );

            const [snapshot1, snapshot2] = await Promise.all([
              getDocs(conflictsQuery),
              getDocs(conflictsQuery2),
            ]);

            const deletePromises = [
              ...snapshot1.docs.map((doc) => deleteDoc(doc.ref)),
              ...snapshot2.docs.map((doc) => deleteDoc(doc.ref)),
            ];

            await Promise.all(deletePromises);

            showToast('Contas desvinculadas com sucesso', 'success');
            window.location.reload();
            resolve(true);
          } catch (error) {
            console.error('Erro ao desvincular:', error);
            showToast('Erro ao desvincular contas', 'error');
            resolve(false);
          }
        },
      });
    });
  };

  return {
    handleSendLinkInvite,
    handleUnlinkPartner,
  };
}
