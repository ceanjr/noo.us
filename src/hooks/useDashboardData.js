import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { showToast } from '../components/Toast';

export function useDashboardData(userId, partnerId) {
  const [surprises, setSurprises] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dateConflict, setDateConflict] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar perfil do parceiro
  useEffect(() => {
    const loadPartnerProfile = async () => {
      if (partnerId) {
        try {
          const partnerDoc = await getDoc(doc(db, 'users', partnerId));
          if (partnerDoc.exists()) {
            setPartnerProfile(partnerDoc.data());
          }
        } catch (error) {
          showToast('Erro ao carregar perfil do parceiro', 'error');
        }
      }
    };

    loadPartnerProfile();
  }, [partnerId]);

  // Carregar surpresas (com paginação e ordenação)
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'surprises'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(100) // Limitar a 100 surpresas mais recentes
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const surprisesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSurprises(surprisesData);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar surpresas:', error);
        showToast('Erro ao carregar surpresas', 'error');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Carregar notificações (com paginação e ordenação)
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50) // Limitar a 50 notificações mais recentes
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationsData = snapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });
        setNotifications(notificationsData);
      },
      (error) => {
        console.error('Erro ao carregar notificações:', error);
        showToast('Erro ao carregar notificações: ' + error.message, 'error');
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Carregar conflito de data
  useEffect(() => {
    if (!userId || !partnerId) return;

    const q = query(
      collection(db, 'dateConflicts'),
      where('user1Id', '==', userId)
    );

    const q2 = query(
      collection(db, 'dateConflicts'),
      where('user2Id', '==', userId)
    );

    const unsubscribe1 = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setDateConflict({
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        });
      }
    });

    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      if (!snapshot.empty) {
        setDateConflict({
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        });
      }
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [userId, partnerId]);

  // Notificações ficam unificadas em 'notifications'

  return {
    surprises,
    notifications,
    dateConflict,
    partnerProfile,
    loading,
  };
}
