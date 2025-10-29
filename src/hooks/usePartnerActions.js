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

// Optional global updater to refresh profile without threading through all props
let profileUpdater = null;
export const setProfileUpdater = (fn) => {
  profileUpdater = typeof fn === 'function' ? fn : null;
};

export function usePartnerActions(userId, profile, setModal, setProfile) {
  const handleSendLinkInvite = async (partnerIdentifier, relationshipType = 'partner', nickname = '', message = '') => {
    try {
      const usersRef = collection(db, 'users');
      let q;

      if (partnerIdentifier.includes('@')) {
        q = query(usersRef, where('email', '==', partnerIdentifier));
      } else {
        const cleanedPhone = partnerIdentifier.replace(/\D/g, '');
        q = query(usersRef, where('phoneNumber', '==', cleanedPhone));
      }

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return false;
      }

      const partnerDoc = querySnapshot.docs[0];
      const partnerId = partnerDoc.id;
      const partnerData = partnerDoc.data();

      if (partnerId === userId) {
        showToast('Você não pode vincular com você mesmo!', 'error');
        return false;
      }

      // Verificar se o usuário está bloqueado
      const { isUserBlocked } = await import('../services/blockService');
      const [isBlocked, hasBlockedYou] = await Promise.all([
        isUserBlocked(userId, partnerId),
        isUserBlocked(partnerId, userId)
      ]);

      if (isBlocked) {
        showToast('Você bloqueou este usuário', 'error');
        return false;
      }

      if (hasBlockedYou) {
        showToast('Não é possível enviar convite para este usuário', 'error');
        return false;
      }

      // Check existing pending invite
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

      // Avoid sending invite if link already exists
      const myLinksRef = collection(db, 'users', userId, 'links');
      const alreadyLinkedQ = query(myLinksRef, where('partnerId', '==', partnerId));
      const alreadyLinkedSnap = await getDocs(alreadyLinkedQ);
      
      if (!alreadyLinkedSnap.empty) {
        showToast('Vocês já estão vinculados', 'info');
        return false;
      }

      const relationship = relationshipType || 'partner';

      const notificationData = {
        type: 'link_invite',
        senderId: userId,
        senderName: profile.name,
        senderPhotoURL: profile.photoURL || '',
        senderAvatarBg: profile.avatarBg || '',
        recipientId: partnerId,
        recipientName: partnerData.name,
        relationship,
        nickname: nickname || '',
        message: message || '',
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

            const updater = typeof setProfile === 'function' ? setProfile : profileUpdater;
            if (typeof updater === 'function') {
              updater((prev) => ({
                ...prev,
                partnerId: null,
                partnerName: null,
              }));
            }
            showToast('Contas desvinculadas com sucesso', 'success');
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