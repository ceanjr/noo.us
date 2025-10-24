import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { loadUserProfile } from '../services/userService';

/**
 * Custom hook para gerenciar estado de autenticação
 * @returns {Object} {user, profile, loading, setProfile}
 */
export function useAuthState() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configurar persistência
    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.error('Erro ao configurar persistência:', error);
      }
    };

    initAuth();

    // Listener de mudanças de autenticação
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Carregar perfil do Firestore
        try {
          const userProfile = await loadUserProfile(currentUser.uid);
          setProfile(userProfile);
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, profile, loading, setProfile };
}
