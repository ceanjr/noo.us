import { db } from '../lib/firebase';
import { doc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { showToast } from '../components/Toast';

/**
 * Bloquear um usuário
 * @param {string} userId - ID do usuário atual
 * @param {string} blockedUserId - ID do usuário a ser bloqueado
 * @param {string} blockedUserName - Nome do usuário bloqueado
 * @returns {Promise<boolean>}
 */
export const blockUser = async (userId, blockedUserId, blockedUserName) => {
  try {
    // Criar documento de bloqueio
    const blockRef = doc(db, 'users', userId, 'blockedUsers', blockedUserId);
    await setDoc(blockRef, {
      blockedUserId,
      blockedUserName,
      blockedAt: new Date().toISOString(),
    });

    // Remover convites pendentes
    const notificationsRef = collection(db, 'notifications');
    const q1 = query(
      notificationsRef,
      where('senderId', '==', blockedUserId),
      where('recipientId', '==', userId),
      where('status', '==', 'pending')
    );
    const q2 = query(
      notificationsRef,
      where('senderId', '==', userId),
      where('recipientId', '==', blockedUserId),
      where('status', '==', 'pending')
    );

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const deletePromises = [];
    
    snap1.docs.forEach((doc) => deletePromises.push(deleteDoc(doc.ref)));
    snap2.docs.forEach((doc) => deletePromises.push(deleteDoc(doc.ref)));
    
    await Promise.all(deletePromises);

    showToast(`${blockedUserName} foi bloqueado`, 'success');
    return true;
  } catch (error) {
    console.error('Erro ao bloquear usuário:', error);
    showToast('Erro ao bloquear usuário', 'error');
    return false;
  }
};

/**
 * Desbloquear um usuário
 * @param {string} userId - ID do usuário atual
 * @param {string} blockedUserId - ID do usuário a ser desbloqueado
 * @returns {Promise<boolean>}
 */
export const unblockUser = async (userId, blockedUserId) => {
  try {
    const blockRef = doc(db, 'users', userId, 'blockedUsers', blockedUserId);
    await deleteDoc(blockRef);
    showToast('Usuário desbloqueado', 'success');
    return true;
  } catch (error) {
    console.error('Erro ao desbloquear usuário:', error);
    showToast('Erro ao desbloquear usuário', 'error');
    return false;
  }
};

/**
 * Verificar se um usuário está bloqueado
 * @param {string} userId - ID do usuário atual
 * @param {string} checkUserId - ID do usuário a verificar
 * @returns {Promise<boolean>}
 */
export const isUserBlocked = async (userId, checkUserId) => {
  try {
    const blockedRef = collection(db, 'users', userId, 'blockedUsers');
    const q = query(blockedRef, where('blockedUserId', '==', checkUserId));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Erro ao verificar bloqueio:', error);
    return false;
  }
};

/**
 * Listar usuários bloqueados
 * @param {string} userId - ID do usuário atual
 * @returns {Promise<Array>}
 */
export const getBlockedUsers = async (userId) => {
  try {
    const blockedRef = collection(db, 'users', userId, 'blockedUsers');
    const snapshot = await getDocs(blockedRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao listar bloqueados:', error);
    return [];
  }
};
