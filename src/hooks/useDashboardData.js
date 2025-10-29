import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { showToast } from '../components/Toast';

export function useDashboardData(userId, partnerId) {
  const [surprises, setSurprises] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Observador em tempo real para o perfil do parceiro
  useEffect(() => {
    if (!partnerId) {
      setPartnerProfile(null);
      return;
    }

    const partnerDocRef = doc(db, 'users', partnerId);
    const unsubscribe = onSnapshot(
      partnerDocRef,
      (doc) => {
        if (doc.exists()) {
          setPartnerProfile(doc.data());
        } else {
          setPartnerProfile(null);
        }
      },
      (error) => {
        console.error("Erro ao observar perfil do parceiro:", error);
        showToast('Erro ao carregar perfil do parceiro.', 'error');
      }
    );

    return () => unsubscribe();
  }, [partnerId]);

  // Observador para surpresas
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'surprises'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(100)
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
        showToast('Erro ao carregar surpresas.', 'error');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Observador para notificações
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notificationsData);
      },
      (error) => {
        console.error('Erro ao carregar notificações:', error);
        showToast('Erro ao carregar notificações.', 'error');
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return {
    surprises,
    notifications,
    partnerProfile,
    loading,
  };
}
