import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

/**
 * useLinks - Escuta vínculos do usuário em /users/{uid}/links
 * @param {string} [userId] - UID opcional; usa auth.currentUser se omitido
 */
export function useLinks(userId) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) return;

    const q = query(collection(db, 'users', uid, 'links'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLinks(items);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [userId]);

  return { links, loading };
}

