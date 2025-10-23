import { db } from '../lib/firebase';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

/**
 * Carrega perfil do usuário do Firestore
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object|null>} Dados do perfil ou null
 */
export const loadUserProfile = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data() : null;
};

/**
 * Cria perfil de usuário no Firestore
 * @param {string} userId - ID do usuário
 * @param {Object} profileData - Dados do perfil
 * @returns {Promise<void>}
 */
export const createUserProfile = async (userId, profileData) => {
  await setDoc(doc(db, 'users', userId), {
    ...profileData,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  });
};

/**
 * Atualiza lastLogin do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<void>}
 */
export const updateLastLogin = async (userId) => {
  await updateDoc(doc(db, 'users', userId), {
    lastLogin: serverTimestamp(),
  });
};

/**
 * Busca usuário por telefone
 * @param {string} phoneNumber - Telefone (com código do país)
 * @returns {Promise<Object|null>} {id, data} ou null
 */
export const findUserByPhone = async (phoneNumber) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('phoneNumber', '==', phoneNumber));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return null;

  const doc = querySnapshot.docs[0];
  return { id: doc.id, data: doc.data() };
};

/**
 * Busca usuário por email
 * @param {string} email - Email do usuário
 * @returns {Promise<Object|null>} {id, data} ou null
 */
export const findUserByEmail = async (email) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return null;

  const doc = querySnapshot.docs[0];
  return { id: doc.id, data: doc.data() };
};

/**
 * Migra dados de usuário para novo UID (quando UID muda após phone auth)
 * @param {string} oldUserId - UID antigo
 * @param {string} newUserId - UID novo
 * @param {Object} userData - Dados do usuário
 * @returns {Promise<void>}
 */
export const migrateUserData = async (oldUserId, newUserId, userData) => {
  // Criar documento com novo UID
  await setDoc(doc(db, 'users', newUserId), {
    ...userData,
    lastLogin: serverTimestamp(),
  });

  // Deletar documento antigo
  await deleteDoc(doc(db, 'users', oldUserId));
};

/**
 * Verifica se telefone já está cadastrado
 * @param {string} phoneNumber - Telefone (com código do país)
 * @returns {Promise<boolean>} True se já existe
 */
export const phoneExists = async (phoneNumber) => {
  const user = await findUserByPhone(phoneNumber);
  return user !== null;
};

/**
 * Verifica se email já está cadastrado
 * @param {string} email - Email
 * @returns {Promise<boolean>} True se já existe
 */
export const emailExists = async (email) => {
  const user = await findUserByEmail(email);
  return user !== null;
};
