import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, onSnapshot, query, doc, getDoc } from 'firebase/firestore';

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
      async (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Fetch partner profiles
        const linksWithProfiles = await Promise.all(
          items.map(async (link) => {
            if (!link.partnerId) return link;
            try {
              const partnerDoc = await getDoc(doc(db, 'users', link.partnerId));
              if (partnerDoc.exists()) {
                const partnerData = partnerDoc.data();
                return {
                  ...link,
                  partnerPhotoURL: partnerData.photoURL,
                  partnerAvatarBg: partnerData.avatarBg,
                };
              }
            } catch (error) {
              console.error('Error fetching partner profile:', error);
            }
            return link;
          })
        );

        setLinks(linksWithProfiles);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [userId]);

  return { links, loading };
}

